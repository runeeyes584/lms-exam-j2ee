package kaleidoscope.j2ee.examlms.service.impl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kaleidoscope.j2ee.examlms.entity.Payment;
import kaleidoscope.j2ee.examlms.entity.UserCourse;
import kaleidoscope.j2ee.examlms.repository.PaymentRepository;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.service.VNPayPaymentService;
import lombok.RequiredArgsConstructor;

@Service
@Profile("!ui")
@RequiredArgsConstructor
public class VNPayPaymentServiceImpl implements VNPayPaymentService {

    private static final Logger log = LoggerFactory.getLogger(VNPayPaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final UserCourseRepository userCourseRepository;
    private final Environment environment;

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    @Override
    public String createPaymentUrl(String userId, String courseId, long amount) {

        try {

            String effectiveTmnCode = resolveConfigValue("VNPAY_TMN_CODE", tmnCode);
            String effectiveHashSecret = resolveConfigValue("VNPAY_HASH_SECRET", hashSecret);
            String effectivePayUrl = resolveConfigValue("VNPAY_PAY_URL", payUrl);
            String effectiveReturnUrl = normalizeReturnUrl(resolveConfigValue("VNPAY_RETURN_URL", returnUrl));

            String txnRef = UUID.randomUUID().toString();

            // Lưu giao dịch vào DB với trạng thái PENDING
            Payment payment = Payment.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .amount(amount)
                    .transactionId(txnRef)
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();
            paymentRepository.save(payment);

            Map<String, String> params = new HashMap<>();

            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", effectiveTmnCode);
            params.put("vnp_Amount", String.valueOf(amount * 100));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", txnRef);
            params.put("vnp_OrderInfo", "Payment for course " + courseId);
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", effectiveReturnUrl);
            params.put("vnp_IpAddr", "127.0.0.1");

            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            params.put("vnp_CreateDate", formatter.format(new Date()));

            // ===== SORT FIELD NAMES =====
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String field : fieldNames) {
                String value = params.get(field);
                if (value != null && !value.isEmpty()) {

                    String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);

                    hashData.append(field)
                            .append("=")
                            .append(encodedValue)
                            .append("&");

                    query.append(URLEncoder.encode(field, StandardCharsets.UTF_8))
                            .append("=")
                            .append(encodedValue)
                            .append("&");
                }
            }

            hashData.deleteCharAt(hashData.length() - 1);
            query.deleteCharAt(query.length() - 1);

            String secureHash = hmacSHA512(effectiveHashSecret, hashData.toString());

            query.append("&vnp_SecureHash=").append(secureHash);

            String paymentUrl = effectivePayUrl + "?" + query;

            return paymentUrl;

        } catch (Exception e) {
            log.error("Failed to create VNPay payment URL", e);
            throw new RuntimeException("Failed to create VNPay payment URL", e);
        }
    }

    @Override
    @Transactional
    public String handleReturn(Map<String, String> params) {

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        // Tìm giao dịch trong DB theo transactionId
        Payment payment = paymentRepository.findByTransactionId(txnRef)
                .orElse(null);

        if (payment != null) {
            payment.setVnpayResponseCode(responseCode);
            payment.setUpdatedAt(LocalDateTime.now());

            if ("00".equals(responseCode)) {
                payment.setStatus("SUCCESS");
                paymentRepository.save(payment);

                // Enroll user vào khóa học
                boolean alreadyEnrolled = userCourseRepository
                        .findByUserIdAndCourseId(payment.getUserId(), payment.getCourseId())
                        .isPresent();

                if (!alreadyEnrolled) {
                    UserCourse userCourse = UserCourse.builder()
                            .userId(payment.getUserId())
                            .courseId(payment.getCourseId())
                            .enrolledAt(LocalDateTime.now())
                            .progressPercent(0.0)
                            .build();
                    userCourseRepository.save(userCourse);
                }

                return "Payment successful";
            } else {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
            }
        }

        return "Payment failed";
    }

    private String hmacSHA512(String key, String data) throws Exception {

        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);

        byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }

        return sb.toString();
    }

    private String resolveConfigValue(String primaryKey, String fallbackValue) {
        String primaryValue = environment.getProperty(primaryKey);
        if (primaryValue != null && !primaryValue.isBlank()) {
            return primaryValue;
        }
        return fallbackValue;
    }

    private String normalizeReturnUrl(String configuredReturnUrl) {
        if (configuredReturnUrl == null || configuredReturnUrl.isBlank()) {
            return "http://localhost:3000/vnpay/return";
        }

        if (configuredReturnUrl.contains("/api/vnpay/return") || configuredReturnUrl.contains("/api/payment/vnpay/callback")) {
            String frontendBaseUrl = resolveConfigValue("APP_FRONTEND_URL", "http://localhost:3000");
            String normalizedFrontendBaseUrl = frontendBaseUrl.endsWith("/")
                    ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                    : frontendBaseUrl;
            String normalizedUrl = normalizedFrontendBaseUrl + "/vnpay/return";
            log.warn("VNPay returnUrl is legacy API endpoint ({}), auto-normalized to {}", configuredReturnUrl, normalizedUrl);
            return normalizedUrl;
        }

        return configuredReturnUrl;
    }
}
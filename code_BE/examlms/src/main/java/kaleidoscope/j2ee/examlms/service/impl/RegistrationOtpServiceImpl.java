package kaleidoscope.j2ee.examlms.service.impl;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.RegisterRequest;
import kaleidoscope.j2ee.examlms.dto.response.RegistrationInitResponse;
import kaleidoscope.j2ee.examlms.dto.response.UserProfileResponse;
import kaleidoscope.j2ee.examlms.entity.PendingRegistration;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.entity.enums.Role;
import kaleidoscope.j2ee.examlms.exception.AppException;
import kaleidoscope.j2ee.examlms.repository.PendingRegistrationRepository;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.service.RegistrationOtpService;
import kaleidoscope.j2ee.examlms.utils.ResponseCode;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegistrationOtpServiceImpl implements RegistrationOtpService {
    private static final Logger log = LoggerFactory.getLogger(RegistrationOtpServiceImpl.class);

    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.otp.expiry-seconds:600}")
    private int otpExpirySeconds;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    @Value("${app.mail.from:no-reply@examlms.local}")
    private String fromEmail;

    @Override
    public RegistrationInitResponse initiateRegistration(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Email đã tồn tại");
        }

        Instant now = Instant.now();
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(normalizedEmail)
                .orElseGet(PendingRegistration::new);

        if (pending.getId() != null
                && pending.getResendAvailableAt() != null
                && now.isBefore(pending.getResendAvailableAt())) {
            long waitSeconds = Duration.between(now, pending.getResendAvailableAt()).getSeconds();
            throw new AppException(ResponseCode.VALIDATION_ERROR,
                "Vui lòng chờ " + Math.max(waitSeconds, 1) + " giây để gửi lại OTP");
        }

        String otpCode = generateOtpCode();
        Instant otpExpiresAt = now.plusSeconds(otpExpirySeconds);
        Instant resendAvailableAt = now.plusSeconds(resendCooldownSeconds);

        pending.setEmail(normalizedEmail);
        pending.setFullName(request.fullName().trim());
        pending.setPasswordHash(passwordEncoder.encode(request.password()));
        pending.setOtpCode(otpCode);
        pending.setOtpExpiresAt(otpExpiresAt);
        pending.setResendAvailableAt(resendAvailableAt);
        if (pending.getCreatedAt() == null) {
            pending.setCreatedAt(now);
        }
        pending.setUpdatedAt(now);

        pendingRegistrationRepository.save(pending);
        sendOtpEmailAsync(normalizedEmail, otpCode, otpExpirySeconds);

        return RegistrationInitResponse.builder()
                .email(normalizedEmail)
                .resendCooldownSeconds(resendCooldownSeconds)
                .expiresInSeconds(otpExpirySeconds)
                .build();
    }

    @Override
    public UserProfileResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "Không tìm thấy yêu cầu đăng ký"));

        if (pending.getOtpExpiresAt() == null || Instant.now().isAfter(pending.getOtpExpiresAt())) {
            pendingRegistrationRepository.deleteByEmail(normalizedEmail);
            throw new AppException(ResponseCode.VALIDATION_ERROR, "OTP đã hết hạn");
        }

        if (!otp.equals(pending.getOtpCode())) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "OTP không chính xác");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            pendingRegistrationRepository.deleteByEmail(normalizedEmail);
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Email đã tồn tại");
        }

        Instant now = Instant.now();
        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(pending.getPasswordHash())
                .fullName(pending.getFullName())
                .role(Role.STUDENT)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);
        pendingRegistrationRepository.deleteByEmail(normalizedEmail);

        return UserProfileResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .avatarUrl(savedUser.getAvatarUrl())
                .role(savedUser.getRole())
                .phoneNumber(savedUser.getPhoneNumber())
                .dateOfBirth(savedUser.getDateOfBirth())
                .address(savedUser.getAddress())
                .gender(savedUser.getGender())
                .schoolId(savedUser.getSchoolId())
                .build();
    }

    @Override
    public RegistrationInitResponse resendOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "Không tìm thấy yêu cầu đăng ký"));

        Instant now = Instant.now();
        if (pending.getResendAvailableAt() != null && now.isBefore(pending.getResendAvailableAt())) {
            long waitSeconds = Duration.between(now, pending.getResendAvailableAt()).getSeconds();
            throw new AppException(ResponseCode.VALIDATION_ERROR,
                    "Vui lòng chờ " + Math.max(waitSeconds, 1) + " giây để gửi lại OTP");
        }

        String newOtp = generateOtpCode();
        pending.setOtpCode(newOtp);
        pending.setOtpExpiresAt(now.plusSeconds(otpExpirySeconds));
        pending.setResendAvailableAt(now.plusSeconds(resendCooldownSeconds));
        pending.setUpdatedAt(now);

        pendingRegistrationRepository.save(pending);
        sendOtpEmailAsync(normalizedEmail, newOtp, otpExpirySeconds);

        return RegistrationInitResponse.builder()
                .email(normalizedEmail)
                .resendCooldownSeconds(resendCooldownSeconds)
                .expiresInSeconds(otpExpirySeconds)
                .build();
    }

    private String generateOtpCode() {
        int value = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(value);
    }

    private void sendOtpEmailAsync(String toEmail, String otpCode, int expiresInSeconds) {
        CompletableFuture.runAsync(() -> {
            try {
                sendOtpEmail(toEmail, otpCode, expiresInSeconds);
            } catch (Exception ex) {
                log.error("Không thể gửi email OTP tới {}", toEmail, ex);
            }
        });
    }

    private void sendOtpEmail(String toEmail, String otpCode, int expiresInSeconds) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Mã OTP xác thực tài khoản LMS Exam");
        message.setText("Mã OTP của bạn là: " + otpCode + "\n"
                + "Mã có hiệu lực trong " + (expiresInSeconds / 60) + " phút.\n"
                + "Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.");
        mailSender.send(message);
    }
}

package kaleidoscope.j2ee.examlms.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.service.VNPayPaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@Profile("!ui")
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VNPayPaymentController {

    private static final Logger log = LoggerFactory.getLogger(VNPayPaymentController.class);

    private final VNPayPaymentService paymentService;

    @PostMapping("/create")
    public String createPayment(
            @RequestParam String userId,
            @RequestParam String courseId
    ) {
        long amount = 100000; // example 100,000 VND
        log.info("VNPay API /create called: userId={}, courseId={}, amount={}", userId, courseId, amount);
        return paymentService.createPaymentUrl(userId, courseId, amount);
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params) {
        log.info("VNPay API /return called: responseCode={}, txnRef={}",
                params.get("vnp_ResponseCode"),
                params.get("vnp_TxnRef"));
        return paymentService.handleReturn(params);
    }
}
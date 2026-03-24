package kaleidoscope.j2ee.examlms.controller;

import kaleidoscope.j2ee.examlms.service.VNPayPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VNPayPaymentController {

    private final VNPayPaymentService paymentService;

    @PostMapping("/create")
    public String createPayment(
            @RequestParam String userId,
            @RequestParam String courseId
    ) {
        long amount = 100000; // example 100,000 VND
        return paymentService.createPaymentUrl(userId, courseId, amount);
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params) {
        return paymentService.handleReturn(params);
    }
}
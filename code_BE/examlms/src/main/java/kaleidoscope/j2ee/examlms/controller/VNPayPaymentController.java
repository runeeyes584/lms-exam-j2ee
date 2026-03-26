package kaleidoscope.j2ee.examlms.controller;

import java.util.Map;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.repository.CourseRepository;
import kaleidoscope.j2ee.examlms.service.VNPayPaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@Profile("!ui")
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VNPayPaymentController {

    private final VNPayPaymentService paymentService;
    private final CourseRepository courseRepository;

    @PostMapping("/create")
    public String createPayment(
            @RequestParam String userId,
            @RequestParam String courseId
    ) {
        double coursePrice = courseRepository.findByIdAndIsDeletedFalse(courseId)
                .map(course -> course.getPrice() != null ? course.getPrice() : 0.0)
                .orElse(0.0);

        if (coursePrice <= 0) {
            throw new IllegalArgumentException("Course price is invalid or course not found");
        }

        return paymentService.createPaymentUrl(userId, courseId, Math.round(coursePrice));
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params) {
        return paymentService.handleReturn(params);
    }
}
package kaleidoscope.j2ee.examlms.service;

public interface VNPayPaymentService {

    String createPaymentUrl(String userId, String courseId, long amount);

    String handleReturn(java.util.Map<String, String> params);
}
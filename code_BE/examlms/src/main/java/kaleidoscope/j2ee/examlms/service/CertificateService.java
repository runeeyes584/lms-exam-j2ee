package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.response.CertificateResponse;

public interface CertificateService {

    String generateCertificate(String userId, String courseId);

    List<CertificateResponse> getMyCertificates(String userId);

    String getCertificateFile(String userId, String courseId);

}

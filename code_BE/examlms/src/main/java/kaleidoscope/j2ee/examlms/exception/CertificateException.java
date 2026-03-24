package kaleidoscope.j2ee.examlms.exception;

public class CertificateException extends RuntimeException {

    public CertificateException(String message) {
        super(message);
    }

    public CertificateException(String message, Throwable cause) {
        super(message, cause);
    }
}

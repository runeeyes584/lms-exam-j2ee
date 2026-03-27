package kaleidoscope.j2ee.examlms.exception;

/**
 * Thrown when a requested entity is not found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

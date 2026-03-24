package kaleidoscope.j2ee.examlms.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Utility for saving uploaded files to the local filesystem.
 * Files are stored at the path configured in application.properties
 * (app.file.upload-dir).
 */
@Component
public class FileStorageUtil {

    private final Path uploadDir;

    public FileStorageUtil(@Value("${app.file.upload-dir}") String uploadDirPath) throws IOException {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    /**
     * Saves the multipart file and returns the relative file path (UUID + original
     * extension).
     *
     * @param file incoming multipart upload
     * @return relative path like "550e8400-e29b-41d4-a716.pdf"
     */
    public String store(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String storedFileName = UUID.randomUUID() + extension;
        Path targetLocation = this.uploadDir.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return storedFileName;
    }

    /**
     * Returns the absolute Path for a stored file so it can be streamed for
     * download.
     */
    public Path resolve(String fileName) {
        return uploadDir.resolve(fileName).normalize();
    }
}

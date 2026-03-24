package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.response.ExcelImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ExcelImportService {
    
    /**
     * Import questions from Excel file
     * 
     * @param file Excel file (.xlsx)
     * @param createdBy user importing the file
     * @return Import result with success/failure counts
     */
    ExcelImportResponse importQuestions(MultipartFile file, String createdBy);
    
}

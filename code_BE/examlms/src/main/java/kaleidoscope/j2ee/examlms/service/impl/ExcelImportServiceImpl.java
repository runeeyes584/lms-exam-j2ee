package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.QuestionCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExcelImportResponse;
import kaleidoscope.j2ee.examlms.dto.response.QuestionResponse;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.QuestionOption;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import kaleidoscope.j2ee.examlms.service.ExcelImportService;
import kaleidoscope.j2ee.examlms.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportServiceImpl implements ExcelImportService {

    private final QuestionService questionService;

    @Override
    public ExcelImportResponse importQuestions(MultipartFile file, String createdBy) {
        ExcelImportResponse response = new ExcelImportResponse(0, 0, 0);
        String creator = (createdBy == null || createdBy.isBlank()) ? "excel-import" : createdBy;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getPhysicalNumberOfRows() - 1; // Exclude header
            response.setTotalRows(totalRows);

            // Skip header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                try {
                    QuestionCreateRequest questionRequest = parseRowToQuestion(row, i);
                    QuestionResponse savedQuestion = questionService.createQuestion(questionRequest, creator);
                    response.setSuccessCount(response.getSuccessCount() + 1);
                    response.addCreatedQuestionId(savedQuestion.getId());
                    
                } catch (Exception e) {
                    response.setFailureCount(response.getFailureCount() + 1);
                    response.addError("Row " + (i + 1) + ": " + e.getMessage());
                    log.error("Error importing row {}: {}", i + 1, e.getMessage());
                }
            }

        } catch (Exception e) {
            response.addError("File processing error: " + e.getMessage());
            log.error("Error processing Excel file", e);
        }

        return response;
    }

    private QuestionCreateRequest parseRowToQuestion(Row row, int rowIndex) {
        QuestionCreateRequest request = new QuestionCreateRequest();

        try {
            // Column A: Type (MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN)
            String typeStr = getCellValueAsString(row.getCell(0));
            request.setType(QuestionType.valueOf(typeStr.toUpperCase().replace(" ", "_")));

            // Column B: Content
            request.setContent(getCellValueAsString(row.getCell(1)));

            // Column C: Image URL (optional)
            String imageUrl = getCellValueAsString(row.getCell(2));
            if (!imageUrl.isEmpty()) {
                request.setImageUrl(imageUrl);
            }

            // Column D: Difficulty (EASY, MEDIUM, HARD)
            String difficultyStr = getCellValueAsString(row.getCell(3));
            request.setDifficulty(DifficultyLevel.valueOf(difficultyStr.toUpperCase()));

            // Column E: Topics (comma-separated)
            String topicsStr = getCellValueAsString(row.getCell(4));
            if (!topicsStr.isEmpty()) {
                List<String> topics = Arrays.asList(topicsStr.split("\\s*,\\s*"));
                request.setTopics(topics);
            }

            // Column F: Points
            String pointsStr = getCellValueAsString(row.getCell(5));
            if (!pointsStr.isEmpty()) {
                request.setPoints(Double.parseDouble(pointsStr));
            } else {
                request.setPoints(1.0);
            }

            // Column G: Explanation (optional)
            String explanation = getCellValueAsString(row.getCell(6));
            if (!explanation.isEmpty()) {
                request.setExplanation(explanation);
            }

            // Parse options based on question type
            if (request.getType() == QuestionType.MULTIPLE_CHOICE) {
                parseMultipleChoiceOptions(row, request);
            } else if (request.getType() == QuestionType.TRUE_FALSE) {
                parseTrueFalseOptions(row, request);
            } else if (request.getType() == QuestionType.FILL_IN) {
                parseFillInAnswer(row, request);
            }

            return request;

        } catch (Exception e) {
            throw new RuntimeException("Error parsing row data: " + e.getMessage(), e);
        }
    }

    private void parseMultipleChoiceOptions(Row row, QuestionCreateRequest request) {
        List<QuestionOption> options = new ArrayList<>();
        
        // Columns H, I, J, K: Option texts
        // Columns L, M, N, O: isCorrect flags
        for (int i = 0; i < 4; i++) {
            String optionText = getCellValueAsString(row.getCell(7 + i)); // H, I, J, K
            String isCorrectStr = getCellValueAsString(row.getCell(11 + i)); // L, M, N, O
            
            if (!optionText.isEmpty()) {
                QuestionOption option = new QuestionOption();
                option.setText(optionText);
                option.setIsCorrect(parseBoolean(isCorrectStr));
                options.add(option);
            }
        }
        
        if (options.isEmpty()) {
            throw new RuntimeException("MULTIPLE_CHOICE question must have at least one option");
        }
        
        request.setOptions(options);
    }

    private void parseTrueFalseOptions(Row row, QuestionCreateRequest request) {
        List<QuestionOption> options = new ArrayList<>();
        
        // Column H: Correct answer (TRUE/FALSE)
        String correctAnswer = getCellValueAsString(row.getCell(7));
        boolean isTrue = correctAnswer.equalsIgnoreCase("TRUE") || correctAnswer.equalsIgnoreCase("T");
        
        QuestionOption trueOption = new QuestionOption();
        trueOption.setText("True");
        trueOption.setIsCorrect(isTrue);
        options.add(trueOption);
        
        QuestionOption falseOption = new QuestionOption();
        falseOption.setText("False");
        falseOption.setIsCorrect(!isTrue);
        options.add(falseOption);
        
        request.setOptions(options);
    }

    private void parseFillInAnswer(Row row, QuestionCreateRequest request) {
        // Column H: Correct answer
        String correctAnswer = getCellValueAsString(row.getCell(7));
        if (correctAnswer.isEmpty()) {
            throw new RuntimeException("FILL_IN question must have a correct answer");
        }
        request.setCorrectAnswer(correctAnswer);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numValue = cell.getNumericCellValue();
                    // Remove .0 for whole numbers
                    if (numValue == (long) numValue) {
                        return String.valueOf((long) numValue);
                    }
                    return String.valueOf(numValue);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    private boolean parseBoolean(String value) {
        if (value.isEmpty()) {
            return false;
        }
        return value.equalsIgnoreCase("true") 
            || value.equalsIgnoreCase("yes") 
            || value.equalsIgnoreCase("1")
            || value.equalsIgnoreCase("x");
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 7; i++) { // Check first 7 columns
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValueAsString(cell);
                if (!value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}

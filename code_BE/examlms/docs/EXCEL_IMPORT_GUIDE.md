# 📊 Excel Import Format for Questions

## Template Structure

The Excel file must follow this exact column structure:

| Column | Header | Description | Required | Example |
|--------|--------|-------------|----------|---------|
| A | Type | Question type | ✅ Yes | MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN |
| B | Content | Question text | ✅ Yes | What is 2+2? |
| C | ImageUrl | Image URL (optional) | ❌ No | https://example.com/image.png |
| D | Difficulty | Difficulty level | ✅ Yes | RECOGNIZE, UNDERSTAND, APPLY, ANALYZE |
| E | Topics | Comma-separated topics | ❌ No | Math, Algebra, Basics |
| F | Points | Points for question | ❌ No | 1.0 (default) |
| G | Explanation | Answer explanation | ❌ No | 2+2 equals 4 because... |
| H | Option1/Answer | First option or answer | ✅ Yes* | For MC: Option text<br>For TF: TRUE/FALSE<br>For FI: Correct answer |
| I | Option2 | Second option | ❌ No** | Second choice text |
| J | Option3 | Third option | ❌ No** | Third choice text |
| K | Option4 | Fourth option | ❌ No** | Fourth choice text |
| L | IsCorrect1 | First option correct flag | ❌ No** | TRUE, FALSE, 1, 0, X, Yes, No |
| M | IsCorrect2 | Second option correct flag | ❌ No** | TRUE, FALSE, 1, 0, X, Yes, No |
| N | IsCorrect3 | Third option correct flag | ❌ No** | TRUE, FALSE, 1, 0, X, Yes, No |
| O | IsCorrect4 | Fourth option correct flag | ❌ No** | TRUE, FALSE, 1, 0, X, Yes, No |

\* Required for all question types  
\*\* Required only for MULTIPLE_CHOICE type

---

## Question Types

### 1. MULTIPLE_CHOICE
Multiple choice questions with 1-4 options, one or more can be correct.

**Example:**
| Type | Content | ImageUrl | Difficulty | Topics | Points | Explanation | Option1 | Option2 | Option3 | Option4 | IsCorrect1 | IsCorrect2 | IsCorrect3 | IsCorrect4 |
|------|---------|----------|------------|--------|--------|-------------|---------|---------|---------|---------|------------|------------|------------|------------|
| MULTIPLE_CHOICE | What is 2+2? | | RECOGNIZE | Math,Arithmetic | 1 | Basic addition | 3 | 4 | 5 | 6 | FALSE | TRUE | FALSE | FALSE |

---

### 2. TRUE_FALSE
True/False questions. System automatically creates True/False options.

**Example:**
| Type | Content | ImageUrl | Difficulty | Topics | Points | Explanation | Option1/Answer |
|------|---------|----------|------------|--------|--------|-------------|----------------|
| TRUE_FALSE | The Earth is flat | | RECOGNIZE | Geography | 1 | The Earth is spherical | FALSE |

**Notes:**
- Column H accepts: TRUE, T, FALSE, F (case-insensitive)
- System creates two options automatically: "True" and "False"

---

### 3. FILL_IN
Fill-in-the-blank questions. Students type the answer.

**Example:**
| Type | Content | ImageUrl | Difficulty | Topics | Points | Explanation | Option1/Answer |
|------|---------|----------|------------|--------|--------|-------------|----------------|
| FILL_IN | The capital of Vietnam is ___ | | RECOGNIZE | Geography | 1 | Vietnam's capital | Hanoi |

---

## Field Details

### Type (Required)
Valid values:
- `MULTIPLE_CHOICE` - Multiple choice question
- `TRUE_FALSE` - True/false question  
- `FILL_IN` - Fill in the blank

### Difficulty (Required)
Valid values (based on Bloom's Taxonomy):
- `RECOGNIZE` - Recognition/recall level (Nhận biết)
- `UNDERSTAND` - Understanding level (Thông hiểu)
- `APPLY` - Application level (Vận dụng)
- `ANALYZE` - Analysis level (Vận dụng cao)

### Topics (Optional)
- Comma-separated list of topics
- Example: `Java, Spring Boot, REST API`
- Whitespace is trimmed automatically

### Points (Optional)
- Numeric value (integer or decimal)
- Default: `1.0` if not specified
- Example: `1`, `2.5`, `5.0`

### IsCorrect Flags (for MULTIPLE_CHOICE)
Accepted values (case-insensitive):
- `TRUE`, `T`, `YES`, `Y`, `1`, `X` → Correct answer
- `FALSE`, `F`, `NO`, `N`, `0`, (empty) → Incorrect answer

---

## Sample Excel File

Download template: [questions_template.xlsx](./questions_template.xlsx)

### Sample Data

```
Row 1 (Header):
Type | Content | ImageUrl | Difficulty | Topics | Points | Explanation | Option1 | Option2 | Option3 | Option4 | IsCorrect1 | IsCorrect2 | IsCorrect3 | IsCorrect4

Row 2:
MULTIPLE_CHOICE | What is the capital of France? | | RECOGNIZE | Geography,Europe | 1 | Paris is the capital and largest city of France | London | Paris | Berlin | Rome | FALSE | TRUE | FALSE | FALSE

Row 3:
TRUE_FALSE | Java is a compiled language | | UNDERSTAND | Programming,Java | 1 | Java compiles to bytecode | TRUE | | | | | | |

Row 4:
FILL_IN | The chemical symbol for gold is ___ | | RECOGNIZE | Chemistry | 2 | Au comes from Latin 'aurum' | Au | | | | | | |
```

---

## Import API

### Endpoint
```
POST /api/questions/import/excel
```

### Request
- **Content-Type:** `multipart/form-data`
- **Parameter:** `file` (Excel file .xlsx)

### cURL Example
```bash
curl -X POST http://localhost:8080/api/questions/import/excel \
  -H "Content-Type: multipart/form-data" \
  -F "file=@questions.xlsx"
```

### Response
```json
{
  "success": true,
  "message": "Import completed successfully",
  "data": {
    "totalRows": 10,
    "successCount": 9,
    "failureCount": 1,
    "errors": [
      "Row 5: MULTIPLE_CHOICE question must have at least one option"
    ],
    "createdQuestionIds": [
      "65f1a2b3c4d5e6f7g8h9i0j1",
      "65f1a2b3c4d5e6f7g8h9i0j2",
      ...
    ]
  }
}
```

---

## Validation Rules

1. **Type validation:** Must be one of: MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN
2. **Content validation:** Cannot be empty
3. **Difficulty validation:** Must be one of: RECOGNIZE, UNDERSTAND, APPLY, ANALYZE
4. **MULTIPLE_CHOICE validation:**
   - Must have at least 1 option
   - At least 1 option must be marked as correct
5. **TRUE_FALSE validation:**
   - Column H must contain TRUE/FALSE value
6. **FILL_IN validation:**
   - Column H (correct answer) cannot be empty
7. **Image URL validation:** If provided, should be a valid URL format

---

## Error Handling

- Empty rows are automatically skipped
- Failed rows do not stop the import process
- Each error is reported with row number and reason
- Successfully imported questions are saved even if some rows fail
- Response includes IDs of all successfully created questions

---

## Tips

1. **Use the first row for headers** - Row 1 is always skipped
2. **Leave optional cells empty** - Don't use "N/A" or "-"
3. **Boolean values** - Use TRUE/FALSE or 1/0 for clarity
4. **Topics** - Use consistent naming (case-sensitive)
5. **Test with small files first** - Validate your format works
6. **Check response errors** - Fix and re-import failed rows

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Only .xlsx files are supported" | Save file as Excel 2007+ format (.xlsx) |
| "MULTIPLE_CHOICE question must have at least one option" | Add at least one option in columns H-K |
| "Error parsing row data" | Check column formats match specification |
| "FILL_IN question must have a correct answer" | Add answer in column H |
| "Invalid enum value" | Check Type uses MULTIPLE_CHOICE/TRUE_FALSE/FILL_IN and Difficulty uses RECOGNIZE/UNDERSTAND/APPLY/ANALYZE |

---

**Last Updated:** Phase 3 Implementation  
**Version:** 1.0

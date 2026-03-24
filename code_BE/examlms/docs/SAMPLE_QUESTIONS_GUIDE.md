# 📝 Sample Questions - Quick Reference

## How to Create Excel File from CSV

### Method 1: Using Excel (Recommended)
1. Open `sample_questions.csv` in Microsoft Excel
2. Click **File** → **Save As**
3. Choose format: **Excel Workbook (*.xlsx)**
4. Save as `sample_questions.xlsx`

### Method 2: Using Google Sheets
1. Open Google Sheets
2. **File** → **Import** → Upload `sample_questions.csv`
3. **File** → **Download** → Microsoft Excel (.xlsx)

---

## Sample Data Included (15 Questions)

### Multiple Choice (6 questions)
1. ✅ Capital of France - Single correct answer
2. ✅ Programming languages - Multiple correct answers
3. ✅ What is 2+2? - Basic arithmetic
4. ✅ HTTP idempotent methods - Multiple correct
5. ✅ REST definition - Acronym question
6. ✅ Creational design patterns - Multiple correct

### True/False (6 questions)
1. ✅ Java compilation
2. ✅ Earth is flat
3. ✅ MongoDB type
4. ✅ Spring Boot XML config
5. ✅ JSON acronym

### Fill in the Blank (4 questions)
1. ✅ Chemical symbol for gold
2. ✅ Capital of Vietnam
3. ✅ Java constant keyword
4. ✅ HTTP default port

---

## Testing the Import

### Step 1: Convert CSV to XLSX
```bash
# Open sample_questions.csv in Excel
# Save as sample_questions.xlsx
```

### Step 2: Start the Server
```bash
cd E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms
.\mvnw.cmd spring-boot:run
```

### Step 3: Import via API

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/questions/import/excel ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@sample_questions.xlsx"
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:8080/api/questions/import/excel`
3. Body → form-data
4. Key: `file` (type: File)
5. Value: Select `sample_questions.xlsx`
6. Click Send

**Using Swagger UI:**
1. Go to: http://localhost:8080/swagger-ui.html
2. Find: **POST /api/questions/import/excel**
3. Click "Try it out"
4. Choose file: `sample_questions.xlsx`
5. Click "Execute"

---

## Expected Response

### Success Response
```json
{
  "success": true,
  "message": "Import completed successfully",
  "data": {
    "totalRows": 15,
    "successCount": 15,
    "failureCount": 0,
    "errors": [],
    "createdQuestionIds": [
      "65f1a2b3...",
      "65f1a2b4...",
      ...
    ]
  }
}
```

### Partial Success Response
```json
{
  "success": true,
  "message": "Import completed with some errors",
  "data": {
    "totalRows": 15,
    "successCount": 12,
    "failureCount": 3,
    "errors": [
      "Row 5: MULTIPLE_CHOICE question must have at least one option",
      "Row 8: Invalid enum value for difficulty: SUPER_HARD",
      "Row 12: Content cannot be empty"
    ],
    "createdQuestionIds": [...]
  }
}
```

---

## Verify Import Success

### Check via API
```bash
# Get all questions
curl http://localhost:8080/api/questions

# Search by topic
curl "http://localhost:8080/api/questions/search/topics?topics=Java,Programming"

# Search by difficulty
curl "http://localhost:8080/api/questions/search/difficulty?difficulty=EASY"
```

### Check via Swagger
http://localhost:8080/swagger-ui.html

### Check MongoDB
Connect to your MongoDB Atlas cluster and verify the `questions` collection has 15 new documents.

---

## Customizing Sample Data

You can edit `sample_questions.csv` to add more questions:

1. Keep the header row (row 1) unchanged
2. Add new rows following the format
3. Save and convert to .xlsx
4. Re-import

---

## Tips

✅ **DO:**
- Use consistent topic names (case-sensitive)
- Leave empty cells blank (don't use "N/A")
- Use TRUE/FALSE for boolean values
- Test with small batches first

❌ **DON'T:**
- Don't change column order
- Don't skip required columns
- Don't use special characters in headers
- Don't delete the header row

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CSV doesn't open in Excel | Right-click → Open With → Excel |
| Import returns 400 error | Check file is .xlsx format |
| Some rows fail | Check error messages in response |
| All rows fail | Verify header row is correct |

---

**Ready to test?** Convert the CSV to XLSX and try the import! 🚀

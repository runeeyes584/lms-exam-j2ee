# 📝 Exam Management & Auto-Generator API Guide

## Overview
Phase 4 implementation includes manual exam creation and **automatic exam generation** based on difficulty matrix and topics.

---

## 🎯 Key Features

### 1. Manual Exam Creation
- Select questions manually
- Set duration, passing score
- Assign to course

### 2. Auto-Generate Exams ⭐ (Main Feature)
- Define difficulty distribution (matrix)
- Specify topics to include
- System randomly selects questions
- Calculates total points automatically
- No duplicate questions

### 3. Exam Management
- Update unpublished exams
- Delete unpublished exams
- Publish/Unpublish exams
- List by course, creator, or status

---

## 📊 API Endpoints

### Base URL
```
http://localhost:8080/api/exams
```

---

## 1️⃣ Create Exam Manually

**Endpoint:** `POST /api/exams`

**Request Body:**
```json
{
  "title": "Midterm Exam - Java Programming",
  "description": "Midterm exam covering OOP concepts",
  "courseId": "CS101",
  "duration": 60,
  "passingScore": 60.0,
  "generationType": "MANUAL",
  "questions": [
    {
      "questionId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "order": 1
    },
    {
      "questionId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "order": 2
    }
  ]
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Exam created successfully",
  "result": {
    "id": "67xyz123abc",
    "title": "Midterm Exam - Java Programming",
    "duration": 60,
    "passingScore": 60.0,
    "totalPoints": 10.0,
    "questions": [...],
    "generationType": "MANUAL",
    "isPublished": false,
    "createdBy": "admin",
    "createdAt": "2026-03-23T14:00:00"
  }
}
```

---

## 2️⃣ Auto-Generate Exam ⭐ (Main Feature)

**Endpoint:** `POST /api/exams/generate`

**Request Body:**
```json
{
  "title": "Final Exam - Java Programming",
  "description": "Auto-generated final exam",
  "courseId": "CS101",
  "duration": 90,
  "passingScore": 70.0,
  "topics": ["Java", "Programming", "OOP"],
  "difficultyDistribution": {
    "RECOGNIZE": 5,
    "UNDERSTAND": 4,
    "APPLY": 3,
    "ANALYZE": 2
  }
}
```

**Explanation:**
- **topics**: Questions must have at least one of these topics
- **difficultyDistribution**: Number of questions per difficulty level
  - RECOGNIZE: 5 questions (easy recall)
  - UNDERSTAND: 4 questions (comprehension)
  - APPLY: 3 questions (application)
  - ANALYZE: 2 questions (analysis)
- Total: 14 questions will be randomly selected

**Response:**
```json
{
  "code": 1000,
  "message": "Exam generated successfully",
  "result": {
    "id": "67xyz456def",
    "title": "Final Exam - Java Programming",
    "duration": 90,
    "totalPoints": 28.0,
    "questions": [
      {"questionId": "...", "order": 1},
      {"questionId": "...", "order": 2},
      ...
    ],
    "generationType": "AUTO",
    "isPublished": false
  }
}
```

---

## 3️⃣ Update Exam

**Endpoint:** `PUT /api/exams/{id}`

**Note:** Only unpublished exams can be updated

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "duration": 75,
  "passingScore": 65.0,
  "questions": [...]
}
```

---

## 4️⃣ Publish Exam

**Endpoint:** `POST /api/exams/{id}/publish`

**Description:** Make exam available for students to take

**Response:**
```json
{
  "code": 1000,
  "message": "Exam published successfully",
  "result": {
    "id": "67xyz456def",
    "isPublished": true
  }
}
```

---

## 5️⃣ Unpublish Exam

**Endpoint:** `POST /api/exams/{id}/unpublish`

**Description:** Make exam unavailable for students

---

## 6️⃣ Get All Exams

**Endpoint:** `GET /api/exams`

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `sortBy`: Sort field (default: createdAt)
- `direction`: ASC or DESC (default: DESC)

**Example:**
```
GET /api/exams?page=0&size=10&sortBy=title&direction=ASC
```

---

## 7️⃣ Get Exam by ID

**Endpoint:** `GET /api/exams/{id}`

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "67xyz456def",
    "title": "Final Exam",
    "questions": [...]
  }
}
```

---

## 8️⃣ Get Exams by Course

**Endpoint:** `GET /api/exams/course/{courseId}`

**Example:**
```
GET /api/exams/course/CS101
```

---

## 9️⃣ Get Published Exams

**Endpoint:** `GET /api/exams/published`

**Description:** Get all exams available for students

---

## 🔟 Get My Exams

**Endpoint:** `GET /api/exams/my-exams`

**Headers:**
- `X-User-Id`: Your user ID (default: admin)

---

## 🔟➕1️⃣ Delete Exam

**Endpoint:** `DELETE /api/exams/{id}`

**Note:** Only unpublished exams can be deleted

---

## 🧪 Testing Workflow

### Prerequisites
1. Server running: `.\mvnw.cmd spring-boot:run`
2. Questions imported (from Phase 3)

---

### Test Scenario 1: Manual Exam Creation

**Step 1:** Get some question IDs
```bash
curl http://localhost:8080/api/questions
```
Copy 3-4 question IDs from response

**Step 2:** Create manual exam
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Manual Exam",
    "duration": 30,
    "passingScore": 50.0,
    "questions": [
      {"questionId": "YOUR_QUESTION_ID_1", "order": 1},
      {"questionId": "YOUR_QUESTION_ID_2", "order": 2}
    ]
  }'
```

**Step 3:** Verify exam created
```bash
curl http://localhost:8080/api/exams
```

---

### Test Scenario 2: Auto-Generate Exam (Main Feature)

**Step 1:** Check available questions by topic
```bash
curl "http://localhost:8080/api/questions/search/topics?topics=Java"
curl "http://localhost:8080/api/questions/search/topics?topics=Programming"
```

**Step 2:** Generate exam
```bash
curl -X POST http://localhost:8080/api/exams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto-Generated Java Exam",
    "description": "Testing auto-generation",
    "duration": 60,
    "passingScore": 70.0,
    "topics": ["Java", "Programming"],
    "difficultyDistribution": {
      "RECOGNIZE": 3,
      "UNDERSTAND": 2,
      "APPLY": 1
    }
  }'
```

**Expected:**
- 6 questions randomly selected
- 3 RECOGNIZE level
- 2 UNDERSTAND level
- 1 APPLY level
- Total points calculated automatically
- No duplicate questions

**Step 3:** Verify exam details
```bash
curl http://localhost:8080/api/exams/{EXAM_ID}
```

---

### Test Scenario 3: Publish/Unpublish

**Step 1:** Publish exam
```bash
curl -X POST http://localhost:8080/api/exams/{EXAM_ID}/publish
```

**Step 2:** Verify it appears in published list
```bash
curl http://localhost:8080/api/exams/published
```

**Step 3:** Try to update (should fail)
```bash
curl -X PUT http://localhost:8080/api/exams/{EXAM_ID} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated"}'
```
Expected: Error message "Cannot update published exam"

**Step 4:** Unpublish first
```bash
curl -X POST http://localhost:8080/api/exams/{EXAM_ID}/unpublish
```

**Step 5:** Now update should work
```bash
curl -X PUT http://localhost:8080/api/exams/{EXAM_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "duration": 45,
    "questions": [...]
  }'
```

---

## 📋 Swagger UI Testing

1. Open: **http://localhost:8080/swagger-ui.html**
2. Find: **Exam Management** section
3. Try each endpoint interactively

---

## ⚠️ Validation Rules

### Manual Creation
- ✅ Must have at least 1 question
- ✅ All question IDs must exist
- ✅ Duration > 0
- ❌ Cannot update published exams
- ❌ Cannot delete published exams

### Auto-Generation
- ✅ Topics list cannot be empty
- ✅ Difficulty distribution required
- ✅ Total questions > 0
- ⚠️ If not enough questions available, uses what it can find
- ✅ No duplicate questions

---

## 🔍 Error Handling

### Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| "Exam must have at least one question" | Empty questions list | Add at least 1 question |
| "Question not found with id: ..." | Invalid question ID | Use existing question IDs |
| "Cannot update published exam" | Exam is published | Unpublish first |
| "Not enough questions available" | Not enough questions match criteria | Reduce required count or add more questions |
| "Difficulty distribution is required" | Empty distribution | Provide at least one difficulty level |

---

## 💡 Tips

1. **Import questions first** (Phase 3) before creating exams
2. **Use diverse topics** when importing to enable flexible generation
3. **Check available questions** before generating to avoid "not enough" errors
4. **Test generation with small numbers** first (2-3 per difficulty)
5. **Unpublish before editing** to avoid errors
6. **Published exams are read-only** to prevent changes during student attempts

---

## 🎯 Next Steps (Phase 5)

After testing exam management:
- Phase 5: Exam Taking & Auto-Grading
- Students start exams
- Timer enforcement
- Auto-grading for MC/TF/Fill-in
- Save attempt history

---

**Ready to test?** Start server and try the APIs! 🚀

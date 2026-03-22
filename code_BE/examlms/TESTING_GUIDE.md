# Question API Testing Workflow

## ✅ Test Checklist

### 1. CREATE - POST /api/questions
**Test Case 1.1: Create Single Choice Question**
```json
POST http://localhost:8080/api/questions
Content-Type: application/json

{
  "type": "SINGLE_CHOICE",
  "content": "Java là ngôn ngữ lập trình gì?",
  "options": [
    {"text": "Ngôn ngữ biên dịch", "isCorrect": false},
    {"text": "Ngôn ngữ thông dịch", "isCorrect": false},
    {"text": "Ngôn ngữ biên dịch và thông dịch", "isCorrect": true},
    {"text": "Ngôn ngữ kịch bản", "isCorrect": false}
  ],
  "explanation": "Java được biên dịch thành bytecode và sau đó được JVM thông dịch",
  "difficulty": "UNDERSTAND",
  "topics": ["Java", "Programming Basics"],
  "points": 1.0
}
```
✅ Expected: 201 Created, trả về question với ID

**Test Case 1.2: Create Multiple Choice Question**
```json
{
  "type": "MULTIPLE_CHOICE",
  "content": "Những framework nào sau đây là của Java?",
  "options": [
    {"text": "Spring Boot", "isCorrect": true},
    {"text": "Django", "isCorrect": false},
    {"text": "Hibernate", "isCorrect": true},
    {"text": "Laravel", "isCorrect": false}
  ],
  "explanation": "Spring Boot và Hibernate là Java frameworks",
  "difficulty": "APPLY",
  "topics": ["Java", "Frameworks"],
  "points": 2.0
}
```
✅ Expected: 201 Created

**Test Case 1.3: Create True/False Question**
```json
{
  "type": "TRUE_FALSE",
  "content": "MongoDB là cơ sở dữ liệu NoSQL",
  "options": [
    {"text": "Đúng", "isCorrect": true},
    {"text": "Sai", "isCorrect": false}
  ],
  "explanation": "MongoDB là database NoSQL dạng document-oriented",
  "difficulty": "RECOGNIZE",
  "topics": ["MongoDB", "Database"],
  "points": 0.5
}
```
✅ Expected: 201 Created

**Test Case 1.4: Create Fill-In Question**
```json
{
  "type": "FILL_IN",
  "content": "REST API sử dụng giao thức _______",
  "options": [],
  "correctAnswer": "HTTP",
  "explanation": "REST API hoạt động trên giao thức HTTP/HTTPS",
  "difficulty": "RECOGNIZE",
  "topics": ["REST API", "Web Development"],
  "points": 1.0
}
```
✅ Expected: 201 Created

**Test Case 1.5: Validation - Missing required fields**
```json
{
  "type": "SINGLE_CHOICE",
  "content": ""
}
```
❌ Expected: 400 Bad Request với error message

**Test Case 1.6: Validation - Single choice with multiple correct answers**
```json
{
  "type": "SINGLE_CHOICE",
  "content": "Test validation",
  "options": [
    {"text": "A", "isCorrect": true},
    {"text": "B", "isCorrect": true}
  ],
  "difficulty": "RECOGNIZE",
  "topics": ["Test"],
  "points": 1.0
}
```
❌ Expected: 500 Error "Single choice questions must have exactly one correct answer"

---

### 2. READ - GET /api/questions
**Test Case 2.1: Get all questions (paginated)**
```
GET http://localhost:8080/api/questions?page=0&size=10
```
✅ Expected: 200 OK, Page<QuestionResponse> với total, content, pageable

**Test Case 2.2: Get with sorting**
```
GET http://localhost:8080/api/questions?page=0&size=10&sortBy=points&direction=DESC
```
✅ Expected: Questions sorted by points descending

**Test Case 2.3: Get question by ID**
```
GET http://localhost:8080/api/questions/{id}
```
(Thay {id} bằng ID thực từ response POST)
✅ Expected: 200 OK, QuestionResponse

**Test Case 2.4: Get non-existent question**
```
GET http://localhost:8080/api/questions/invalid-id-123
```
❌ Expected: 500 Error "Question not found"

---

### 3. UPDATE - PUT /api/questions/{id}
**Test Case 3.1: Update existing question**
```json
PUT http://localhost:8080/api/questions/{id}
Content-Type: application/json

{
  "type": "SINGLE_CHOICE",
  "content": "Java là ngôn ngữ lập trình gì? (UPDATED)",
  "options": [
    {"text": "Ngôn ngữ biên dịch", "isCorrect": false},
    {"text": "Ngôn ngữ thông dịch", "isCorrect": false},
    {"text": "Ngôn ngữ biên dịch và thông dịch", "isCorrect": true},
    {"text": "Ngôn ngữ kịch bản", "isCorrect": false}
  ],
  "explanation": "Java được biên dịch thành bytecode và sau đó được JVM thông dịch (Updated explanation)",
  "difficulty": "APPLY",
  "topics": ["Java", "Programming Basics", "Updated"],
  "points": 1.5
}
```
✅ Expected: 200 OK, question updated

---

### 4. SEARCH - Various search endpoints
**Test Case 4.1: Search by topics**
```
GET http://localhost:8080/api/questions/search/topics?topics=Java&topics=MongoDB
```
✅ Expected: List of questions containing Java OR MongoDB in topics

**Test Case 4.2: Search by difficulty**
```
GET http://localhost:8080/api/questions/search/difficulty?difficulty=RECOGNIZE
```
✅ Expected: All questions with difficulty RECOGNIZE

**Test Case 4.3: Advanced search (topics + difficulty)**
```
GET http://localhost:8080/api/questions/search/advanced?topics=Java&difficulty=APPLY
```
✅ Expected: Questions with Java topic AND APPLY difficulty

**Test Case 4.4: Search by type**
```
GET http://localhost:8080/api/questions/search/type?type=FILL_IN
```
✅ Expected: All FILL_IN questions

**Test Case 4.5: Get my questions**
```
GET http://localhost:8080/api/questions/my-questions?page=0&size=10
Header: X-User-Id: admin
```
✅ Expected: Questions created by "admin"

---

### 5. DELETE - DELETE /api/questions/{id}
**Test Case 5.1: Delete existing question**
```
DELETE http://localhost:8080/api/questions/{id}
```
✅ Expected: 200 OK, message "Question deleted successfully"

**Test Case 5.2: Verify deletion**
```
GET http://localhost:8080/api/questions/{id}
```
❌ Expected: 500 Error "Question not found"

**Test Case 5.3: Delete non-existent question**
```
DELETE http://localhost:8080/api/questions/invalid-id
```
❌ Expected: 500 Error "Question not found"

---

## 🎯 Testing Workflow (Recommended Order)

1. **CREATE** 4 questions (1 of each type) → Save IDs
2. **GET ALL** → Verify count = 4
3. **GET BY ID** → Pick one ID and verify details
4. **SEARCH BY TOPICS** → Try "Java" → Should return 2-3 questions
5. **SEARCH BY DIFFICULTY** → Try "RECOGNIZE" → Should return 2 questions
6. **SEARCH BY TYPE** → Try each type
7. **UPDATE** → Update one question, verify changes
8. **DELETE** → Delete one question
9. **GET ALL** again → Verify count = 3

---

## 📝 Notes for Tester
- Save response IDs after creating questions (you'll need them for UPDATE/DELETE)
- All enum values: 
  - QuestionType: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN`
  - DifficultyLevel: `RECOGNIZE`, `UNDERSTAND`, `APPLY`, `ANALYZE`
- Default user-id header: `X-User-Id: admin`
- Image URL validation: Must match pattern `^https?://.*\.(jpg|jpeg|png|gif|webp)$`

---

## ✅ Success Criteria
- [ ] All 4 question types can be created
- [ ] Validation works (prevents invalid data)
- [ ] Pagination works correctly
- [ ] All search endpoints return correct results
- [ ] Update modifies question correctly
- [ ] Delete removes question
- [ ] Error handling works (404, 400, 500)

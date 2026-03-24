# 📝 Manual Grading Guide - Phase 6

## Overview
Phase 6 provides manual grading capabilities for instructors to review, override, and finalize exam scores.

---

## 🎯 Use Cases

### When to Use Manual Grading?

1. **Review Auto-Graded Results** - Double-check automated scoring
2. **Partial Credit** - Award partial points for nearly-correct answers
3. **Override Scores** - Adjust scores based on instructor judgment
4. **Fill-in Variations** - Accept alternative correct answers
5. **Future Essay Questions** - Grade subjective responses (not yet implemented)

---

## 📊 API Endpoints

### Base URL
```
http://localhost:8080/api/grading
```

---

## 1️⃣ Get Attempts Needing Grading

**Endpoint:** `GET /api/grading/pending`

**Description:** Get all submitted attempts across all exams that need review

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "content": [
      {
        "id": "attempt123",
        "examId": "exam456",
        "studentId": "student1",
        "submittedAt": "2026-03-23T14:30:00",
        "autoGradedScore": 15.0,
        "manualGradedScore": null,
        "totalScore": null,
        "status": "SUBMITTED"
      }
    ],
    "totalElements": 5
  }
}
```

---

## 2️⃣ Get Attempts by Exam

**Endpoint:** `GET /api/grading/pending/exam/{examId}`

**Description:** Get submitted attempts for a specific exam

**Example:**
```
GET /api/grading/pending/exam/exam456
```

---

## 3️⃣ Get Grading Details ⭐

**Endpoint:** `GET /api/grading/details/{attemptId}`

**Description:** Get detailed grading information including all questions

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "attemptId": "attempt123",
    "examId": "exam456",
    "studentId": "student1",
    "autoGradedScore": 15.0,
    "manualGradedScore": 0.0,
    "totalScore": 15.0,
    "totalQuestions": 10,
    "gradedQuestions": 10,
    "pendingQuestions": 0,
    "questionGrades": {
      "q1": {
        "questionId": "q1",
        "questionContent": "What is Java?",
        "studentAnswer": "A programming language",
        "correctAnswer": "A programming language",
        "maxPoints": 2.0,
        "earnedPoints": 2.0,
        "isAutoGraded": true,
        "needsManualReview": false,
        "accepted": true,
        "feedback": null
      },
      "q2": {
        "questionId": "q2",
        "questionContent": "Capital of Vietnam is ___",
        "studentAnswer": "hanoi",
        "correctAnswer": "Hanoi",
        "maxPoints": 1.0,
        "earnedPoints": 1.0,
        "isAutoGraded": true,
        "needsManualReview": false,
        "accepted": true
      }
    }
  }
}
```

---

## 4️⃣ Grade Single Question

**Endpoint:** `POST /api/grading/question?attemptId={attemptId}`

**Description:** Manually grade or override score for one question

**Request Body:**
```json
{
  "questionId": "q2",
  "score": 0.5,
  "feedback": "Correct answer but wrong capitalization. Partial credit given.",
  "accepted": true
}
```

**Response:**
Returns updated `GradingDetailResponse` with new score

---

## 5️⃣ Grade Multiple Questions

**Endpoint:** `POST /api/grading/attempt`

**Description:** Grade multiple questions at once

**Request Body:**
```json
{
  "attemptId": "attempt123",
  "questionScores": {
    "q1": 2.0,
    "q2": 0.5,
    "q3": 1.0
  }
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Attempt graded successfully",
  "result": {
    "id": "attempt123",
    "autoGradedScore": 15.0,
    "manualGradedScore": 3.5,
    "totalScore": 18.5,
    "status": "GRADED",
    "gradedBy": "instructor1",
    "gradedAt": "2026-03-23T15:00:00"
  }
}
```

---

## 6️⃣ Finalize Grading

**Endpoint:** `POST /api/grading/finalize/{attemptId}`

**Description:** Mark grading as complete and set final score

**When to use:**
- After reviewing all auto-graded answers
- After manually grading fill-in questions
- Ready to release scores to student

**Response:**
```json
{
  "code": 1000,
  "message": "Grading finalized successfully",
  "result": {
    "id": "attempt123",
    "totalScore": 18.5,
    "status": "GRADED",
    "gradedBy": "instructor1",
    "gradedAt": "2026-03-23T15:05:00"
  }
}
```

---

## 🔄 Grading Workflow

### Typical Instructor Workflow:

1. **View Pending Attempts**
   ```
   GET /api/grading/pending
   ```

2. **Get Grading Details**
   ```
   GET /api/grading/details/{attemptId}
   ```
   
3. **Review Each Question**
   - Check auto-graded scores
   - Look for questions needing adjustment

4. **Grade/Override Questions** (if needed)
   ```
   POST /api/grading/question?attemptId=...
   {
     "questionId": "q5",
     "score": 1.5,
     "feedback": "Good explanation, partial credit",
     "accepted": true
   }
   ```

5. **Finalize Grading**
   ```
   POST /api/grading/finalize/{attemptId}
   ```

6. **Student Can Now View Results**
   ```
   GET /api/attempts/{attemptId}/review
   ```

---

## 🎨 Swagger UI Testing

### Test Manual Grading:

1. **Start:** http://localhost:8080/swagger-ui.html

2. **Find section:** "Manual Grading"

3. **Get Pending Attempts:**
   - Click: `GET /api/grading/pending`
   - Execute
   - Copy an attempt ID

4. **View Details:**
   - Click: `GET /api/grading/details/{attemptId}`
   - Paste attempt ID
   - Execute
   - Review all questions and scores

5. **Override a Score:**
   - Click: `POST /api/grading/question`
   - attemptId: (paste ID)
   - Request body:
   ```json
   {
     "questionId": "PASTE_QUESTION_ID",
     "score": 1.5,
     "feedback": "Partial credit for good effort",
     "accepted": true
   }
   ```
   - Execute

6. **Finalize:**
   - Click: `POST /api/grading/finalize/{attemptId}`
   - Paste attempt ID
   - Execute

---

## 📋 Grading Scenarios

### Scenario 1: Accept All Auto-Graded

If auto-grading is correct, just finalize:

```bash
POST /api/grading/finalize/{attemptId}
```

---

### Scenario 2: Override One Question

Student wrote "hanoi" instead of "Hanoi" (case difference):

```json
POST /api/grading/question?attemptId=attempt123
{
  "questionId": "q2",
  "score": 1.0,
  "feedback": "Correct answer, accepted despite case difference",
  "accepted": true
}
```

Then finalize:
```bash
POST /api/grading/finalize/attempt123
```

---

### Scenario 3: Grade Multiple Questions

Grade several fill-in questions at once:

```json
POST /api/grading/attempt
{
  "attemptId": "attempt123",
  "questionScores": {
    "q1": 2.0,
    "q2": 1.5,
    "q3": 0.5,
    "q4": 2.0
  }
}
```

This automatically finalizes grading (status → GRADED)

---

## 🔍 Score Calculation

### Total Score Formula:
```
Total Score = Auto-Graded Score + Manual-Graded Score
```

### Example:
- Exam has 10 questions
- 8 multiple choice (auto-graded): 16 points
- 2 fill-in (manual graded): 3.5 points
- **Total: 19.5 points**

---

## ⚠️ Validation Rules

### Score Validation:
- ✅ Score ≥ 0
- ✅ Score ≤ Question max points
- ❌ Cannot grade IN_PROGRESS attempts
- ❌ Score cannot be negative

### Status Requirements:
- Can grade: `SUBMITTED` status
- Cannot grade: `IN_PROGRESS` status
- After grading: `GRADED` status

---

## 💡 Best Practices

1. **Review Before Finalizing**
   - Always check grading details first
   - Verify auto-graded answers
   - Look for edge cases

2. **Provide Feedback**
   - Add helpful comments for students
   - Explain partial credit decisions
   - Be consistent across students

3. **Batch Grading**
   - Use `/grading/pending/exam/{examId}` to grade one exam at a time
   - Grade similar questions together
   - Use bulk grading for efficiency

4. **Double-Check Calculations**
   - Verify total score = auto + manual
   - Ensure no question exceeds max points
   - Check grading is finalized before release

---

## 🎯 Common Use Cases

### Use Case 1: Accept Alternative Answer

**Question:** "Capital of Vietnam is ___"  
**Expected:** "Hanoi"  
**Student wrote:** "Ha Noi" (with space)

**Solution:**
```json
POST /api/grading/question?attemptId=...
{
  "questionId": "q2",
  "score": 1.0,
  "feedback": "Alternative spelling accepted",
  "accepted": true
}
```

---

### Use Case 2: Partial Credit

**Question:** "Explain OOP concepts" (2 points)  
**Student:** Mentioned only 2 out of 4 concepts

**Solution:**
```json
{
  "questionId": "q5",
  "score": 1.0,
  "feedback": "Correct but incomplete. Mentioned 2/4 concepts.",
  "accepted": true
}
```

---

### Use Case 3: Reject Incorrect Answer

**Question:** Fill-in question (1 point)  
**Student:** Wrong answer

**Solution:**
```json
{
  "questionId": "q3",
  "score": 0.0,
  "feedback": "Incorrect. The correct answer is...",
  "accepted": false
}
```

---

## ✅ Success Criteria

After Phase 6, you should be able to:

✅ View all attempts needing grading  
✅ See detailed grading breakdown  
✅ Override auto-graded scores  
✅ Award partial credit  
✅ Provide feedback on answers  
✅ Finalize grading for release  
✅ Batch grade multiple questions  

---

## 🚀 Ready for Frontend!

Backend is now complete with:
- ✅ Question Management
- ✅ Excel Import
- ✅ Exam Auto-Generation
- ✅ Exam Taking & Auto-Grading
- ✅ Manual Grading & Review

**Next:** Build frontend UI! 🎨

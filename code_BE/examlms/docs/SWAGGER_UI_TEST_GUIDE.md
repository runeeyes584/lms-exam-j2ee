# 🎨 Swagger UI Testing Guide - Exam Management & Auto-Generation

## 🚀 Quick Start

### Step 1: Start Server
```bash
cd E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms
.\mvnw.cmd spring-boot:run
```

Wait until you see: `Started ExamlmsApplication`

### Step 2: Open Swagger UI
Open your browser and navigate to:
```
http://localhost:8080/swagger-ui.html
```

You should see the Swagger interface with sections:
- **Question Management** (Phase 3 - Already done)
- **Exam Management** (Phase 4 - NEW!)

---

## 📋 Test Flow (Step-by-Step)

### ✅ Part 1: Verify Questions Available
### ✅ Part 2: Test Manual Exam Creation  
### ✅ Part 3: Test Auto-Generate Exam ⭐ (Main Feature)
### ✅ Part 4: Test Publish/Unpublish
### ✅ Part 5: Test Update/Delete

---

## 🔍 Part 1: Verify Questions Available

Before creating exams, verify you have questions imported.

### Step 1.1: Get All Questions

1. Scroll to section: **"Question Management"**
2. Find and click: **GET /api/questions**
3. Click the blue **"Try it out"** button
4. Leave default values (page=0, size=20)
5. Click green **"Execute"** button
6. Scroll down to see Response

**✅ Expected:** See list of questions with their IDs

📝 **IMPORTANT:** Copy 2-3 question IDs from the response - you'll need them!

Example: `"id": "65f1a2b3c4d5e6f7g8h9i0j1"`

---

### Step 1.2: Check Questions by Topic

1. Find: **GET /api/questions/search/topics**
2. Click **"Try it out"**
3. In the **topics** field (it's an array), click **"Add string item"**
4. Enter: `Java`
5. Click **"Add string item"** again
6. Enter: `Programming`
7. Click **"Execute"**

**✅ Expected:** See questions with Java or Programming topics

---

## 🎯 Part 2: Test Manual Exam Creation

### Step 2.1: Create Manual Exam

1. Scroll down to section: **"Exam Management"**
2. Find and click: **POST /api/exams**
3. Click **"Try it out"**
4. In **X-User-Id** parameter, leave as: `admin`
5. Clear the example in Request body and paste this:

```json
{
  "title": "My First Manual Exam",
  "description": "Testing manual exam creation via Swagger",
  "courseId": "CS101",
  "duration": 30,
  "passingScore": 50.0,
  "generationType": "MANUAL",
  "questions": [
    {
      "questionId": "PASTE_QUESTION_ID_HERE",
      "order": 1
    },
    {
      "questionId": "PASTE_ANOTHER_QUESTION_ID_HERE",
      "order": 2
    }
  ]
}
```

6. **REPLACE** `PASTE_QUESTION_ID_HERE` with actual question IDs from Step 1.1
7. Click **"Execute"**

**✅ Expected Response:**
- Response code: **201**
- Body contains your new exam with:
  - `"id"`: Generated exam ID
  - `"totalPoints"`: Auto-calculated
  - `"isPublished": false`
  - `"generationType": "MANUAL"`

📝 **Copy the exam ID** from the response!

---

## ⭐ Part 3: Auto-Generate Exam (KEY FEATURE)

This is the **main feature** of Phase 4!

### Step 3.1: Simple Auto-Generation

1. Find and click: **POST /api/exams/generate**
2. Click **"Try it out"**
3. Leave **X-User-Id** as: `admin`
4. Paste this request body:

```json
{
  "title": "Auto-Generated Quiz",
  "description": "My first auto-generated exam!",
  "courseId": "CS101",
  "duration": 45,
  "passingScore": 60.0,
  "topics": [
    "Java",
    "Programming"
  ],
  "difficultyDistribution": {
    "RECOGNIZE": 3,
    "UNDERSTAND": 2
  }
}
```

5. Click **"Execute"**

**✅ Expected Response:**
- Response code: **201**
- Body shows:
  - 5 questions total (3 RECOGNIZE + 2 UNDERSTAND)
  - Questions randomly selected from question bank
  - `"generationType": "AUTO"`
  - `"totalPoints"`: Calculated automatically
  - Each question has a unique `questionId`

**🎉 Magic!** The system automatically selected 5 random questions matching your criteria!

📝 **Copy this exam ID** too!

---

### Step 3.2: Complex Auto-Generation (All Difficulty Levels)

1. Click **POST /api/exams/generate** again
2. Click **"Try it out"**
3. Paste this request:

```json
{
  "title": "Comprehensive Auto Exam",
  "description": "Testing all difficulty levels",
  "courseId": "CS101",
  "duration": 90,
  "passingScore": 70.0,
  "topics": [
    "Java",
    "Programming",
    "Database"
  ],
  "difficultyDistribution": {
    "RECOGNIZE": 4,
    "UNDERSTAND": 3,
    "APPLY": 2,
    "ANALYZE": 1
  }
}
```

4. Click **"Execute"**

**✅ Expected:** 10 questions total, distributed by difficulty

⚠️ **Note:** If you see fewer than 10 questions, it means not enough questions available for those criteria. This is OK with limited test data!

---

### Step 3.3: View Generated Exam Details

1. Find and click: **GET /api/exams/{id}**
2. Click **"Try it out"**
3. In the **id** field, paste one of your exam IDs from above
4. Click **"Execute"**

**✅ Expected:** Full details of the exam including all questions

---

## 📤 Part 4: Publish/Unpublish Workflow

### Step 4.1: Publish an Exam

1. Find and click: **POST /api/exams/{id}/publish**
2. Click **"Try it out"**
3. Paste your exam ID in the **id** field
4. Click **"Execute"**

**✅ Expected Response:**
```json
{
  "code": 1000,
  "message": "Exam published successfully",
  "result": {
    "isPublished": true
    ...
  }
}
```

Now this exam is **available for students**!

---

### Step 4.2: View All Published Exams

1. Find and click: **GET /api/exams/published**
2. Click **"Try it out"**
3. Click **"Execute"**

**✅ Expected:** List including your just-published exam

---

### Step 4.3: Try to Update Published Exam (Will Fail!)

1. Find: **PUT /api/exams/{id}**
2. Click **"Try it out"**
3. Use the **published exam ID**
4. Paste any update (doesn't matter):

```json
{
  "title": "Trying to Update",
  "duration": 60,
  "questions": []
}
```

5. Click **"Execute"**

**✅ Expected:** Error response:
```json
{
  "code": 9999,
  "message": "Cannot update published exam. Unpublish first."
}
```

**Good!** The system protects published exams from changes.

---

### Step 4.4: Unpublish to Allow Updates

1. Find: **POST /api/exams/{id}/unpublish**
2. Click **"Try it out"**
3. Paste your exam ID
4. Click **"Execute"**

**✅ Expected:** `"isPublished": false`

Now you can update it!

---

## 📝 Part 5: Update & Delete

### Step 5.1: Update Exam (After Unpublishing)

1. Find: **PUT /api/exams/{id}**
2. Click **"Try it out"**
3. Use an **unpublished** exam ID
4. Paste (remember to use valid question IDs):

```json
{
  "title": "Updated Title!",
  "description": "I changed this",
  "duration": 60,
  "passingScore": 65.0,
  "questions": [
    {
      "questionId": "YOUR_VALID_QUESTION_ID",
      "order": 1
    }
  ]
}
```

5. Click **"Execute"**

**✅ Expected:** Exam updated successfully

---

### Step 5.2: List All Exams with Pagination

1. Find: **GET /api/exams**
2. Click **"Try it out"**
3. Set parameters:
   - page: `0`
   - size: `10`
   - sortBy: `createdAt`
   - direction: `DESC`
4. Click **"Execute"**

**✅ Expected:** Paginated list, newest first

---

### Step 5.3: Delete Exam

1. Find: **DELETE /api/exams/{id}**
2. Click **"Try it out"**
3. Paste an **unpublished** exam ID
4. Click **"Execute"**

**✅ Expected:**
```json
{
  "code": 1000,
  "message": "Exam deleted successfully"
}
```

⚠️ **Cannot delete published exams!** Unpublish first.

---

## 🎯 Test Checklist

Use this to track your testing:

### Manual Exam Tests
- [ ] ✅ Create manual exam with 2-3 questions
- [ ] ✅ View exam details by ID
- [ ] ✅ Update exam (unpublished only)
- [ ] ✅ Publish exam
- [ ] ✅ Verify cannot update published exam
- [ ] ✅ Unpublish exam
- [ ] ✅ Delete exam (unpublished only)

### Auto-Generate Tests ⭐
- [ ] ✅ Generate exam with 2 difficulty levels
- [ ] ✅ Generate exam with all 4 difficulty levels
- [ ] ✅ Verify correct number of questions generated
- [ ] ✅ Generate twice with same criteria (should get different questions)
- [ ] ✅ Verify no duplicate questions in one exam
- [ ] ✅ Verify total points calculated correctly

### Additional Tests
- [ ] ✅ List all exams (paginated)
- [ ] ✅ Get exams by course
- [ ] ✅ Get published exams only
- [ ] ✅ Get my exams (by creator)

---

## 📊 Quick Copy/Paste Samples

### Minimal Auto-Generate
```json
{
  "title": "Quick Test",
  "duration": 30,
  "topics": ["Java"],
  "difficultyDistribution": {
    "RECOGNIZE": 2
  }
}
```

### Full Featured Auto-Generate
```json
{
  "title": "Final Exam - Comprehensive",
  "description": "Covers all topics and difficulty levels",
  "courseId": "CS101",
  "duration": 90,
  "passingScore": 70.0,
  "topics": ["Java", "Programming", "OOP", "Database"],
  "difficultyDistribution": {
    "RECOGNIZE": 5,
    "UNDERSTAND": 4,
    "APPLY": 3,
    "ANALYZE": 2
  }
}
```

---

## 🐛 Common Issues & Solutions

### "Question not found with id: ..."
**Fix:** Use valid question IDs from `GET /api/questions`

### "Not enough questions available"
**Fix:** 
- Import more questions using Excel import (Phase 3)
- OR reduce the numbers in `difficultyDistribution`

### "Cannot update published exam"
**Fix:** Unpublish first: `POST /api/exams/{id}/unpublish`

### "Exam must have at least one question"
**Fix:** Add at least one question to the `questions` array

### Empty response or timeout
**Fix:**
- Check server is running in terminal
- Check MongoDB connection
- Look for errors in server console

---

## ✅ Success Criteria

After testing, you should see:

✅ Manual exams created successfully  
✅ Auto-generated exams with correct question counts  
✅ Random selection works (different questions each time)  
✅ No duplicate questions in any exam  
✅ Total points calculated automatically  
✅ Publish/unpublish workflow works  
✅ Published exams are protected from updates  
✅ Can update and delete unpublished exams  

---

## 🎉 You're Ready!

**Open Swagger UI now:**
```
http://localhost:8080/swagger-ui.html
```

Follow the steps above and test all features!

**Happy Testing!** 🚀

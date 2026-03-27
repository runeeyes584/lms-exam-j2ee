# Test Question API

## 1. Create Single Choice Question
POST http://localhost:8080/api/questions
Content-Type: application/json

```json
{
  "type": "SINGLE_CHOICE",
  "content": "Java là ngôn ngữ lập trình gì?",
  "imageUrl": null,
  "options": [
    {
      "text": "Ngôn ngữ biên dịch",
      "imageUrl": null,
      "isCorrect": false
    },
    {
      "text": "Ngôn ngữ thông dịch",
      "imageUrl": null,
      "isCorrect": false
    },
    {
      "text": "Ngôn ngữ biên dịch và thông dịch",
      "imageUrl": null,
      "isCorrect": true
    },
    {
      "text": "Ngôn ngữ kịch bản",
      "imageUrl": null,
      "isCorrect": false
    }
  ],
  "correctAnswer": null,
  "explanation": "Java được biên dịch thành bytecode và sau đó được JVM thông dịch",
  "difficulty": "UNDERSTAND",
  "topics": ["Java", "Programming Basics"],
  "points": 1.0
}
```

## 2. Create True/False Question
POST http://localhost:8080/api/questions
Content-Type: application/json

```json
{
  "type": "TRUE_FALSE",
  "content": "Spring Boot là một framework của Java",
  "options": [
    {
      "text": "Đúng",
      "isCorrect": true
    },
    {
      "text": "Sai",
      "isCorrect": false
    }
  ],
  "explanation": "Spring Boot là framework giúp đơn giản hóa việc phát triển ứng dụng Spring",
  "difficulty": "RECOGNIZE",
  "topics": ["Spring Boot", "Java Frameworks"],
  "points": 0.5
}
```

## 3. Create Fill-In Question
POST http://localhost:8080/api/questions
Content-Type: application/json

```json
{
  "type": "FILL_IN",
  "content": "MongoDB là một hệ quản trị cơ sở dữ liệu dạng _______",
  "options": [],
  "correctAnswer": "NoSQL",
  "explanation": "MongoDB là database NoSQL dạng document-oriented",
  "difficulty": "RECOGNIZE",
  "topics": ["MongoDB", "Database"],
  "points": 1.0
}
```

## 4. Create Multiple Choice Question
POST http://localhost:8080/api/questions
Content-Type: application/json

```json
{
  "type": "MULTIPLE_CHOICE",
  "content": "Những framework nào sau đây là của Java? (Chọn nhiều đáp án)",
  "options": [
    {
      "text": "Spring Boot",
      "isCorrect": true
    },
    {
      "text": "Django",
      "isCorrect": false
    },
    {
      "text": "Hibernate",
      "isCorrect": true
    },
    {
      "text": "Laravel",
      "isCorrect": false
    }
  ],
  "explanation": "Spring Boot và Hibernate là Java frameworks. Django (Python) và Laravel (PHP)",
  "difficulty": "APPLY",
  "topics": ["Java", "Frameworks"],
  "points": 2.0
}
```

## 5. Create Question with Image URL
POST http://localhost:8080/api/questions
Content-Type: application/json

```json
{
  "type": "SINGLE_CHOICE",
  "content": "Biểu tượng nào là logo của Java?",
  "imageUrl": "https://example.com/java-logos.png",
  "options": [
    {
      "text": "Coffee cup",
      "imageUrl": "https://example.com/coffee.png",
      "isCorrect": true
    },
    {
      "text": "Snake",
      "isCorrect": false
    },
    {
      "text": "Elephant",
      "isCorrect": false
    }
  ],
  "explanation": "Logo Java là một tách cà phê nóng",
  "difficulty": "RECOGNIZE",
  "topics": ["Java", "Branding"],
  "points": 0.5
}
```

## 5. Get All Questions (Paginated)
GET http://localhost:8080/api/questions?page=0&size=10

## 6. Get Question by ID
GET http://localhost:8080/api/questions/{id}

## 7. Search by Topics
GET http://localhost:8080/api/questions/search/topics?topics=Java&topics=MongoDB

## 8. Search by Difficulty
GET http://localhost:8080/api/questions/search/difficulty?difficulty=RECOGNIZE

## 9. Advanced Search (Topics + Difficulty)
GET http://localhost:8080/api/questions/search/advanced?topics=Java&difficulty=APPLY

## 10. Update Question
PUT http://localhost:8080/api/questions/{id}
Content-Type: application/json

(Same body as create)

## 11. Delete Question
DELETE http://localhost:8080/api/questions/{id}

package com.lms.exam.config;


import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

/**
 * Data Seeder - Tạo sample data để test.
 * Chỉ chạy với profile "dev" hoặc "test".
 * Chạy: ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
 */
@Configuration
@Profile({"dev", "test"})
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedData(MongoTemplate mongoTemplate) {
        return args -> {
            log.info("=== Starting Data Seeder ===");

            // Clear existing test data (optional)
            // mongoTemplate.dropCollection("users");
            // mongoTemplate.dropCollection("courses");
            // mongoTemplate.dropCollection("enrollments");
            // mongoTemplate.dropCollection("reviews");
            // mongoTemplate.dropCollection("comments");
            // mongoTemplate.dropCollection("orders");

            // Seed Users
            if (mongoTemplate.getCollection("users").countDocuments() == 0) {
                seedUsers(mongoTemplate);
            }

            // Seed Courses
            if (mongoTemplate.getCollection("courses").countDocuments() == 0) {
                seedCourses(mongoTemplate);
            }

            // Seed Enrollments (for purchase check)
            if (mongoTemplate.getCollection("enrollments").countDocuments() == 0) {
                seedEnrollments(mongoTemplate);
            }

            // Seed Orders (for analytics)
            if (mongoTemplate.getCollection("orders").countDocuments() == 0) {
                seedOrders(mongoTemplate);
            }

            log.info("=== Data Seeder Completed ===");
            logTestIds(mongoTemplate);
        };
    }

    private void seedUsers(MongoTemplate mongoTemplate) {
        List<Document> users = Arrays.asList(
                new Document("_id", new ObjectId("507f1f77bcf86cd799439011"))
                        .append("email", "student1@test.com")
                        .append("fullName", "Nguyễn Văn A")
                        .append("role", "STUDENT")
                        .append("createdAt", Instant.now().minus(30, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId("507f1f77bcf86cd799439012"))
                        .append("email", "student2@test.com")
                        .append("fullName", "Trần Thị B")
                        .append("role", "STUDENT")
                        .append("createdAt", Instant.now().minus(20, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId("507f1f77bcf86cd799439013"))
                        .append("email", "teacher@test.com")
                        .append("fullName", "Lê Văn C")
                        .append("role", "TEACHER")
                        .append("createdAt", Instant.now().minus(60, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId("507f1f77bcf86cd799439014"))
                        .append("email", "admin@test.com")
                        .append("fullName", "Admin User")
                        .append("role", "ADMIN")
                        .append("createdAt", Instant.now().minus(90, ChronoUnit.DAYS))
        );
        mongoTemplate.getCollection("users").insertMany(users);
        log.info("Seeded {} users", users.size());
    }

    private void seedCourses(MongoTemplate mongoTemplate) {
        List<Document> courses = Arrays.asList(
                new Document("_id", new ObjectId("607f1f77bcf86cd799439001"))
                        .append("title", "Java Spring Boot Masterclass")
                        .append("description", "Học Spring Boot từ cơ bản đến nâng cao")
                        .append("instructorId", "507f1f77bcf86cd799439013")
                        .append("price", 599000.0)
                        .append("avgRating", 0.0)
                        .append("ratingCount", 0)
                        .append("createdAt", Instant.now().minus(45, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId("607f1f77bcf86cd799439002"))
                        .append("title", "React & Node.js Full Stack")
                        .append("description", "Xây dựng ứng dụng web full stack")
                        .append("instructorId", "507f1f77bcf86cd799439013")
                        .append("price", 799000.0)
                        .append("avgRating", 0.0)
                        .append("ratingCount", 0)
                        .append("createdAt", Instant.now().minus(30, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId("607f1f77bcf86cd799439003"))
                        .append("title", "Python for Data Science")
                        .append("description", "Phân tích dữ liệu với Python")
                        .append("instructorId", "507f1f77bcf86cd799439013")
                        .append("price", 499000.0)
                        .append("avgRating", 0.0)
                        .append("ratingCount", 0)
                        .append("createdAt", Instant.now().minus(15, ChronoUnit.DAYS))
        );

        // Add lessons to courses
        List<Document> lessons = Arrays.asList(
                new Document("_id", new ObjectId("707f1f77bcf86cd799439001"))
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("title", "Giới thiệu Spring Boot")
                        .append("order", 1),
                new Document("_id", new ObjectId("707f1f77bcf86cd799439002"))
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("title", "Dependency Injection")
                        .append("order", 2)
        );

        mongoTemplate.getCollection("courses").insertMany(courses);
        mongoTemplate.getCollection("lessons").insertMany(lessons);
        log.info("Seeded {} courses, {} lessons", courses.size(), lessons.size());
    }

    private void seedEnrollments(MongoTemplate mongoTemplate) {
        // Student1 enrolled in Course1 and Course2
        // Student2 enrolled in Course1
        List<Document> enrollments = Arrays.asList(
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439011")
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("enrolledAt", Instant.now().minus(25, ChronoUnit.DAYS))
                        .append("progress", 50),
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439011")
                        .append("courseId", "607f1f77bcf86cd799439002")
                        .append("enrolledAt", Instant.now().minus(10, ChronoUnit.DAYS))
                        .append("progress", 20),
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439012")
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("enrolledAt", Instant.now().minus(15, ChronoUnit.DAYS))
                        .append("progress", 80)
        );
        mongoTemplate.getCollection("enrollments").insertMany(enrollments);
        log.info("Seeded {} enrollments", enrollments.size());
    }

    private void seedOrders(MongoTemplate mongoTemplate) {
        List<Document> orders = Arrays.asList(
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439011")
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("totalAmount", 599000.0)
                        .append("status", "completed")
                        .append("createdAt", Instant.now().minus(25, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439011")
                        .append("courseId", "607f1f77bcf86cd799439002")
                        .append("totalAmount", 799000.0)
                        .append("status", "completed")
                        .append("createdAt", Instant.now().minus(10, ChronoUnit.DAYS)),
                new Document("_id", new ObjectId())
                        .append("userId", "507f1f77bcf86cd799439012")
                        .append("courseId", "607f1f77bcf86cd799439001")
                        .append("totalAmount", 599000.0)
                        .append("status", "completed")
                        .append("createdAt", Instant.now().minus(15, ChronoUnit.DAYS))
        );
        mongoTemplate.getCollection("orders").insertMany(orders);
        log.info("Seeded {} orders", orders.size());
    }

    private void logTestIds(MongoTemplate mongoTemplate) {
        log.info("");
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║           🧪 TEST IDs FOR POSTMAN                            ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║ USERS:                                                       ║");
        log.info("║   Student1: 507f1f77bcf86cd799439011 (enrolled in 2 courses) ║");
        log.info("║   Student2: 507f1f77bcf86cd799439012 (enrolled in 1 course)  ║");
        log.info("║   Teacher:  507f1f77bcf86cd799439013                         ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║ COURSES:                                                     ║");
        log.info("║   Java Spring Boot: 607f1f77bcf86cd799439001                 ║");
        log.info("║   React Fullstack:  607f1f77bcf86cd799439002                 ║");
        log.info("║   Python DS:        607f1f77bcf86cd799439003                 ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║ LESSONS:                                                     ║");
        log.info("║   Lesson 1:         707f1f77bcf86cd799439001                 ║");
        log.info("║   Lesson 2:         707f1f77bcf86cd799439002                 ║");
        log.info("╚══════════════════════════════════════════════════════════════╝");
        log.info("");
    }
}

package kaleidoscope.j2ee.examlms.service;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

        private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

        private final MongoTemplate mongoTemplate;

        @Autowired
        public AnalyticsService(MongoTemplate mongoTemplate) {
                this.mongoTemplate = mongoTemplate;
        }

        /**
         * Revenue by month - aggregates orders collection
         * Assumes orders have: createdAt (date), totalAmount (number), status =
         * "completed"
         */
        public List<Document> getRevenueByMonth(int year) {
                Instant startOfYear = LocalDate.of(year, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfYear = LocalDate.of(year + 1, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                Aggregation agg = newAggregation(
                                match(Criteria.where("status").is("completed")
                                                .and("createdAt").gte(startOfYear).lt(endOfYear)),
                                project()
                                                .andExpression("month(createdAt)").as("month")
                                                .andExpression("year(createdAt)").as("year")
                                                .and("totalAmount").as("amount"),
                                group("year", "month")
                                                .sum("amount").as("totalRevenue")
                                                .count().as("orderCount"),
                                sort(Sort.Direction.ASC, "_id.month"));

                AggregationResults<Document> results = mongoTemplate.aggregate(agg, "orders", Document.class);
                log.info("Revenue aggregation for year {} returned {} results", year,
                                results.getMappedResults().size());
                return results.getMappedResults();
        }

        /**
         * Top courses by enrollment count
         */
        public List<Document> getTopCoursesByEnrollment(int limit) {
                Aggregation agg = newAggregation(
                                group("courseId").count().as("enrollmentCount"),
                                sort(Sort.Direction.DESC, "enrollmentCount"),
                                limit(limit),
                                // Lookup course details
                                lookup("courses", "_id", "_id", "course"),
                                unwind("course", true),
                                project()
                                                .and("_id").as("courseId")
                                                .and("enrollmentCount").as("enrollmentCount")
                                                .and("course.title").as("courseTitle")
                                                .and("course.price").as("coursePrice"));

                AggregationResults<Document> results = mongoTemplate.aggregate(agg, "enrollments", Document.class);
                return results.getMappedResults();
        }

        /**
         * Top courses by revenue
         */
        public List<Document> getTopCoursesByRevenue(int limit) {
                Aggregation agg = newAggregation(
                                match(Criteria.where("status").is("completed")),
                                unwind("items"), // assuming orders have items array with courseId and price
                                group("items.courseId")
                                                .sum("items.price").as("totalRevenue")
                                                .count().as("salesCount"),
                                sort(Sort.Direction.DESC, "totalRevenue"),
                                limit(limit),
                                lookup("courses", "_id", "_id", "course"),
                                unwind("course", true),
                                project()
                                                .and("_id").as("courseId")
                                                .and("totalRevenue").as("totalRevenue")
                                                .and("salesCount").as("salesCount")
                                                .and("course.title").as("courseTitle"));

                AggregationResults<Document> results = mongoTemplate.aggregate(agg, "orders", Document.class);
                return results.getMappedResults();
        }

        /**
         * New users per month
         */
        public List<Document> getNewUsersByMonth(int year) {
                Instant startOfYear = LocalDate.of(year, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfYear = LocalDate.of(year + 1, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                Aggregation agg = newAggregation(
                                match(Criteria.where("createdAt").gte(startOfYear).lt(endOfYear)
                                                .and("role").is("STUDENT")),
                                project()
                                                .andExpression("month(createdAt)").as("month")
                                                .andExpression("year(createdAt)").as("year"),
                                group("year", "month").count().as("newUsers"),
                                sort(Sort.Direction.ASC, "_id.month"));

                AggregationResults<Document> results = mongoTemplate.aggregate(agg, "users", Document.class);
                return results.getMappedResults();
        }

        /**
         * Dashboard summary - counts
         */
        public Document getDashboardSummary() {
                long totalUsers = mongoTemplate.getCollection("users").countDocuments();
                long totalStudents = mongoTemplate.getCollection("users")
                                .countDocuments(new Document("role", "STUDENT"));
                long totalInstructors = mongoTemplate.getCollection("users")
                                .countDocuments(new Document("role", "INSTRUCTOR"));
                long totalCourses = mongoTemplate.getCollection("courses")
                                .countDocuments(new Document("isDeleted", false));
                long totalExams = mongoTemplate.getCollection("exams").countDocuments();
                long totalAttempts = mongoTemplate.getCollection("exam_attempts").countDocuments();
                long totalOrders = mongoTemplate.getCollection("orders")
                                .countDocuments(new Document("status", "completed"));
                long totalReviews = mongoTemplate.getCollection("reviews")
                                .countDocuments(new Document("isDeleted", false));

                LocalDate now = LocalDate.now();
                Instant startOfMonth = now.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant startOfNextMonth = now.plusMonths(1).withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault())
                                .toInstant();
                long newStudentsThisMonth = mongoTemplate.getCollection("users")
                                .countDocuments(new Document("role", "STUDENT")
                                                .append("createdAt", new Document("$gte", startOfMonth)
                                                                .append("$lt", startOfNextMonth)));

                Aggregation revenueAgg = newAggregation(
                                match(Criteria.where("status").is("completed")),
                                group().sum("totalAmount").as("totalRevenue"));
                AggregationResults<Document> revenueRes = mongoTemplate.aggregate(revenueAgg, "orders", Document.class);
                Document revenueDoc = revenueRes.getUniqueMappedResult();
                double totalRevenue = revenueDoc != null && revenueDoc.get("totalRevenue") != null
                                ? Double.parseDouble(revenueDoc.get("totalRevenue").toString())
                                : 0;

                return new Document()
                                .append("totalUsers", totalUsers)
                                .append("totalStudents", totalStudents)
                                .append("totalInstructors", totalInstructors)
                                .append("totalCourses", totalCourses)
                                .append("totalExams", totalExams)
                                .append("totalAttempts", totalAttempts)
                                .append("totalOrders", totalOrders)
                                .append("totalReviews", totalReviews)
                                .append("totalRevenue", totalRevenue)
                                .append("newStudentsThisMonth", newStudentsThisMonth);
        }

        /**
         * Course statistics - for a specific course
         */
        public Document getCourseAnalytics(String courseId) {
                // Enrollment count
                long enrollmentCount = mongoTemplate.getCollection("enrollments")
                                .countDocuments(new Document("courseId", courseId));

                // Review stats
                Aggregation reviewAgg = newAggregation(
                                match(Criteria.where("courseId").is(courseId).and("isDeleted").is(false)),
                                group("courseId")
                                                .avg("rating").as("avgRating")
                                                .count().as("reviewCount"));
                AggregationResults<Document> reviewRes = mongoTemplate.aggregate(reviewAgg, "reviews", Document.class);
                Document reviewStats = reviewRes.getUniqueMappedResult();

                // Revenue from this course
                Aggregation revenueAgg = newAggregation(
                                match(Criteria.where("status").is("completed")),
                                unwind("items"),
                                match(Criteria.where("items.courseId").is(courseId)),
                                group().sum("items.price").as("totalRevenue").count().as("salesCount"));
                AggregationResults<Document> revenueRes = mongoTemplate.aggregate(revenueAgg, "orders", Document.class);
                Document revenueStats = revenueRes.getUniqueMappedResult();

                return new Document()
                                .append("courseId", courseId)
                                .append("enrollmentCount", enrollmentCount)
                                .append("avgRating", reviewStats != null ? reviewStats.getDouble("avgRating") : 0)
                                .append("reviewCount", reviewStats != null ? reviewStats.getInteger("reviewCount") : 0)
                                .append("totalRevenue", revenueStats != null ? revenueStats.get("totalRevenue") : 0)
                                .append("salesCount", revenueStats != null ? revenueStats.get("salesCount") : 0);
        }
}

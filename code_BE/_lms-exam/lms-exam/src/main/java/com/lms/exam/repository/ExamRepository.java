package com.lms.exam.repository;

import com.lms.exam.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExamRepository extends MongoRepository<Exam, String> {
}

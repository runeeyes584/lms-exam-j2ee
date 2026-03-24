package com.example.be_lms.repository;

import com.example.be_lms.entity.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CertificateRepository extends MongoRepository<Certificate, String> {

    Optional<Certificate> findByUserIdAndCourseId(String userId, String courseId);

}
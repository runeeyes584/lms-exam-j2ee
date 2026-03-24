package com.lms.lms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lms.lms.entity.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}

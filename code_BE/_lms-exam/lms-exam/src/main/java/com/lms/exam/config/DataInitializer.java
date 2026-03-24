package com.lms.exam.config;

import com.lms.exam.model.Exam;
import com.lms.exam.repository.ExamRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final ExamRepository repo;

    public DataInitializer(ExamRepository repo) { this.repo = repo; }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (repo.count() == 0) {
            repo.save(new Exam("Math exam","Basic algebra and calculus"));
            repo.save(new Exam("Java exam","OOP and Spring Boot basics"));
        }
    }
}

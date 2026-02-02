package com.lms.exam.controller;

import com.lms.exam.model.Exam;
import com.lms.exam.repository.ExamRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamRepository repo;

    public ExamController(ExamRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Exam> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> byId(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}

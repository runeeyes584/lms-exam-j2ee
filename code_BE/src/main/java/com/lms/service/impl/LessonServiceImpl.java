package com.lms.service.impl;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.Lesson;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.LessonRepository;
import com.lms.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;

    @Override
    public List<LessonResponse> getLessonsByChapter(String chapterId) {
        return lessonRepository
                .findByChapterIdAndIsDeletedFalseOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LessonResponse createLesson(LessonRequest request) {
        Lesson lesson = Lesson.builder()
                .chapterId(request.getChapterId())
                .title(request.getTitle())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .isDeleted(false)
                .build();
        return toResponse(lessonRepository.save(lesson));
    }

    @Override
    public LessonResponse updateLesson(String id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setOrderIndex(request.getOrderIndex());
        return toResponse(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(String id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        lesson.setDeleted(true);
        lessonRepository.save(lesson);
    }

    private LessonResponse toResponse(Lesson l) {
        return LessonResponse.builder()
                .id(l.getId())
                .chapterId(l.getChapterId())
                .title(l.getTitle())
                .content(l.getContent())
                .orderIndex(l.getOrderIndex())
                .isDeleted(l.isDeleted())
                .build();
    }
}

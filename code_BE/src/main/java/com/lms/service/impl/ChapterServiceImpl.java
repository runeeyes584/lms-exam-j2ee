package com.lms.service.impl;

import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;
import com.lms.entity.Chapter;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ChapterRepository;
import com.lms.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;

    @Override
    public List<ChapterResponse> getChaptersByCourse(String courseId) {
        return chapterRepository
                .findByCourseIdAndIsDeletedFalseOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ChapterResponse createChapter(ChapterRequest request) {
        Chapter chapter = Chapter.builder()
                .courseId(request.getCourseId())
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .isDeleted(false)
                .build();
        return toResponse(chapterRepository.save(chapter));
    }

    @Override
    public ChapterResponse updateChapter(String id, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));
        chapter.setTitle(request.getTitle());
        chapter.setOrderIndex(request.getOrderIndex());
        return toResponse(chapterRepository.save(chapter));
    }

    @Override
    public void deleteChapter(String id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));
        chapter.setDeleted(true);
        chapterRepository.save(chapter);
    }

    private ChapterResponse toResponse(Chapter c) {
        return ChapterResponse.builder()
                .id(c.getId())
                .courseId(c.getCourseId())
                .title(c.getTitle())
                .orderIndex(c.getOrderIndex())
                .isDeleted(c.isDeleted())
                .build();
    }
}

package kaleidoscope.j2ee.examlms.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.LessonRequest;
import kaleidoscope.j2ee.examlms.dto.response.LessonResponse;
import kaleidoscope.j2ee.examlms.entity.Lesson;
import kaleidoscope.j2ee.examlms.exception.ResourceNotFoundException;
import kaleidoscope.j2ee.examlms.repository.LessonRepository;
import kaleidoscope.j2ee.examlms.service.LessonService;
import lombok.RequiredArgsConstructor;

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
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
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
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDuration(request.getDuration());
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
                .videoUrl(l.getVideoUrl())
                .duration(l.getDuration())
                .orderIndex(l.getOrderIndex())
                .isDeleted(l.isDeleted())
                .build();
    }
}

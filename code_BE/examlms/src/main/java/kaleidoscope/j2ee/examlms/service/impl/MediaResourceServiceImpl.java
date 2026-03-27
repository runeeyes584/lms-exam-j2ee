package kaleidoscope.j2ee.examlms.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import kaleidoscope.j2ee.examlms.dto.response.MediaResourceResponse;
import kaleidoscope.j2ee.examlms.entity.MediaResource;
import kaleidoscope.j2ee.examlms.entity.MediaResource.MediaType;
import kaleidoscope.j2ee.examlms.exception.ResourceNotFoundException;
import kaleidoscope.j2ee.examlms.repository.MediaResourceRepository;
import kaleidoscope.j2ee.examlms.service.MediaResourceService;
import kaleidoscope.j2ee.examlms.utils.FileStorageUtil;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MediaResourceServiceImpl implements MediaResourceService {

    private final MediaResourceRepository mediaResourceRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public List<MediaResourceResponse> getResourcesByLesson(String lessonId) {
        return mediaResourceRepository.findByLessonId(lessonId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MediaResourceResponse addVideoLink(String lessonId, String videoUrl) {
        MediaResource resource = MediaResource.builder()
                .lessonId(lessonId)
                .type(MediaType.VIDEO)
                .url(videoUrl)
                .build();
        return toResponse(mediaResourceRepository.save(resource));
    }

    @Override
    public MediaResourceResponse uploadDocument(String lessonId, MultipartFile file) throws IOException {
        String storedFileName = fileStorageUtil.store(file);
        MediaResource resource = MediaResource.builder()
                .lessonId(lessonId)
                .type(MediaType.DOCUMENT)
                .url(storedFileName)
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();
        return toResponse(mediaResourceRepository.save(resource));
    }

    @Override
    public Resource loadFileAsResource(String resourceId) throws IOException {
        MediaResource record = mediaResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Media resource not found: " + resourceId));
        Path filePath = fileStorageUtil.resolve(record.getUrl());
        Resource fileResource = new UrlResource(filePath.toUri());
        if (!fileResource.exists() || !fileResource.isReadable()) {
            throw new IOException("File not found or not readable: " + record.getUrl());
        }
        return fileResource;
    }

    @Override
    public MediaResourceResponse getResourceById(String resourceId) {
        MediaResource record = mediaResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Media resource not found: " + resourceId));
        return toResponse(record);
    }

    @Override
    public void deleteResource(String resourceId) throws IOException {
        MediaResource record = mediaResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Media resource not found: " + resourceId));
        // Delete physical file for documents
        if (record.getType() == MediaType.DOCUMENT) {
            Path filePath = fileStorageUtil.resolve(record.getUrl());
            Files.deleteIfExists(filePath);
        }
        mediaResourceRepository.deleteById(resourceId);
    }

    private MediaResourceResponse toResponse(MediaResource r) {
        String downloadUrl = null;
        if (r.getType() == MediaType.DOCUMENT && r.getId() != null) {
            downloadUrl = "http://localhost:" + serverPort + "/api/v1/media/" + r.getId() + "/download";
        }
        return MediaResourceResponse.builder()
                .id(r.getId())
                .lessonId(r.getLessonId())
                .type(r.getType())
                .url(r.getUrl())
                .originalFileName(r.getOriginalFileName())
                .mimeType(r.getMimeType())
                .downloadUrl(downloadUrl)
                .build();
    }
}

package com.lms.controller;

import com.lms.dto.response.ApiResponse;
import com.lms.dto.response.MediaResourceResponse;
import com.lms.service.MediaResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * REST controller for Media Resources (video links + document uploads).
 * Base path: /api/v1
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MediaController {

    private final MediaResourceService mediaResourceService;

    /** GET /api/v1/lessons/{lessonId}/media — List all media for a lesson */
    @GetMapping("/lessons/{lessonId}/media")
    public ResponseEntity<ApiResponse<List<MediaResourceResponse>>> getMedia(@PathVariable String lessonId) {
        return ResponseEntity.ok(ApiResponse.success(mediaResourceService.getResourcesByLesson(lessonId)));
    }

    /**
     * POST /api/v1/lessons/{lessonId}/media/video
     * Request body: { "videoUrl": "https://youtu.be/..." }
     * Embeds a YouTube / Vimeo link.
     */
    @PostMapping("/lessons/{lessonId}/media/video")
    public ResponseEntity<ApiResponse<MediaResourceResponse>> addVideoLink(
            @PathVariable String lessonId,
            @RequestBody java.util.Map<String, String> body) {
        String videoUrl = body.get("videoUrl");
        if (videoUrl == null || videoUrl.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(4000, "videoUrl must not be blank"));
        }
        MediaResourceResponse response = mediaResourceService.addVideoLink(lessonId, videoUrl);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video link saved", response));
    }

    /**
     * POST /api/v1/lessons/{lessonId}/media/document
     * Multipart form-data: file field = actual PDF/DOCX.
     */
    @PostMapping(value = "/lessons/{lessonId}/media/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResourceResponse>> uploadDocument(
            @PathVariable String lessonId,
            @RequestParam("file") MultipartFile file) throws IOException {
        MediaResourceResponse saved = mediaResourceService.uploadDocument(lessonId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded", saved));
    }

    /**
     * GET /api/v1/media/{id}/download
     * Streams the document for download. Browsers will trigger a file-save dialog.
     */
    @GetMapping("/media/{id}/download")
    public ResponseEntity<Resource> downloadMedia(@PathVariable String id) throws IOException {
        MediaResourceResponse meta = mediaResourceService.getResourceById(id);
        Resource resource = mediaResourceService.loadFileAsResource(id);

        String contentType = meta.getMimeType() != null ? meta.getMimeType() : "application/octet-stream";
        String fileName = meta.getOriginalFileName() != null ? meta.getOriginalFileName() : "download";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    /**
     * DELETE /api/v1/media/{id} — Delete a media resource record + physical file
     */
    @DeleteMapping("/media/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) throws IOException {
        mediaResourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Media resource deleted", null));
    }
}

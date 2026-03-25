package kaleidoscope.j2ee.examlms.service.impl;

import java.io.File;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.response.CertificateResponse;
import kaleidoscope.j2ee.examlms.entity.Certificate;
import kaleidoscope.j2ee.examlms.entity.Course;
import kaleidoscope.j2ee.examlms.entity.UserCourse;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.exception.CertificateException;
import kaleidoscope.j2ee.examlms.repository.CertificateRepository;
import kaleidoscope.j2ee.examlms.repository.CourseRepository;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.service.CertificateService;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

        private static final String[] TITLE_FONT_CANDIDATES = {
                        "C:/Windows/Fonts/timesbd.ttf",
                        "C:/Windows/Fonts/arialbd.ttf",
                        "C:/Windows/Fonts/arial.ttf"
        };

        private static final String[] BODY_FONT_CANDIDATES = {
                        "C:/Windows/Fonts/times.ttf",
                        "C:/Windows/Fonts/arial.ttf"
        };

        private final CertificateRepository certificateRepository;
        private final UserCourseRepository userCourseRepository;
        private final UserRepository userRepository;
        private final CourseRepository courseRepository;

        @Override
        public String generateCertificate(String userId, String courseId) {

                UserCourse userCourse = userCourseRepository
                                .findByUserIdAndCourseId(userId, courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                if (userCourse.getProgressPercent() < 100) {
                        throw new CertificateException("Course not completed yet");
                }

                return certificateRepository
                                .findByUserIdAndCourseId(userId, courseId)
                                .map(existing -> createOrRefreshCertificate(userId, courseId, existing))
                                .orElseGet(() -> createOrRefreshCertificate(userId, courseId, null));
        }

        @Override
        public boolean autoIssueCertificateIfCompleted(String userId, String courseId) {
                UserCourse userCourse = userCourseRepository
                                .findByUserIdAndCourseId(userId, courseId)
                                .orElseThrow(() -> new CertificateException("Enrollment not found"));

                if (userCourse.getProgressPercent() == null || userCourse.getProgressPercent() < 100) {
                        return false;
                }

                if (certificateRepository.findByUserIdAndCourseId(userId, courseId).isPresent()) {
                        return false;
                }

                createOrRefreshCertificate(userId, courseId, null);
                return true;
        }

        @Override
        public List<CertificateResponse> getMyCertificates(String userId) {
                return certificateRepository.findByUserId(userId).stream()
                                .map(certificate -> {
                                        User user = userRepository.findById(certificate.getUserId()).orElse(null);
                                        Course course = courseRepository.findById(certificate.getCourseId()).orElse(null);

                                        return CertificateResponse.builder()
                                                        .id(certificate.getId())
                                                        .courseId(certificate.getCourseId())
                                                        .courseName(certificate.getCourseName() != null
                                                                        ? certificate.getCourseName()
                                                                        : (course != null ? course.getTitle() : certificate.getCourseId()))
                                                        .studentName(certificate.getStudentName() != null
                                                                        ? certificate.getStudentName()
                                                                        : (user != null ? user.getFullName() : certificate.getUserId()))
                                                        .issuedAt(certificate.getIssuedAt())
                                                        .certificateNumber(certificate.getCertificateNumber() != null
                                                                        ? certificate.getCertificateNumber()
                                                                        : certificate.getId())
                                                        .build();
                                })
                                .toList();
        }

        @Override
        public String getCertificateFile(String userId, String courseId) {
                return certificateRepository.findByUserIdAndCourseId(userId, courseId)
                                .map(existing -> createOrRefreshCertificate(userId, courseId, existing))
                                .orElseGet(() -> generateCertificate(userId, courseId));
        }

        @Override
        public CertificateResponse verifyCertificate(String certificateNumber) {
                Certificate certificate = certificateRepository.findByCertificateNumber(certificateNumber)
                                .orElseThrow(() -> new CertificateException("Certificate not found"));

                User user = userRepository.findById(certificate.getUserId()).orElse(null);
                Course course = courseRepository.findById(certificate.getCourseId()).orElse(null);

                return CertificateResponse.builder()
                                .id(certificate.getId())
                                .courseId(certificate.getCourseId())
                                .courseName(certificate.getCourseName() != null
                                                ? certificate.getCourseName()
                                                : (course != null ? course.getTitle() : certificate.getCourseId()))
                                .studentName(certificate.getStudentName() != null
                                                ? certificate.getStudentName()
                                                : (user != null ? user.getFullName() : certificate.getUserId()))
                                .issuedAt(certificate.getIssuedAt())
                                .certificateNumber(certificate.getCertificateNumber() != null
                                                ? certificate.getCertificateNumber()
                                                : certificate.getId())
                                .build();
        }

        private String createOrRefreshCertificate(String userId, String courseId, Certificate existingCertificate) {

                try {
                        User user = userRepository.findById(userId)
                                        .orElseThrow(() -> new CertificateException("User not found"));
                        Course course = courseRepository.findById(courseId)
                                        .orElseThrow(() -> new CertificateException("Course not found"));

                        String userName = user.getFullName();
                        String courseName = course.getTitle();

                        String folderPath = "upload/certificates/";
                        new File(folderPath).mkdirs();

                        String certificateNumber = existingCertificate != null
                                        ? existingCertificate.getCertificateNumber()
                                        : null;
                        if (certificateNumber == null || certificateNumber.isBlank()) {
                                certificateNumber = "CERT-"
                                                + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                                                + "-"
                                                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                        }
                        String sanitized = certificateNumber.replaceAll("[^A-Z0-9\\-]", "");
                        String fileName = existingCertificate != null && existingCertificate.getFilePath() != null
                                        ? Path.of(existingCertificate.getFilePath()).getFileName().toString()
                                        : "certificate_" + sanitized + ".pdf";
                        String fullPath = folderPath + fileName;

                        PdfWriter writer = new PdfWriter(fullPath);
                        PdfDocument pdf = new PdfDocument(writer);
                        PageSize pageSize = PageSize.A4.rotate();
                        Document document = new Document(pdf, pageSize);

                        PdfPage page = pdf.addNewPage();

                        // ===== BACKGROUND =====
                        URL resource = getClass().getResource("/templates/certificate-template.png");
                        if (resource == null) {
                                throw new CertificateException("Template image not found!");
                        }

                        ImageData bgImage = ImageDataFactory.create(resource.toExternalForm());
                        Image background = new Image(bgImage);
                        background.scaleToFit(pageSize.getWidth(), pageSize.getHeight());
                        background.setFixedPosition(0, 0);
                        document.add(background);

                        // ===== FONT =====
                        PdfFont titleFont = loadUnicodeFont(TITLE_FONT_CANDIDATES);
                        PdfFont bodyFont = loadUnicodeFont(BODY_FONT_CANDIDATES);

                        // ===== TITLE =====
                        document.add(new Paragraph("CERTIFICATE")
                                        .setFont(titleFont)
                                        .setFontSize(48)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginTop(120));

                        document.add(new Paragraph("OF ACHIEVEMENT")
                                        .setFont(bodyFont)
                                        .setFontSize(18)
                                        .setTextAlignment(TextAlignment.CENTER));

                        document.add(new Paragraph("THIS CERTIFICATE IS PROUDLY PRESENTED TO")
                                        .setFont(bodyFont)
                                        .setFontSize(14)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginTop(40));

                        document.add(new Paragraph(userName.toUpperCase())
                                        .setFont(titleFont)
                                        .setFontSize(36)
                                        .setFontColor(new DeviceRgb(184, 134, 11))
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginTop(20));

                        document.add(new Paragraph("For successfully completing the course")
                                        .setFont(bodyFont)
                                        .setFontSize(18)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginTop(40));

                        document.add(new Paragraph(courseName)
                                        .setFont(bodyFont)
                                        .setFontSize(20)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setMarginTop(5));

                        // ===== DATE =====
                        String date = LocalDate.now()
                                        .format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));

                        PdfCanvas canvas = new PdfCanvas(page);

                        float lineY = 115; // LINE GIỮA CHỮ VÀ DATE

                        // LEFT LINE
                        canvas.moveTo(120, lineY);
                        canvas.lineTo(240, lineY);

                        // RIGHT LINE
                        canvas.moveTo(600, lineY);
                        canvas.lineTo(710, lineY);

                        canvas.stroke();

                        // ===== DATE VALUE =====
                        document.add(new Paragraph(date)
                                        .setFont(bodyFont)
                                        .setFontSize(18)
                                        .setFixedPosition(140, 115, 200)
                                        .setTextAlignment(TextAlignment.LEFT));

                        // DATE LABEL
                        document.add(new Paragraph("DATE")
                                        .setFont(bodyFont)
                                        .setFontSize(12)
                                        .setFontColor(new DeviceRgb(184, 134, 11))
                                        .setFixedPosition(160, 95, 200)
                                        .setTextAlignment(TextAlignment.LEFT));

                        // ===== SIGNATURE VALUE =====
                        document.add(new Paragraph("Instructor")
                                        .setFont(bodyFont)
                                        .setFontSize(18)
                                        .setFixedPosition(620, 115, 200)
                                        .setTextAlignment(TextAlignment.LEFT));

                        // SIGNATURE LABEL
                        document.add(new Paragraph("SIGNATURE")
                                        .setFont(bodyFont)
                                        .setFontSize(12)
                                        .setFontColor(new DeviceRgb(184, 134, 11))
                                        .setFixedPosition(620, 95, 200)
                                        .setTextAlignment(TextAlignment.LEFT));

                        document.close();

                        // SAVE DB
                        Certificate certificate = existingCertificate != null ? existingCertificate : new Certificate();
                        certificate.setUserId(userId);
                        certificate.setCourseId(courseId);
                        certificate.setCertificateNumber(certificateNumber);
                        certificate.setStudentName(user.getFullName());
                        certificate.setStudentEmail(user.getEmail());
                        certificate.setCourseName(course.getTitle());
                        certificate.setFilePath(fullPath);
                        certificate.setIssuedAt(existingCertificate != null && existingCertificate.getIssuedAt() != null
                                        ? existingCertificate.getIssuedAt()
                                        : LocalDateTime.now());

                        certificateRepository.save(certificate);

                        return fullPath;

                } catch (Exception e) {
                        throw new CertificateException("Error generating certificate", e);
                }
        }

        private PdfFont loadUnicodeFont(String[] candidates) {
                for (String candidate : candidates) {
                        if (!Files.exists(Path.of(candidate))) {
                                continue;
                        }

                        try {
                                return PdfFontFactory.createFont(candidate, PdfEncodings.IDENTITY_H,
                                                PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
                        } catch (Exception ignored) {
                                // Try the next available font candidate.
                        }
                }

                throw new CertificateException("No Unicode font found for certificate generation");
        }
}

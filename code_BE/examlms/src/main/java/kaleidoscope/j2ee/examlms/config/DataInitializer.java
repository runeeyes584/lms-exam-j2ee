package kaleidoscope.j2ee.examlms.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import kaleidoscope.j2ee.examlms.entity.Exam;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;

@Component
public class DataInitializer implements ApplicationRunner {

    private final ExamRepository repo;

    public DataInitializer(ExamRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (repo.count() == 0) {
            Exam exam1 = new Exam();
            exam1.setTitle("Math exam");
            exam1.setDescription("Basic algebra and calculus");
            repo.save(exam1);

            Exam exam2 = new Exam();
            exam2.setTitle("Java exam");
            exam2.setDescription("OOP and Spring Boot basics");
            repo.save(exam2);
        }
    }
}

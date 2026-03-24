package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}

package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.RefreshToken;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
}
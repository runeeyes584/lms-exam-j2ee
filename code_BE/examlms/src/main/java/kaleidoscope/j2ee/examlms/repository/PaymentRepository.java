package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kaleidoscope.j2ee.examlms.entity.Payment;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByTransactionId(String transactionId);
}

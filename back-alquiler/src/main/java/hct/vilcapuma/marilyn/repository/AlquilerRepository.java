package hct.vilcapuma.marilyn.repository;

import hct.vilcapuma.marilyn.model.Alquiler;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlquilerRepository extends ReactiveCrudRepository<Alquiler, Long> {
}

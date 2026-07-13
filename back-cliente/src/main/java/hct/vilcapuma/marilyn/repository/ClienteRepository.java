package hct.vilcapuma.marilyn.repository;

import hct.vilcapuma.marilyn.model.Cliente;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends ReactiveCrudRepository<Cliente, Long> {
}

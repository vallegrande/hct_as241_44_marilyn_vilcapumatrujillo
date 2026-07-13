package hct.vilcapuma.marilyn.service;

import hct.vilcapuma.marilyn.model.Cliente;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ClienteService {

    Flux<Cliente> findAll();
    Mono<Cliente> findById(Long id);
    Mono<Cliente> save(Cliente cliente);
    Mono<Cliente> update(Long id, Cliente cliente);
    Mono<Void> deleteById(Long id);
    Mono<Cliente> cambiarEstado(Long id, boolean estado);
}

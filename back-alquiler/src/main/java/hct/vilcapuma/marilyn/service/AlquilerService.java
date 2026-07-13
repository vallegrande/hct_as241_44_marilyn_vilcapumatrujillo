package hct.vilcapuma.marilyn.service;

import hct.vilcapuma.marilyn.model.Alquiler;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AlquilerService {

    Flux<Alquiler> findAll();
    Mono<Alquiler> findById(Long id);
    Mono<Alquiler> save(Alquiler alquiler);
    Mono<Alquiler> update(Long id, Alquiler alquiler);
    Mono<Alquiler> cambiarEstado(Long id, boolean estado);
}

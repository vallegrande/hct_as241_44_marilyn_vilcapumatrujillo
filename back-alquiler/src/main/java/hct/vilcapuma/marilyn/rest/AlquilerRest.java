package hct.vilcapuma.marilyn.rest;

import hct.vilcapuma.marilyn.model.Alquiler;
import hct.vilcapuma.marilyn.service.AlquilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/alquileres")
@RequiredArgsConstructor
public class AlquilerRest {
    private final AlquilerService service;

    @GetMapping
    public Flux<Alquiler> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Alquiler>> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Alquiler> save(@RequestBody Alquiler alquiler) {
        return service.save(alquiler);
    }

    @PutMapping("/{id}")
    public Mono<Alquiler> update(@PathVariable Long id, @RequestBody Alquiler alquiler) {
        return service.update(id, alquiler);
    }

    @PatchMapping("/{id}/activar")
    public Mono<ResponseEntity<Alquiler>> activar(@PathVariable Long id) {
        return service.cambiarEstado(id, true)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/anular")
    public Mono<ResponseEntity<Alquiler>> anular(@PathVariable Long id) {
        return service.cambiarEstado(id, false)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}

package hct.vilcapuma.marilyn.rest;

import hct.vilcapuma.marilyn.model.Cliente;
import hct.vilcapuma.marilyn.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteRest {
    private final ClienteService service;

    @GetMapping
    public Flux<Cliente> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Cliente>> findById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Cliente> save(@RequestBody Cliente cliente) {
        return service.save(cliente);
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Cliente>> update(@PathVariable Long id, @RequestBody Cliente cliente) {
        return service.update(id, cliente)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteById(@PathVariable Long id) {
        return service.findById(id)
                .flatMap(cliente -> service.deleteById(id)
                        .thenReturn(ResponseEntity.noContent().<Void>build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/activar")
    public Mono<ResponseEntity<Cliente>> activar(@PathVariable Long id) {
        return service.cambiarEstado(id, true)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/desactivar")
    public Mono<ResponseEntity<Cliente>> desactivar(@PathVariable Long id) {
        return service.cambiarEstado(id, false)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}

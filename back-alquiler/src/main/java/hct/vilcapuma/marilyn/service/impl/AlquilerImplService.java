package hct.vilcapuma.marilyn.service.impl;

import hct.vilcapuma.marilyn.model.Alquiler;
import hct.vilcapuma.marilyn.repository.AlquilerRepository;
import hct.vilcapuma.marilyn.service.AlquilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AlquilerImplService implements AlquilerService {
    private final AlquilerRepository repository;
    private final WebClient clienteWebClient;

    @Override
    public Flux<Alquiler> findAll() {
        return repository.findAll();
    }

    @Override
    public Mono<Alquiler> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Mono<Alquiler> save(Alquiler alquiler) {
        if (alquiler.getClienteId() == null
                || alquiler.getDias() == null || alquiler.getDias() <= 0
                || alquiler.getFechaInicio() == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "clienteId, dias (> 0) y fechaInicio son obligatorios"));
        }
        return validarCliente(alquiler.getClienteId())
                .then(Mono.defer(() -> {
                    alquiler.setId(null);
                    alquiler.setEstado(true);
                    alquiler.setFechaFin(alquiler.getFechaInicio().plusDays(alquiler.getDias()));
                    if (alquiler.getPrecioPorDia() != null) {
                        alquiler.setTotal(alquiler.getPrecioPorDia()
                                .multiply(BigDecimal.valueOf(alquiler.getDias())));
                    }
                    if (alquiler.getTotal() == null) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Debe enviar precioPorDia o total"));
                    }
                    return repository.save(alquiler);
                }));
    }

    @Override
    public Mono<Alquiler> update(Long id, Alquiler alquiler) {
        if (alquiler.getClienteId() == null
                || alquiler.getDias() == null || alquiler.getDias() <= 0
                || alquiler.getFechaInicio() == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "clienteId, dias (> 0) y fechaInicio son obligatorios"));
        }
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El alquiler " + id + " no existe")))
                .flatMap(existente -> {
                    if (!Boolean.TRUE.equals(existente.getEstado())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT,
                                "Solo se puede actualizar un alquiler en estado ACTIVO"));
                    }
                    return Mono.just(existente);
                })
                .flatMap(existente -> validarCliente(alquiler.getClienteId())
                        .then(Mono.defer(() -> {
                            alquiler.setId(id);
                            alquiler.setEstado(existente.getEstado());
                            alquiler.setFechaFin(alquiler.getFechaInicio().plusDays(alquiler.getDias()));
                            if (alquiler.getPrecioPorDia() != null) {
                                alquiler.setTotal(alquiler.getPrecioPorDia()
                                        .multiply(BigDecimal.valueOf(alquiler.getDias())));
                            }
                            if (alquiler.getTotal() == null) {
                                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "Debe enviar precioPorDia o total"));
                            }
                            return repository.save(alquiler);
                        })));
    }

    @Override
    public Mono<Alquiler> cambiarEstado(Long id, boolean estado) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setEstado(estado);
                    return repository.save(existente);
                });
    }

    /** Transaccion: verifica contra el microservicio Cliente que el cliente exista y este ACTIVO. */
    private Mono<Void> validarCliente(Long clienteId) {
        return clienteWebClient.get()
                .uri("/api/v1/clientes/{id}", clienteId)
                .retrieve()
                .onStatus(status -> status == HttpStatus.NOT_FOUND,
                        response -> Mono.error(new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                "El cliente " + clienteId + " no existe")))
                .bodyToMono(ClienteResponse.class)
                .flatMap(cliente -> {
                    if (!"ACTIVO".equalsIgnoreCase(cliente.estado())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                "El cliente " + clienteId + " no esta ACTIVO"));
                    }
                    return Mono.empty();
                });
    }

    private record ClienteResponse(Long id, String nombres, String apellidos, String estado) {
    }
}

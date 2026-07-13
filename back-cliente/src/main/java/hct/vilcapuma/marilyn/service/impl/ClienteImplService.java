package hct.vilcapuma.marilyn.service.impl;

import hct.vilcapuma.marilyn.model.Cliente;
import hct.vilcapuma.marilyn.repository.ClienteRepository;
import hct.vilcapuma.marilyn.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ClienteImplService implements ClienteService {
    private final ClienteRepository repository;

    @Override
    public Flux<Cliente> findAll() {
        return repository.findAll();
    }

    @Override
    public Mono<Cliente> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Mono<Cliente> save(Cliente cliente) {
        cliente.setId(null);
        cliente.setEstado(true);
        return repository.save(cliente);
    }

    @Override
    public Mono<Cliente> update(Long id, Cliente cliente) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setNombres(cliente.getNombres());
                    existente.setApellidos(cliente.getApellidos());
                    existente.setDni(cliente.getDni());
                    existente.setCorreo(cliente.getCorreo());
                    existente.setCelular(cliente.getCelular());
                    existente.setLicencia(cliente.getLicencia());
                    return repository.save(existente);
                });
    }

    @Override
    public Mono<Void> deleteById(Long id) {
        return repository.deleteById(id);
    }

    @Override
    public Mono<Cliente> cambiarEstado(Long id, boolean estado) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setEstado(estado);
                    return repository.save(existente);
                });
    }
}

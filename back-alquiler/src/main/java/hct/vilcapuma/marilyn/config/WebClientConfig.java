package hct.vilcapuma.marilyn.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient clienteWebClient(@Value("${services.cliente.url}") String clienteUrl) {
        return WebClient.builder()
                .baseUrl(clienteUrl)
                .build();
    }
}

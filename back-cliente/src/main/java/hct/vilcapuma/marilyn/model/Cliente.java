package hct.vilcapuma.marilyn.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "cliente")
public class Cliente {
    @Id
    private Long id;
    private String nombres;
    private String apellidos;
    private String dni;
    private String correo;
    private String celular;
    private String licencia;
    @JsonIgnore
    private Boolean estado;

    @Transient
    @JsonProperty(value = "estado", access = JsonProperty.Access.READ_ONLY)
    public String getEstadoTexto() {
        return Boolean.TRUE.equals(estado) ? "ACTIVO" : "INACTIVO";
    }
}

package hct.vilcapuma.marilyn.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "alquiler")
public class Alquiler {
    @Id
    private Long id;

    @Column("cliente_id")
    private Long clienteId;

    private Integer dias;

    @Column("fecha_inicio")
    private LocalDate fechaInicio;

    @Column("fecha_fin")
    private LocalDate fechaFin;

    private BigDecimal total;

    @JsonIgnore
    private Boolean estado;

    // Precio por dia: solo entra en la peticion, no se persiste
    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private BigDecimal precioPorDia;

    @Transient
    @JsonProperty(value = "estado", access = JsonProperty.Access.READ_ONLY)
    public String getEstadoTexto() {
        return Boolean.TRUE.equals(estado) ? "ACTIVO" : "INACTIVO";
    }
}

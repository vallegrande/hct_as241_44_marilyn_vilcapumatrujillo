CREATE TABLE IF NOT EXISTS alquiler (
    id             BIGSERIAL      PRIMARY KEY,
    cliente_id     BIGINT         NOT NULL,
    dias           INTEGER        NOT NULL,
    fecha_inicio   DATE           NOT NULL,
    fecha_fin      DATE           NOT NULL,
    total          NUMERIC(10,2)  NOT NULL,
    estado         BOOLEAN        NOT NULL DEFAULT TRUE
    );

CREATE INDEX IF NOT EXISTS idx_alquiler_estado ON alquiler(estado);
CREATE INDEX IF NOT EXISTS idx_alquiler_cliente ON alquiler(cliente_id);

insert into alquiler(cliente_id, dias, fecha_inicio, fecha_fin, total)
values (1, 3, '2026-07-03', '2026-07-06', 720.00);

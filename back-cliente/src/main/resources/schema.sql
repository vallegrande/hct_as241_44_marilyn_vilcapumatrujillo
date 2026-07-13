CREATE TABLE IF NOT EXISTS cliente (
    id             BIGSERIAL       PRIMARY KEY,
    nombres        VARCHAR(80)    NOT NULL,
    apellidos      VARCHAR(150)      NOT NULL,
    dni            VARCHAR(8)  NOT NULL,
    correo         VARCHAR(300)    NOT NULL,
    celular        VARCHAR(15)     NOT NULL,
    licencia       VARCHAR(100)    NOT NULL,
    estado          BOOLEAN        NOT NULL DEFAULT TRUE
    );

CREATE INDEX IF NOT EXISTS idx_cliente_estado  ON cliente(estado);

insert into cliente(nombres, apellidos, dni, correo, celular, licencia) values('Marilyn', 'Vilcapuma', '12345678', 'marilyn.vilcapuma@example.com', '987654321', 'L-12345678');

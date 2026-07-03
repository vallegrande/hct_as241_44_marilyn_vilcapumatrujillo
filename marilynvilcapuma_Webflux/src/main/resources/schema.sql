CREATE TABLE IF NOT EXISTS "persona" (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(60),
    dni INT,
    phone INT,
    email VARCHAR(150),
    license VARCHAR(150),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO "persona" (first_name, last_name, dni, phone, email, license)
VALUES ('Marilyn', 'Vilcapuma Trujillo', 74124567, 965789325, 'marilyn@gmail.com', 'Q123456789');

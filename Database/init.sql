CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password) VALUES 
('Testuser', '$2a$12$icnKDpNiuX22n3JplKBgPujGtCqm50MvGTDVbeV/EAA8wDCKW6lC6'); /*pw: password*/

CREATE TABLE IF NOT EXISTS temperature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value DECIMAL(5, 2) NOT NULL,
    heating_on TINYINT(1) NOT NULL,
    device_timestamp TIMESTAMP NOT NULL,
    server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS humidity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value DECIMAL(5, 2) NOT NULL,
    heating_on TINYINT(1) NOT NULL,
    device_timestamp TIMESTAMP NOT NULL,
    server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS co2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value INT NOT NULL,
    heating_on TINYINT(1) NOT NULL,
    device_timestamp TIMESTAMP NOT NULL,
    server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heating (
  id INT PRIMARY KEY,
  manual_active TINYINT(1) NOT NULL,
  manual_temperature DECIMAL(5, 2) NOT NULL,
  high_temperature DECIMAL(5, 2) NOT NULL,
  low_temperature DECIMAL(5, 2) NOT NULL,
  high_start TIME NOT NULL,
  high_end TIME NOT NULL,
  schedule_active TINYINT(1) NOT NULL
);
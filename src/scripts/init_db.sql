-- Base y uso
CREATE DATABASE IF NOT EXISTS carbid
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE carbid;

-- Limpieza segura (orden correcto por FKs)
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS vehicle_images;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- Usuarios (con perfil)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer','seller') NOT NULL DEFAULT 'buyer',
  phone VARCHAR(20) NULL,
  profile_picture VARCHAR(500) NULL,  -- URL de la foto de perfil
  bio TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Vehículos
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year SMALLINT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  mileage INT NULL,                -- opcional (km)
  transmission VARCHAR(50) NULL,   -- opcional
  fuel VARCHAR(50) NULL,           -- opcional
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_seller
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_vehicles_seller (seller_id),
  INDEX idx_vehicles_brand_model (brand, model)
) ENGINE=InnoDB;

-- Imágenes (se guardan URLs)
CREATE TABLE vehicle_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  url VARCHAR(500) NOT NULL, -- apunta a S3/CDN o /uploads/archivo.jpg
  CONSTRAINT fk_image_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_images_vehicle (vehicle_id)
) ENGINE=InnoDB;

-- Subastas
CREATE TABLE auctions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL UNIQUE,     -- una subasta por vehículo
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME NOT NULL,
  status ENUM('scheduled','active','closed') NOT NULL DEFAULT 'active',
  min_increment DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  current_price DECIMAL(10,2) DEFAULT NULL,
  winner_bid_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auction_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_auctions_status_end (status, end_time)
) ENGINE=InnoDB;

-- Pujas
CREATE TABLE bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  auction_id INT NOT NULL,
  bidder_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bid_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  CONSTRAINT fk_bid_user
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bids_auction_time (auction_id, created_at),
  INDEX idx_bids_auction_amount (auction_id, amount)
) ENGINE=InnoDB;

-- Datos demo (opcionales)
INSERT INTO users (name, email, password_hash, role, phone, profile_picture, bio) VALUES
('Vendedor Demo', 'seller@demo.com', '$2a$10$abcdefghijklmnopqrstuv', 'seller', '+50200000000', 'https://example.com/perfil.jpg', 'Vendedor verificado.'),
('Comprador Demo', 'buyer@demo.com', '$2a$10$abcdefghijklmnopqrstuv', 'buyer', NULL, NULL, NULL);

INSERT INTO vehicles (seller_id, title, brand, model, year, description, base_price, mileage, transmission, fuel) VALUES
(1, 'Toyota Camry 2020', 'Toyota', 'Camry', 2020, 'Excelente estado', 15000.00, 45000, 'Automática', 'Gasolina');

INSERT INTO vehicle_images (vehicle_id, url) VALUES
(1, 'https://example.com/camry1.jpg'),
(1, 'https://example.com/camry2.jpg');

INSERT INTO auctions (vehicle_id, end_time, status, min_increment, current_price)
VALUES (1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'active', 50.00, 15000.00);

INSERT INTO bids (auction_id, bidder_id, amount) VALUES (1, 2, 15100.00);
UPDATE auctions SET current_price = 15100.00 WHERE id = 1;
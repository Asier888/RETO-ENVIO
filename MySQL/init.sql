CREATE TABLE IF NOT EXISTS almacen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME,
    temperatura DECIMAL(5,2),
    humedad DECIMAL(5,2),
    Xvibracion DECIMAL(5,2),
    Yvibracion DECIMAL(5,2),
    Zvibracion DECIMAL(5,2)
);

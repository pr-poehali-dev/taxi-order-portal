CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    from_latitude DECIMAL(10,8),
    from_longitude DECIMAL(11,8),
    to_latitude DECIMAL(10,8),
    to_longitude DECIMAL(11,8),
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

INSERT INTO drivers (name, phone, car_model, car_number, rating, latitude, longitude) VALUES
('Александр', '+7 (999) 111-11-11', 'Toyota Camry', 'А123АА777', 4.9, 55.751244, 37.618423),
('Михаил', '+7 (999) 222-22-22', 'Hyundai Solaris', 'В456ВВ777', 4.8, 55.753544, 37.621423),
('Дмитрий', '+7 (999) 333-33-33', 'Skoda Octavia', 'С789СС777', 5.0, 55.749244, 37.615423),
('Сергей', '+7 (999) 444-44-44', 'Kia Rio', 'Д012ДД777', 4.7, 55.752544, 37.619423);

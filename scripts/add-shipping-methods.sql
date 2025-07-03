-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  estimated_days INT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  carrier_code VARCHAR(50),
  service_code VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add shipping_method_id to orders table
ALTER TABLE orders
ADD COLUMN shipping_method_id VARCHAR(255),
ADD INDEX shipping_method_idx (shipping_method_id),
ADD CONSTRAINT shipping_method_fk
FOREIGN KEY (shipping_method_id)
REFERENCES shipping_methods(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Insert some default shipping methods
INSERT INTO shipping_methods (id, name, code, description, price, estimated_days, is_active, sort_order, carrier_code, service_code)
VALUES
  (UUID(), 'Standard Ground', 'standard', 'Standard ground shipping service', 9.99, 5, true, 0, 'ups', 'ground'),
  (UUID(), 'Express 2-Day', 'express', 'Express 2-day shipping service', 19.99, 2, true, 1, 'fedex', '2day'),
  (UUID(), 'Next Day Air', 'overnight', 'Next day air shipping service', 29.99, 1, true, 2, 'ups', 'overnight'); 
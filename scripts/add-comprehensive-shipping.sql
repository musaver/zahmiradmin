-- Create shipping carriers table
CREATE TABLE IF NOT EXISTS shipping_carriers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(255),
    tracking_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    api_key VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create shipping service types table
CREATE TABLE IF NOT EXISTS shipping_service_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns to shipping_methods table
ALTER TABLE shipping_methods 
ADD COLUMN IF NOT EXISTS carrier_id VARCHAR(36),
ADD COLUMN IF NOT EXISTS service_type_id VARCHAR(36);

-- Add foreign key constraints
ALTER TABLE shipping_methods 
ADD CONSTRAINT IF NOT EXISTS fk_shipping_methods_carrier 
FOREIGN KEY (carrier_id) REFERENCES shipping_carriers(id) ON DELETE SET NULL;

ALTER TABLE shipping_methods 
ADD CONSTRAINT IF NOT EXISTS fk_shipping_methods_service_type 
FOREIGN KEY (service_type_id) REFERENCES shipping_service_types(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_code ON shipping_carriers(code);
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_active ON shipping_carriers(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_sort ON shipping_carriers(sort_order);

CREATE INDEX IF NOT EXISTS idx_shipping_service_types_code ON shipping_service_types(code);
CREATE INDEX IF NOT EXISTS idx_shipping_service_types_active ON shipping_service_types(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_service_types_sort ON shipping_service_types(sort_order);
CREATE INDEX IF NOT EXISTS idx_shipping_service_types_category ON shipping_service_types(category);

CREATE INDEX IF NOT EXISTS idx_shipping_methods_carrier ON shipping_methods(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_service_type ON shipping_methods(service_type_id);

-- Insert sample carriers
INSERT INTO shipping_carriers (id, name, code, description, website, tracking_url, is_active, sort_order) VALUES
('carrier-ups', 'UPS', 'ups', 'United Parcel Service - Reliable package delivery worldwide', 'https://www.ups.com', 'https://www.ups.com/track?tracknum={tracking_number}', true, 1),
('carrier-fedex', 'FedEx', 'fedex', 'Federal Express - Fast and reliable shipping solutions', 'https://www.fedex.com', 'https://www.fedex.com/apps/fedextrack/?tracknumbers={tracking_number}', true, 2),
('carrier-usps', 'USPS', 'usps', 'United States Postal Service - Affordable shipping nationwide', 'https://www.usps.com', 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={tracking_number}', true, 3),
('carrier-dhl', 'DHL', 'dhl', 'DHL Express - International shipping specialist', 'https://www.dhl.com', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', true, 4),
('carrier-custom', 'Custom/Local', 'custom', 'Custom or local delivery service', null, null, true, 5)
ON CONFLICT (code) DO NOTHING;

-- Insert sample service types
INSERT INTO shipping_service_types (id, name, code, description, category, is_active, sort_order) VALUES
('service-ground', 'Ground Shipping', 'ground', 'Standard ground delivery service', 'ground', true, 1),
('service-express', 'Express Delivery', 'express', 'Fast express delivery service', 'express', true, 2),
('service-overnight', 'Overnight Delivery', 'overnight', 'Next business day delivery', 'overnight', true, 3),
('service-2day', '2-Day Delivery', '2day', 'Delivery within 2 business days', 'express', true, 4),
('service-standard', 'Standard Delivery', 'standard', 'Standard delivery service', 'standard', true, 5),
('service-expedited', 'Expedited Delivery', 'expedited', 'Faster than standard delivery', 'expedited', true, 6),
('service-priority', 'Priority Delivery', 'priority', 'High priority delivery service', 'express', true, 7),
('service-economy', 'Economy Delivery', 'economy', 'Budget-friendly delivery option', 'ground', true, 8),
('service-international', 'International Delivery', 'international', 'International shipping service', 'international', true, 9),
('service-same-day', 'Same Day Delivery', 'same-day', 'Delivery on the same day', 'express', true, 10)
ON CONFLICT (code) DO NOTHING;

-- Update existing shipping methods to use new structure (optional migration)
-- This will attempt to match existing carrier_code and service_code to the new tables
UPDATE shipping_methods 
SET carrier_id = (
    SELECT id FROM shipping_carriers 
    WHERE shipping_carriers.code = shipping_methods.carrier_code
    LIMIT 1
)
WHERE carrier_code IS NOT NULL 
AND carrier_id IS NULL;

UPDATE shipping_methods 
SET service_type_id = (
    SELECT id FROM shipping_service_types 
    WHERE shipping_service_types.code = shipping_methods.service_code
    LIMIT 1
)
WHERE service_code IS NOT NULL 
AND service_type_id IS NULL;

-- Add some sample shipping methods with the new structure
INSERT INTO shipping_methods (id, name, code, description, price, estimated_days, carrier_id, service_type_id, is_active, sort_order) VALUES
('method-ups-ground', 'UPS Ground', 'ups-ground', 'UPS Ground delivery service', 9.99, 5, 'carrier-ups', 'service-ground', true, 1),
('method-fedex-express', 'FedEx Express', 'fedex-express', 'FedEx Express overnight delivery', 24.99, 1, 'carrier-fedex', 'service-overnight', true, 2),
('method-usps-priority', 'USPS Priority Mail', 'usps-priority', 'USPS Priority Mail 2-day delivery', 14.99, 2, 'carrier-usps', 'service-2day', true, 3)
ON CONFLICT (code) DO NOTHING;

COMMIT; 
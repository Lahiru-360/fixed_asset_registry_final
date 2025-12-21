
CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT NOW()
);




CREATE TABLE IF NOT EXISTS asset_requests (
  request_id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(employee_id),
  asset_name VARCHAR(255) NOT NULL,
	quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE asset_requests 
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES employees(employee_id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;


CREATE TABLE IF NOT EXISTS quotations (
  quotation_id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES asset_requests(request_id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_email VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS asset_name VARCHAR(255) NOT NULL;

ALTER TABLE quotations
ADD COLUMN is_final BOOLEAN DEFAULT FALSE;


CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES asset_requests(request_id),
    quotation_id INTEGER NOT NULL REFERENCES quotations(quotation_id),
    
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255) NOT NULL,
    vendor_price NUMERIC(12,2) NOT NULL,

    asset_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    po_number VARCHAR(50) UNIQUE NOT NULL
);

ALTER TABLE purchase_orders 
ADD COLUMN sent BOOLEAN DEFAULT FALSE,
ADD COLUMN received BOOLEAN DEFAULT FALSE,
ADD COLUMN pdf_path TEXT;

ALTER TABLE purchase_orders
ADD CONSTRAINT unique_po_per_request UNIQUE (request_id);



CREATE TABLE IF NOT EXISTS goods_received_notes (
    grn_id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    grn_number VARCHAR(50) NOT NULL,
    pdf_path TEXT,
    received_date TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE grn_seq START 1;
CREATE SEQUENCE po_seq START 1;
CREATE SEQUENCE IF NOT EXISTS asset_seq START 1;


CREATE TABLE IF NOT EXISTS asset_categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  useful_life INTEGER ,                     -- years
  depreciation_rate NUMERIC(5,2) NOT NULL,          -- % per year
  residual_value NUMERIC(12,2) DEFAULT 0,           -- LKR
  depreciation_method VARCHAR(20) DEFAULT 'SL',     -- straight-line
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO asset_categories (name, useful_life, depreciation_rate, residual_value)
VALUES
('Land', NULL, 0, 0),
('Buildings', 40, 2.5, 0),
('Machinery & Equipment', 10, 10, 0),
('Vehicles', 5, 20, 0),
('Furniture & Fixtures', 8, 12.5, 0),
('Computer Equipment & IT', 4, 25, 0),
('Office Equipment', 7, 14.29, 0)
ON CONFLICT (name) DO NOTHING;



CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(po_id),

    asset_name VARCHAR(255) NOT NULL,

    category_id INTEGER REFERENCES asset_categories(category_id),

    purchase_cost NUMERIC(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1, 

    useful_life INTEGER NOT NULL,   
    depreciation_rate NUMERIC(5,2) NOT NULL,  
    residual_value NUMERIC(12,2) DEFAULT 0,

    department VARCHAR(255), 

    acquisition_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE assets
ADD COLUMN asset_number VARCHAR(40) UNIQUE NOT NULL;










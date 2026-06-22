-- ============================================================================
-- SEED DATA — Enterprise Inventory Management System
-- Matches schema.sql column names exactly
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- ROLES
-- ============================================================================
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Full system access including user management and audit logs'),
(2, 'Manager', 'Manages products, orders, suppliers, customers, and views reports'),
(3, 'Warehouse Staff', 'Manages inventory, receives shipments, and views stock levels');

-- ============================================================================
-- PERMISSIONS (25 granular permissions)
-- ============================================================================
INSERT INTO permissions (permission_id, permission_name, module, description) VALUES
(1, 'products:create', 'products', 'Create new products'),
(2, 'products:read', 'products', 'View product listings and details'),
(3, 'products:update', 'products', 'Update existing product information'),
(4, 'products:delete', 'products', 'Soft-delete products from catalog'),
(5, 'suppliers:create', 'suppliers', 'Register new suppliers'),
(6, 'suppliers:read', 'suppliers', 'View supplier information'),
(7, 'suppliers:update', 'suppliers', 'Update supplier details'),
(8, 'suppliers:delete', 'suppliers', 'Remove suppliers from system'),
(9, 'customers:create', 'customers', 'Add new customer accounts'),
(10, 'customers:read', 'customers', 'View customer information'),
(11, 'customers:update', 'customers', 'Update customer details'),
(12, 'customers:delete', 'customers', 'Remove customer accounts'),
(13, 'orders:create', 'orders', 'Create purchase and sales orders'),
(14, 'orders:read', 'orders', 'View order information'),
(15, 'orders:update', 'orders', 'Modify existing orders'),
(16, 'orders:approve', 'orders', 'Approve purchase orders'),
(17, 'inventory:read', 'inventory', 'View stock levels and movements'),
(18, 'inventory:adjust', 'inventory', 'Make manual stock adjustments'),
(19, 'inventory:receive', 'inventory', 'Receive incoming shipments'),
(20, 'inventory:reorder', 'inventory', 'Create and manage reorder requests'),
(21, 'payments:create', 'payments', 'Record payment transactions'),
(22, 'payments:read', 'payments', 'View payment records'),
(23, 'reports:view', 'reports', 'Access business reports and analytics'),
(24, 'admin:audit', 'admin', 'View system audit logs'),
(25, 'admin:users', 'admin', 'Manage user accounts and roles');

-- Admin gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- Manager gets most permissions except admin
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3),
(2, 5), (2, 6), (2, 7),
(2, 9), (2, 10), (2, 11),
(2, 13), (2, 14), (2, 15), (2, 16),
(2, 17), (2, 18), (2, 19), (2, 20),
(2, 21), (2, 22), (2, 23);

-- Warehouse Staff gets limited permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 2), (3, 6), (3, 10), (3, 14),
(3, 17), (3, 18), (3, 19);

-- ============================================================================
-- USERS (password for all: Password123!)
-- ============================================================================
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone, is_active) VALUES
(1, 'admin', 'admin@smartretail.com', '$2b$12$85YFicOS/llHlTNkz354Yu0ok/xY3lInFWHpE8872v2qO0i/Q1SJS', 'Rajesh', 'Kumar', '+91-9876543210', TRUE),
(2, 'manager', 'manager@smartretail.com', '$2b$12$85YFicOS/llHlTNkz354Yu0ok/xY3lInFWHpE8872v2qO0i/Q1SJS', 'Priya', 'Sharma', '+91-9876543211', TRUE),
(3, 'warehouse1', 'warehouse1@smartretail.com', '$2b$12$85YFicOS/llHlTNkz354Yu0ok/xY3lInFWHpE8872v2qO0i/Q1SJS', 'Amit', 'Patel', '+91-9876543212', TRUE),
(4, 'warehouse2', 'warehouse2@smartretail.com', '$2b$12$85YFicOS/llHlTNkz354Yu0ok/xY3lInFWHpE8872v2qO0i/Q1SJS', 'Sneha', 'Reddy', '+91-9876543213', TRUE),
(5, 'manager2', 'manager2@smartretail.com', '$2b$12$85YFicOS/llHlTNkz354Yu0ok/xY3lInFWHpE8872v2qO0i/Q1SJS', 'Vikram', 'Singh', '+91-9876543214', TRUE);

-- ============================================================================
-- USER_ROLES
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 2);

-- ============================================================================
-- CATEGORIES
-- ============================================================================
INSERT INTO categories (category_id, category_name, description, parent_category_id, is_active) VALUES
(1, 'Electronics', 'Electronic devices and accessories', NULL, TRUE),
(2, 'Computers & Laptops', 'Desktop and laptop computers', 1, TRUE),
(3, 'Mobile Accessories', 'Phone cases, chargers, and accessories', 1, TRUE),
(4, 'Clothing', 'Apparel and fashion items', NULL, TRUE),
(5, 'Men''s Wear', 'Men''s clothing and accessories', 4, TRUE),
(6, 'Women''s Wear', 'Women''s clothing and accessories', 4, TRUE),
(7, 'Home & Kitchen', 'Home appliances and kitchenware', NULL, TRUE),
(8, 'Sports & Fitness', 'Sports equipment and fitness gear', NULL, TRUE),
(9, 'Office Supplies', 'Stationery and office equipment', NULL, TRUE),
(10, 'Books & Media', 'Books, music, and digital media', NULL, TRUE);

-- ============================================================================
-- BRANDS
-- ============================================================================
INSERT INTO brands (brand_id, brand_name, logo_url, website, is_active) VALUES
(1, 'TechVista', NULL, 'https://techvista.example.com', TRUE),
(2, 'UrbanStyle', NULL, 'https://urbanstyle.example.com', TRUE),
(3, 'HomeEssentials', NULL, 'https://homeessentials.example.com', TRUE),
(4, 'SportMax', NULL, 'https://sportmax.example.com', TRUE),
(5, 'OfficeHub', NULL, 'https://officehub.example.com', TRUE),
(6, 'GadgetPro', NULL, 'https://gadgetpro.example.com', TRUE),
(7, 'NatureWear', NULL, 'https://naturewear.example.com', TRUE),
(8, 'BookWorm', NULL, 'https://bookworm.example.com', TRUE);

-- ============================================================================
-- PRODUCTS (50 products)
-- ============================================================================
INSERT INTO products (product_id, sku, name, description, category_id, brand_id, unit_price, cost_price, reorder_level, reorder_qty, unit_of_measure, weight_kg, is_active) VALUES
(1, 'TV-LP-001', 'TechVista Pro Laptop 15"', 'High-performance laptop with 16GB RAM, 512GB SSD', 2, 1, 899.9900, 620.0000, 10, 25, 'EACH', 2.100, TRUE),
(2, 'TV-LP-002', 'TechVista Air Laptop 13"', 'Ultra-thin laptop with 8GB RAM, 256GB SSD', 2, 1, 699.9900, 480.0000, 8, 20, 'EACH', 1.400, TRUE),
(3, 'TV-MN-001', 'TechVista 27" 4K Monitor', 'Ultra HD IPS monitor with HDR support', 1, 1, 449.9900, 290.0000, 12, 30, 'EACH', 5.800, TRUE),
(4, 'GP-KB-001', 'GadgetPro Mechanical Keyboard', 'RGB backlit mechanical keyboard with Cherry MX switches', 1, 6, 129.9900, 72.0000, 20, 50, 'EACH', 0.950, TRUE),
(5, 'GP-MS-001', 'GadgetPro Wireless Mouse', 'Ergonomic wireless mouse with 4000 DPI', 1, 6, 49.9900, 22.0000, 30, 80, 'EACH', 0.120, TRUE),
(6, 'GP-HS-001', 'GadgetPro Noise Cancelling Headphones', 'Over-ear ANC headphones with 30hr battery', 1, 6, 199.9900, 105.0000, 15, 40, 'EACH', 0.280, TRUE),
(7, 'GP-WC-001', 'GadgetPro Webcam HD', '1080p HD webcam with built-in microphone', 3, 6, 79.9900, 38.0000, 25, 60, 'EACH', 0.150, TRUE),
(8, 'GP-PB-001', 'GadgetPro Power Bank 20000mAh', 'Fast charging portable power bank', 3, 6, 39.9900, 18.0000, 40, 100, 'EACH', 0.450, TRUE),
(9, 'GP-CH-001', 'GadgetPro USB-C Fast Charger', '65W GaN USB-C charger', 3, 6, 34.9900, 15.0000, 50, 120, 'EACH', 0.100, TRUE),
(10, 'GP-CB-001', 'GadgetPro USB-C Cable 2m', 'Braided USB-C to USB-C cable', 3, 6, 14.9900, 4.5000, 80, 200, 'EACH', 0.050, TRUE),
(11, 'US-TS-001', 'UrbanStyle Classic T-Shirt', '100% cotton crew neck t-shirt', 5, 2, 24.9900, 8.5000, 50, 150, 'EACH', 0.200, TRUE),
(12, 'US-TS-002', 'UrbanStyle Premium Polo', 'Pique cotton polo shirt', 5, 2, 39.9900, 14.0000, 40, 100, 'EACH', 0.250, TRUE),
(13, 'US-JN-001', 'UrbanStyle Slim Fit Jeans', 'Stretch denim slim fit jeans', 5, 2, 59.9900, 22.0000, 30, 80, 'EACH', 0.550, TRUE),
(14, 'US-JK-001', 'UrbanStyle Bomber Jacket', 'Lightweight nylon bomber jacket', 5, 2, 89.9900, 38.0000, 20, 50, 'EACH', 0.650, TRUE),
(15, 'NW-DR-001', 'NatureWear Organic Dress', 'Sustainable organic cotton midi dress', 6, 7, 69.9900, 28.0000, 25, 60, 'EACH', 0.300, TRUE),
(16, 'NW-BL-001', 'NatureWear Bamboo Blouse', 'Eco-friendly bamboo fabric blouse', 6, 7, 44.9900, 18.0000, 30, 70, 'EACH', 0.180, TRUE),
(17, 'NW-LG-001', 'NatureWear Yoga Leggings', 'Recycled polyester yoga leggings', 6, 7, 49.9900, 20.0000, 35, 80, 'EACH', 0.220, TRUE),
(18, 'NW-SK-001', 'NatureWear Linen Skirt', 'A-line linen midi skirt', 6, 7, 54.9900, 22.0000, 20, 50, 'EACH', 0.250, TRUE),
(19, 'HE-CF-001', 'HomeEssentials Coffee Maker', '12-cup programmable drip coffee maker', 7, 3, 79.9900, 42.0000, 15, 40, 'EACH', 3.200, TRUE),
(20, 'HE-BL-001', 'HomeEssentials Power Blender', '1000W high-speed countertop blender', 7, 3, 69.9900, 32.0000, 12, 30, 'EACH', 2.800, TRUE),
(21, 'HE-TT-001', 'HomeEssentials Electric Toaster', '4-slice stainless steel toaster', 7, 3, 44.9900, 20.0000, 18, 45, 'EACH', 1.900, TRUE),
(22, 'HE-IR-001', 'HomeEssentials Steam Iron', '2200W steam iron with ceramic soleplate', 7, 3, 39.9900, 18.0000, 20, 50, 'EACH', 1.400, TRUE),
(23, 'HE-VP-001', 'HomeEssentials Robot Vacuum', 'Smart robot vacuum with app control', 7, 3, 299.9900, 165.0000, 8, 20, 'EACH', 3.500, TRUE),
(24, 'HE-AP-001', 'HomeEssentials Air Purifier', 'HEPA air purifier for rooms up to 500 sq ft', 7, 3, 179.9900, 95.0000, 10, 25, 'EACH', 4.200, TRUE),
(25, 'SM-YM-001', 'SportMax Yoga Mat', 'Non-slip TPE yoga mat 6mm thick', 8, 4, 29.9900, 10.0000, 40, 100, 'EACH', 1.200, TRUE),
(26, 'SM-DB-001', 'SportMax Adjustable Dumbbells', 'Adjustable dumbbell set 5-25 lbs', 8, 4, 149.9900, 78.0000, 10, 25, 'EACH', 12.000, TRUE),
(27, 'SM-RB-001', 'SportMax Resistance Bands Set', '5-piece resistance band set with handles', 8, 4, 24.9900, 8.0000, 35, 90, 'EACH', 0.600, TRUE),
(28, 'SM-JR-001', 'SportMax Jump Rope', 'Speed jump rope with ball bearings', 8, 4, 14.9900, 4.5000, 50, 120, 'EACH', 0.300, TRUE),
(29, 'SM-WB-001', 'SportMax Water Bottle 1L', 'Insulated stainless steel water bottle', 8, 4, 19.9900, 7.0000, 60, 150, 'EACH', 0.350, TRUE),
(30, 'SM-FB-001', 'SportMax Football Size 5', 'Match quality synthetic leather football', 8, 4, 34.9900, 14.0000, 30, 70, 'EACH', 0.430, TRUE),
(31, 'OH-NB-001', 'OfficeHub Spiral Notebook A4', '200-page ruled spiral notebook', 9, 5, 4.9900, 1.5000, 100, 300, 'EACH', 0.350, TRUE),
(32, 'OH-PN-001', 'OfficeHub Ballpoint Pen Set', '10-pack blue ballpoint pens', 9, 5, 6.9900, 2.0000, 80, 200, 'EACH', 0.120, TRUE),
(33, 'OH-ST-001', 'OfficeHub Stapler Heavy Duty', 'Desktop stapler with 100 staple capacity', 9, 5, 12.9900, 5.0000, 40, 100, 'EACH', 0.450, TRUE),
(34, 'OH-PR-001', 'OfficeHub Desk Organizer', 'Mesh metal desk organizer with 6 compartments', 9, 5, 19.9900, 8.0000, 30, 70, 'EACH', 0.800, TRUE),
(35, 'OH-WB-001', 'OfficeHub Whiteboard 3x2 ft', 'Magnetic dry-erase whiteboard with markers', 9, 5, 44.9900, 22.0000, 15, 35, 'EACH', 2.500, TRUE),
(36, 'OH-CH-001', 'OfficeHub Ergonomic Chair', 'Adjustable ergonomic office chair with lumbar support', 9, 5, 249.9900, 135.0000, 8, 20, 'EACH', 15.000, TRUE),
(37, 'BW-NV-001', 'BookWorm Fiction Novel Collection', 'Bestselling fiction novel - hardcover', 10, 8, 16.9900, 6.0000, 30, 80, 'EACH', 0.450, TRUE),
(38, 'BW-TB-001', 'BookWorm Technical Reference', 'Programming reference handbook', 10, 8, 49.9900, 22.0000, 15, 40, 'EACH', 0.850, TRUE),
(39, 'BW-CB-001', 'BookWorm Children''s Activity Book', 'Educational activity book for ages 5-10', 10, 8, 9.9900, 3.5000, 50, 120, 'EACH', 0.300, TRUE),
(40, 'BW-CK-001', 'BookWorm Cookbook Collection', 'International cuisine cookbook', 10, 8, 24.9900, 10.0000, 20, 50, 'EACH', 0.650, TRUE),
(41, 'TV-TB-001', 'TechVista 10" Tablet', '10-inch tablet with 128GB storage', 1, 1, 349.9900, 210.0000, 12, 30, 'EACH', 0.480, TRUE),
(42, 'TV-SW-001', 'TechVista Smart Watch', 'Fitness smart watch with GPS and heart rate', 1, 1, 199.9900, 110.0000, 15, 35, 'EACH', 0.050, TRUE),
(43, 'GP-SP-001', 'GadgetPro Bluetooth Speaker', 'Portable waterproof bluetooth speaker', 1, 6, 59.9900, 26.0000, 25, 60, 'EACH', 0.550, TRUE),
(44, 'US-SH-001', 'UrbanStyle Running Shoes', 'Lightweight mesh running shoes', 8, 2, 79.9900, 35.0000, 20, 50, 'EACH', 0.650, TRUE),
(45, 'US-BP-001', 'UrbanStyle Laptop Backpack', 'Water-resistant 15.6" laptop backpack', 9, 2, 49.9900, 20.0000, 25, 60, 'EACH', 0.750, TRUE),
(46, 'HE-KN-001', 'HomeEssentials Knife Set', '8-piece stainless steel kitchen knife set', 7, 3, 59.9900, 28.0000, 15, 35, 'EACH', 2.100, TRUE),
(47, 'SM-TM-001', 'SportMax Treadmill', 'Foldable electric treadmill with display', 8, 4, 599.9900, 340.0000, 5, 10, 'EACH', 45.000, TRUE),
(48, 'OH-LP-001', 'OfficeHub Desk Lamp LED', 'Adjustable LED desk lamp with USB port', 9, 5, 34.9900, 15.0000, 25, 60, 'EACH', 0.950, TRUE),
(49, 'GP-HD-001', 'GadgetPro External Hard Drive 1TB', 'USB 3.0 portable external hard drive', 1, 6, 64.9900, 35.0000, 20, 50, 'EACH', 0.170, TRUE),
(50, 'TV-EP-001', 'TechVista Wireless Earbuds', 'True wireless earbuds with ANC', 1, 1, 129.9900, 58.0000, 25, 60, 'EACH', 0.060, TRUE);

-- ============================================================================
-- SUPPLIERS (10 suppliers)
-- ============================================================================
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, email, phone, address_line1, city, state, country, postal_code, payment_terms, is_active) VALUES
(1, 'TechWorld Distributors', 'Arun Mehta', 'arun@techworlddist.com', '+91-11-23456789', '42 Industrial Area Phase-2', 'New Delhi', 'Delhi', 'India', '110020', 'Net 30', TRUE),
(2, 'FashionHub Wholesale', 'Meera Joshi', 'meera@fashionhubwh.com', '+91-22-34567890', '15 Textile Market Road', 'Mumbai', 'Maharashtra', 'India', '400001', 'Net 45', TRUE),
(3, 'Home Appliance Corp', 'Suresh Iyer', 'suresh@homeappliancecorp.com', '+91-80-45678901', '88 Electronics City Phase-1', 'Bangalore', 'Karnataka', 'India', '560100', 'Net 30', TRUE),
(4, 'SportGear International', 'David Chen', 'david@sportgearintl.com', '+86-21-56789012', '200 Pudong Sports Center', 'Shanghai', 'Shanghai', 'China', '200120', 'Net 60', TRUE),
(5, 'Office Solutions Ltd', 'Kavitha Nair', 'kavitha@officesolutions.co.in', '+91-44-67890123', '33 Mount Road Business Park', 'Chennai', 'Tamil Nadu', 'India', '600002', 'Net 30', TRUE),
(6, 'Global Electronics Supply', 'Mike Thompson', 'mike@globalelectronics.com', '+1-408-7890123', '1200 Tech Drive Suite 300', 'San Jose', 'California', 'USA', '95131', 'Net 45', TRUE),
(7, 'BookMart Publishers', 'Ananya Roy', 'ananya@bookmartpub.com', '+91-33-89012345', '56 College Street', 'Kolkata', 'West Bengal', 'India', '700012', 'Net 30', TRUE),
(8, 'EcoFashion Textiles', 'Lisa Wang', 'lisa@ecofashiontex.com', '+86-571-90123456', '88 Silk Road Industrial Zone', 'Hangzhou', 'Zhejiang', 'China', '310000', 'Net 60', TRUE),
(9, 'Kitchen Pro Supplies', 'Rakesh Gupta', 'rakesh@kitchenprosup.com', '+91-141-01234567', '22 Mansarovar Industrial Area', 'Jaipur', 'Rajasthan', 'India', '302020', 'Net 30', TRUE),
(10, 'Digital Accessories Hub', 'Sarah Kim', 'sarah@digitalaccessories.kr', '+82-2-12345678', '45 Gangnam Tech Center', 'Seoul', 'Seoul', 'South Korea', '06100', 'Net 45', TRUE);

-- ============================================================================
-- WAREHOUSES (5 warehouses)
-- ============================================================================
INSERT INTO warehouses (warehouse_id, warehouse_name, warehouse_code, address_line1, city, state, country, capacity, manager_id, is_active) VALUES
(1, 'Central Warehouse Delhi', 'WH-DEL', 'Plot 42, Okhla Industrial Area', 'New Delhi', 'Delhi', 'India', 10000, 3, TRUE),
(2, 'West Hub Mumbai', 'WH-MUM', 'Unit 15, Bhiwandi Warehouse Complex', 'Mumbai', 'Maharashtra', 'India', 8000, 3, TRUE),
(3, 'South Distribution Center', 'WH-BLR', 'Block C, Whitefield Logistics Park', 'Bangalore', 'Karnataka', 'India', 12000, 4, TRUE),
(4, 'East Warehouse Kolkata', 'WH-KOL', 'Dock 8, Howrah Freight Terminal', 'Kolkata', 'West Bengal', 'India', 6000, 4, TRUE),
(5, 'North Fulfillment Hub', 'WH-CHD', 'Warehouse 23, Mohali Phase-8', 'Chandigarh', 'Punjab', 'India', 7000, 3, TRUE);

-- ============================================================================
-- CUSTOMERS (20 customers)
-- ============================================================================
INSERT INTO customers (customer_id, customer_name, customer_type, email, phone, address_line1, city, state, country, postal_code, credit_limit, is_active) VALUES
(1, 'Arjun Verma', 'retail', 'arjun.verma@email.com', '+91-9812345001', '12 Sector 44 Market', 'Gurugram', 'Haryana', 'India', '122003', 5000.0000, TRUE),
(2, 'Nisha Agarwal', 'retail', 'nisha.agarwal@email.com', '+91-9812345002', '45 MG Road', 'Pune', 'Maharashtra', 'India', '411001', 5000.0000, TRUE),
(3, 'ShopEasy Retail', 'wholesale', 'ravi@shopeasyretail.com', '+91-9812345003', '78 Commercial Street', 'Bangalore', 'Karnataka', 'India', '560001', 50000.0000, TRUE),
(4, 'Deepika Kapoor', 'retail', 'deepika.kapoor@email.com', '+91-9812345004', '23 Connaught Place', 'New Delhi', 'Delhi', 'India', '110001', 8000.0000, TRUE),
(5, 'TechZone Stores', 'wholesale', 'karthik@techzonestores.com', '+91-9812345005', '56 Anna Nagar', 'Chennai', 'Tamil Nadu', 'India', '600040', 75000.0000, TRUE),
(6, 'Pooja Deshmukh', 'retail', 'pooja.deshmukh@email.com', '+91-9812345006', '89 FC Road', 'Pune', 'Maharashtra', 'India', '411004', 6000.0000, TRUE),
(7, 'MegaMart Trading', 'wholesale', 'sanjay@megamarttrading.com', '+91-9812345007', '34 Ring Road', 'Ahmedabad', 'Gujarat', 'India', '380001', 100000.0000, TRUE),
(8, 'Anita Rao', 'retail', 'anita.rao@email.com', '+91-9812345008', '67 Brigade Road', 'Bangalore', 'Karnataka', 'India', '560025', 7000.0000, TRUE),
(9, 'ValueBuy Wholesale', 'wholesale', 'mohammed@valuebuywh.com', '+91-9812345009', '12 Charminar Market', 'Hyderabad', 'Telangana', 'India', '500002', 60000.0000, TRUE),
(10, 'Lakshmi Iyer', 'retail', 'lakshmi.iyer@email.com', '+91-9812345010', '45 Marine Drive', 'Mumbai', 'Maharashtra', 'India', '400020', 5000.0000, TRUE),
(11, 'QuickShip Enterprises', 'wholesale', 'rohit@quickshipent.com', '+91-9812345011', '78 Karol Bagh', 'New Delhi', 'Delhi', 'India', '110005', 80000.0000, TRUE),
(12, 'Swati Kulkarni', 'retail', 'swati.kulkarni@email.com', '+91-9812345012', '23 Baner Road', 'Pune', 'Maharashtra', 'India', '411045', 4000.0000, TRUE),
(13, 'Aditya Bhatt', 'retail', 'aditya.bhatt@email.com', '+91-9812345013', '56 Ellis Bridge', 'Ahmedabad', 'Gujarat', 'India', '380006', 6000.0000, TRUE),
(14, 'OfficeKart Solutions', 'wholesale', 'manisha@officekart.com', '+91-9812345014', '89 Hazratganj', 'Lucknow', 'Uttar Pradesh', 'India', '226001', 45000.0000, TRUE),
(15, 'Vivek Nair', 'retail', 'vivek.nair@email.com', '+91-9812345015', '12 MG Road', 'Kochi', 'Kerala', 'India', '682011', 5000.0000, TRUE),
(16, 'Priti Saxena', 'retail', 'priti.saxena@email.com', '+91-9812345016', '34 Civil Lines', 'Jaipur', 'Rajasthan', 'India', '302006', 5500.0000, TRUE),
(17, 'BulkBuy Traders', 'wholesale', 'gaurav@bulkbuytraders.com', '+91-9812345017', '67 Lajpat Nagar', 'New Delhi', 'Delhi', 'India', '110024', 90000.0000, TRUE),
(18, 'Rekha Srinivasan', 'retail', 'rekha.srini@email.com', '+91-9812345018', '23 T Nagar', 'Chennai', 'Tamil Nadu', 'India', '600017', 4500.0000, TRUE),
(19, 'SmartDeal Corp', 'wholesale', 'nikhil@smartdealcorp.com', '+91-9812345019', '56 Park Street', 'Kolkata', 'West Bengal', 'India', '700016', 70000.0000, TRUE),
(20, 'Divya Pillai', 'retail', 'divya.pillai@email.com', '+91-9812345020', '89 Trivandrum Road', 'Thiruvananthapuram', 'Kerala', 'India', '695001', 5000.0000, TRUE);

-- ============================================================================
-- INVENTORY
-- ============================================================================
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, last_counted_at) VALUES
(1, 1, 45, 5, NOW()), (2, 1, 38, 3, NOW()), (3, 1, 55, 8, NOW()),
(4, 1, 85, 10, NOW()), (5, 1, 120, 15, NOW()), (6, 1, 32, 4, NOW()),
(7, 1, 60, 5, NOW()), (8, 1, 150, 20, NOW()), (9, 1, 200, 25, NOW()),
(10, 1, 350, 30, NOW()), (11, 1, 180, 20, NOW()), (12, 1, 95, 10, NOW()),
(1, 2, 30, 2, NOW()), (2, 2, 25, 5, NOW()), (13, 2, 70, 8, NOW()),
(14, 2, 40, 5, NOW()), (15, 2, 55, 6, NOW()), (16, 2, 65, 8, NOW()),
(17, 2, 80, 10, NOW()), (18, 2, 45, 5, NOW()), (19, 2, 28, 3, NOW()),
(20, 2, 22, 2, NOW()), (21, 2, 35, 4, NOW()), (22, 2, 40, 5, NOW()),
(23, 3, 15, 2, NOW()), (24, 3, 20, 3, NOW()), (25, 3, 95, 10, NOW()),
(26, 3, 18, 2, NOW()), (27, 3, 80, 8, NOW()), (28, 3, 110, 15, NOW()),
(29, 3, 140, 18, NOW()), (30, 3, 60, 5, NOW()), (41, 3, 28, 3, NOW()),
(42, 3, 35, 4, NOW()), (43, 3, 50, 6, NOW()), (44, 3, 40, 5, NOW()),
(31, 4, 250, 30, NOW()), (32, 4, 180, 20, NOW()), (33, 4, 90, 10, NOW()),
(34, 4, 60, 5, NOW()), (35, 4, 25, 3, NOW()), (36, 4, 12, 1, NOW()),
(37, 4, 100, 12, NOW()), (38, 4, 35, 4, NOW()), (39, 4, 130, 15, NOW()),
(40, 4, 45, 5, NOW()), (45, 4, 55, 6, NOW()), (48, 4, 65, 8, NOW()),
(46, 5, 30, 3, NOW()), (47, 5, 8, 1, NOW()), (49, 5, 40, 5, NOW()),
(50, 5, 55, 6, NOW()), (1, 5, 20, 2, NOW()), (5, 5, 90, 10, NOW()),
(8, 5, 100, 12, NOW()), (11, 5, 120, 15, NOW()), (25, 5, 70, 8, NOW()),
(31, 5, 200, 20, NOW()), (32, 5, 150, 15, NOW()), (44, 5, 35, 4, NOW());

-- ============================================================================
-- PURCHASE ORDERS (10 received, 5 in various states)
-- ============================================================================
INSERT INTO purchase_orders (po_id, po_number, supplier_id, warehouse_id, order_date, expected_date, status, total_amount, grand_total, created_by, approved_by, notes) VALUES
(1, 'PO-20260101-0001', 1, 1, '2026-01-05', '2026-01-15', 'received', 45600.0000, 45600.0000, 2, 1, 'Q1 electronics restock'),
(2, 'PO-20260115-0002', 2, 2, '2026-01-15', '2026-01-30', 'received', 12500.0000, 12500.0000, 2, 1, 'Spring fashion collection'),
(3, 'PO-20260201-0003', 3, 2, '2026-02-01', '2026-02-12', 'received', 18750.0000, 18750.0000, 2, 1, 'Kitchen appliances batch'),
(4, 'PO-20260215-0004', 4, 3, '2026-02-15', '2026-03-01', 'received', 8900.0000, 8900.0000, 5, 1, 'Sports equipment order'),
(5, 'PO-20260301-0005', 5, 4, '2026-03-01', '2026-03-10', 'received', 5200.0000, 5200.0000, 2, 1, 'Office supplies quarterly'),
(6, 'PO-20260315-0006', 6, 1, '2026-03-15', '2026-03-30', 'received', 62000.0000, 62000.0000, 2, 1, 'Premium electronics batch'),
(7, 'PO-20260401-0007', 7, 4, '2026-04-01', '2026-04-10', 'received', 4800.0000, 4800.0000, 5, 1, 'Books inventory refresh'),
(8, 'PO-20260415-0008', 8, 2, '2026-04-15', '2026-05-01', 'received', 9600.0000, 9600.0000, 2, 1, 'Eco fashion summer line'),
(9, 'PO-20260501-0009', 9, 5, '2026-05-01', '2026-05-12', 'received', 7350.0000, 7350.0000, 5, 1, 'Kitchen pro supplies'),
(10, 'PO-20260515-0010', 10, 1, '2026-05-15', '2026-05-28', 'received', 15400.0000, 15400.0000, 2, 1, 'Digital accessories bulk'),
(11, 'PO-20260601-0011', 1, 3, '2026-06-01', '2026-06-12', 'approved', 38500.0000, 38500.0000, 2, 1, 'Q3 electronics pre-order'),
(12, 'PO-20260605-0012', 3, 1, '2026-06-05', '2026-06-18', 'submitted', 22400.0000, 22400.0000, 5, NULL, 'Home appliance restock'),
(13, 'PO-20260608-0013', 4, 3, '2026-06-08', '2026-06-22', 'draft', 11200.0000, 11200.0000, 2, NULL, 'Summer sports equipment'),
(14, 'PO-20260610-0014', 2, 2, '2026-06-10', '2026-06-25', 'submitted', 16800.0000, 16800.0000, 5, NULL, 'Monsoon fashion collection'),
(15, 'PO-20260612-0015', 5, 4, '2026-06-12', '2026-06-20', 'draft', 3900.0000, 3900.0000, 2, NULL, 'Office supplies urgent');

-- ============================================================================
-- PURCHASE ORDER ITEMS (sample items for first 5 POs)
-- ============================================================================
INSERT INTO purchase_order_items (po_id, product_id, quantity_ordered, quantity_received, unit_cost, line_total) VALUES
(1, 1, 20, 20, 620.0000, 12400.0000),
(1, 2, 15, 15, 480.0000, 7200.0000),
(1, 3, 30, 30, 290.0000, 8700.0000),
(1, 41, 20, 20, 210.0000, 4200.0000),
(1, 42, 25, 25, 110.0000, 2750.0000),
(1, 50, 30, 30, 58.0000, 1740.0000),
(2, 11, 100, 100, 8.5000, 850.0000),
(2, 12, 60, 60, 14.0000, 840.0000),
(2, 13, 50, 50, 22.0000, 1100.0000),
(2, 14, 30, 30, 38.0000, 1140.0000),
(3, 19, 30, 30, 42.0000, 1260.0000),
(3, 20, 25, 25, 32.0000, 800.0000),
(3, 21, 35, 35, 20.0000, 700.0000),
(3, 22, 40, 40, 18.0000, 720.0000),
(4, 25, 80, 80, 10.0000, 800.0000),
(4, 26, 20, 20, 78.0000, 1560.0000),
(4, 27, 60, 60, 8.0000, 480.0000),
(5, 31, 200, 200, 1.5000, 300.0000),
(5, 32, 150, 150, 2.0000, 300.0000),
(5, 33, 80, 80, 5.0000, 400.0000),
(11, 1, 30, 0, 620.0000, 18600.0000);

-- ============================================================================
-- SALES ORDERS (mix of statuses)
-- ============================================================================
INSERT INTO sales_orders (so_id, so_number, customer_id, warehouse_id, order_date, shipped_date, status, subtotal, discount_amount, tax_amount, grand_total, created_by, notes) VALUES
(1, 'SO-20260110-0001', 1, 1, '2026-01-10', '2026-01-12', 'delivered', 1149.9700, 0.0000, 207.0000, 1356.9700, 2, NULL),
(2, 'SO-20260115-0002', 3, 1, '2026-01-15', '2026-01-17', 'delivered', 8999.9000, 450.0000, 1539.0000, 10088.9000, 2, 'Bulk order - wholesale'),
(3, 'SO-20260120-0003', 5, 1, '2026-01-20', '2026-01-22', 'delivered', 12499.8000, 625.0000, 2137.5000, 14012.3000, 5, 'TechZone quarterly stock'),
(4, 'SO-20260201-0004', 2, 2, '2026-02-01', '2026-02-03', 'delivered', 329.9400, 0.0000, 59.4000, 389.3400, 2, NULL),
(5, 'SO-20260210-0005', 7, 1, '2026-02-10', '2026-02-12', 'delivered', 15999.7500, 800.0000, 2736.0000, 17935.7500, 5, 'MegaMart bulk purchase'),
(6, 'SO-20260601-0006', 4, 1, '2026-06-01', NULL, 'confirmed', 574.9500, 0.0000, 103.5000, 678.4500, 2, NULL),
(7, 'SO-20260605-0007', 9, 1, '2026-06-05', NULL, 'processing', 7499.8500, 375.0000, 1282.5000, 8407.3500, 2, 'ValueBuy wholesale order'),
(8, 'SO-20260608-0008', 6, 2, '2026-06-08', NULL, 'draft', 449.9400, 0.0000, 81.0000, 530.9400, 5, NULL),
(9, 'SO-20260610-0009', 11, 1, '2026-06-10', NULL, 'draft', 9999.8000, 500.0000, 1710.0000, 11209.8000, 2, 'QuickShip electronics'),
(10, 'SO-20260612-0010', 17, 1, '2026-06-12', NULL, 'draft', 18499.7500, 925.0000, 3163.5000, 20738.2500, 5, 'BulkBuy major order');

-- ============================================================================
-- SALES ORDER ITEMS
-- ============================================================================
INSERT INTO sales_order_items (so_id, product_id, quantity, unit_price, discount_pct, line_total) VALUES
(1, 1, 1, 899.9900, 0.00, 899.9900),
(1, 5, 5, 49.9900, 0.00, 249.9500),
(2, 1, 5, 899.9900, 0.00, 4499.9500),
(2, 5, 20, 49.9900, 0.00, 999.8000),
(2, 4, 10, 129.9900, 0.00, 1299.9000),
(3, 1, 8, 899.9900, 0.00, 7199.9200),
(3, 2, 5, 699.9900, 0.00, 3499.9500),
(4, 15, 2, 69.9900, 0.00, 139.9800),
(4, 16, 3, 44.9900, 0.00, 134.9700),
(5, 1, 10, 899.9900, 0.00, 8999.9000),
(5, 3, 8, 449.9900, 0.00, 3599.9200),
(6, 4, 2, 129.9900, 0.00, 259.9800),
(6, 5, 3, 49.9900, 0.00, 149.9700),
(7, 1, 5, 899.9900, 0.00, 4499.9500),
(7, 41, 4, 349.9900, 0.00, 1399.9600),
(8, 19, 2, 79.9900, 0.00, 159.9800),
(8, 25, 3, 29.9900, 0.00, 89.9700),
(9, 1, 6, 899.9900, 0.00, 5399.9400),
(9, 3, 5, 449.9900, 0.00, 2249.9500),
(10, 1, 12, 899.9900, 0.00, 10799.8800),
(10, 3, 6, 449.9900, 0.00, 2699.9400);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
INSERT INTO payments (payment_number, reference_type, reference_id, amount, payment_date, payment_method, status, transaction_ref, created_by) VALUES
('PAY-20260115-0001', 'sales_order', 1, 1356.9700, '2026-01-15', 'credit_card', 'completed', 'TXN-CC-00001', 2),
('PAY-20260118-0002', 'sales_order', 2, 10088.9000, '2026-01-18', 'bank_transfer', 'completed', 'TXN-BT-00001', 2),
('PAY-20260123-0003', 'sales_order', 3, 14012.3000, '2026-01-23', 'bank_transfer', 'completed', 'TXN-BT-00002', 5),
('PAY-20260204-0004', 'sales_order', 4, 389.3400, '2026-02-04', 'cash', 'completed', 'TXN-CS-00001', 2),
('PAY-20260213-0005', 'sales_order', 5, 17935.7500, '2026-02-13', 'bank_transfer', 'completed', 'TXN-BT-00003', 5),
('PAY-20260116-0006', 'purchase_order', 1, 45600.0000, '2026-01-16', 'bank_transfer', 'completed', 'TXN-BT-PO001', 2),
('PAY-20260131-0007', 'purchase_order', 2, 12500.0000, '2026-01-31', 'bank_transfer', 'completed', 'TXN-BT-PO002', 2);

-- ============================================================================
-- INVENTORY MOVEMENTS
-- ============================================================================
INSERT INTO inventory_movements (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, reason, performed_by, created_at) VALUES
(1, 1, 'purchase_in', 20, 'purchase_order', 1, 'Stock from PO-20260101-0001', 3, '2026-01-14 10:00:00'),
(2, 1, 'purchase_in', 15, 'purchase_order', 1, 'Stock from PO-20260101-0001', 3, '2026-01-14 10:15:00'),
(3, 1, 'purchase_in', 30, 'purchase_order', 1, 'Stock from PO-20260101-0001', 3, '2026-01-14 10:30:00'),
(1, 1, 'sale_out', -1, 'sales_order', 1, 'Sold to Arjun Verma', 2, '2026-01-12 14:00:00'),
(5, 1, 'sale_out', -5, 'sales_order', 1, 'Sold to Arjun Verma', 2, '2026-01-12 14:05:00'),
(1, 1, 'adjustment', -5, NULL, NULL, 'Damaged units write-off', 1, '2026-03-15 16:00:00');

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (user_id, title, message, notification_type, is_read, reference_type, reference_id) VALUES
(3, 'Low Stock Alert', 'Product "SportMax Treadmill" has dropped to 8 units (reorder level: 5)', 'warning', FALSE, 'product', 47),
(3, 'Purchase Order Approved', 'PO-20260601-0011 has been approved by Admin', 'info', FALSE, 'purchase_order', 11),
(4, 'New Reorder Request', 'Reorder request created for "OfficeHub Ergonomic Chair"', 'info', TRUE, 'product', 36),
(2, 'Large Order Received', 'New wholesale order worth 25,222 from MegaMart Trading', 'info', FALSE, 'sales_order', 10),
(1, 'Monthly Report Ready', 'May 2026 sales report is now available for review', 'info', TRUE, NULL, NULL),
(3, 'Shipment Received', 'PO-20260515-0010 fully received at Central Warehouse Delhi', 'info', TRUE, 'purchase_order', 10),
(2, 'Payment Overdue', 'Payment for SO-20260601-0006 is pending', 'warning', FALSE, 'sales_order', 6);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, ip_address) VALUES
('users', 2, 'INSERT', NULL, '{"email":"manager@smartretail.com","first_name":"Priya"}', 1, '192.168.1.1'),
('users', 3, 'INSERT', NULL, '{"email":"warehouse1@smartretail.com","first_name":"Amit"}', 1, '192.168.1.1'),
('products', 1, 'INSERT', NULL, '{"sku":"TV-LP-001","name":"TechVista Pro Laptop","unit_price":899.99}', 2, '192.168.1.10'),
('products', 1, 'UPDATE', '{"unit_price":849.99}', '{"unit_price":899.99}', 2, '192.168.1.10'),
('purchase_orders', 1, 'INSERT', NULL, '{"po_number":"PO-20260101-0001","supplier_id":1,"total_amount":45600}', 1, '192.168.1.1');

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;

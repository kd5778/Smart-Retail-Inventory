-- ============================================================================
-- Enterprise Inventory Management System — Indexes
-- Engine  : MySQL 8+
-- Author  : DBA Team
-- Created : 2026-06-13
-- Notes   : PKs and UNIQUE constraints already create implicit indexes
--           so those are NOT duplicated here.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- SINGLE-COLUMN INDEXES
-- ────────────────────────────────────────────────────────────────────────────

-- products.sku — Exact look-ups during barcode scans and API queries.
-- (Already covered by UNIQUE KEY uq_products_sku, listed here for documentation.)
-- CREATE INDEX idx_products_sku ON products (sku);

-- users.email — Login authentication queries always search by email.
-- (Already covered by UNIQUE KEY uq_users_email.)

-- purchase_orders.po_number — Searching POs by their human-readable number.
-- (Already covered by UNIQUE KEY uq_po_number.)

-- sales_orders.so_number — Searching SOs by their human-readable number.
-- (Already covered by UNIQUE KEY uq_so_number.)

-- Supplier name look-ups — Managers search suppliers by name in the UI.
CREATE INDEX idx_suppliers_name
    ON suppliers (`supplier_name`);

-- Customer name look-ups — Used in customer search and autocomplete.
CREATE INDEX idx_customers_name
    ON customers (`customer_name`);

-- Customer type filtering — Segregating retail vs. wholesale dashboards.
CREATE INDEX idx_customers_type
    ON customers (`customer_type`);

-- Purchase order status — Workflow screens filter POs by status.
CREATE INDEX idx_po_status
    ON purchase_orders (`status`);

-- Sales order status — Fulfilment screens filter SOs by status.
CREATE INDEX idx_so_status
    ON sales_orders (`status`);

-- Payment status — Finance team filters pending/completed payments.
CREATE INDEX idx_payments_status
    ON payments (`status`);

-- Payment reference type — Queries that join payments to POs or SOs.
CREATE INDEX idx_payments_ref_type
    ON payments (`reference_type`, `reference_id`);

-- Products barcode — Point-of-sale barcode scan look-ups.
CREATE INDEX idx_products_barcode
    ON products (`barcode`);

-- Inventory movements — Filter by movement type for reporting.
CREATE INDEX idx_inv_movements_type
    ON inventory_movements (`movement_type`);

-- Stock reorder request status — Dashboard showing open reorder requests.
CREATE INDEX idx_reorder_status
    ON stock_reorder_requests (`status`);

-- ────────────────────────────────────────────────────────────────────────────
-- COMPOSITE INDEXES
-- ────────────────────────────────────────────────────────────────────────────

-- inventory(product_id, warehouse_id)
-- Already covered by UNIQUE KEY uq_inventory_product_warehouse.
-- Used every time the system checks stock for a product in a specific warehouse.

-- sales_orders(customer_id, order_date)
-- Customer order history: "Show me all orders from customer X sorted by date."
-- Also benefits the monthly revenue view aggregating by customer + period.
CREATE INDEX idx_so_customer_order_date
    ON sales_orders (`customer_id`, `order_date`);

-- audit_logs(table_name, record_id)
-- When viewing the audit trail for a specific record, e.g. product #42,
-- we query WHERE table_name = 'products' AND record_id = 42.
CREATE INDEX idx_audit_table_record
    ON audit_logs (`table_name`, `record_id`);

-- notifications(user_id, is_read, created_at)
-- The notification bell icon queries:
--   WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC
-- This composite index covers that query perfectly.
CREATE INDEX idx_notifications_user_read_date
    ON notifications (`user_id`, `is_read`, `created_at`);

-- purchase_order_items(po_id, product_id)
-- Fetching all line items for a given PO, or checking if a product is on a PO.
CREATE INDEX idx_poi_po_product
    ON purchase_order_items (`po_id`, `product_id`);

-- sales_order_items(so_id, product_id)
-- Fetching all line items for a given SO, or checking if a product is on a SO.
CREATE INDEX idx_soi_so_product
    ON sales_order_items (`so_id`, `product_id`);

-- inventory_movements(product_id, warehouse_id, created_at)
-- Stock movement history for a specific product in a specific warehouse,
-- ordered by date. Used in the stock-ledger report.
CREATE INDEX idx_inv_movements_product_wh_date
    ON inventory_movements (`product_id`, `warehouse_id`, `created_at`);

-- inventory_movements(reference_type, reference_id)
-- Looking up all movements related to a specific PO or SO.
CREATE INDEX idx_inv_movements_ref
    ON inventory_movements (`reference_type`, `reference_id`);

-- purchase_orders(supplier_id, order_date)
-- Supplier performance analysis: aggregate POs per supplier over time.
CREATE INDEX idx_po_supplier_date
    ON purchase_orders (`supplier_id`, `order_date`);

-- purchase_orders(warehouse_id, status)
-- Warehouse managers filtering POs destined for their warehouse.
CREATE INDEX idx_po_warehouse_status
    ON purchase_orders (`warehouse_id`, `status`);

-- sales_orders(warehouse_id, status)
-- Warehouse managers filtering SOs that need fulfilment.
CREATE INDEX idx_so_warehouse_status
    ON sales_orders (`warehouse_id`, `status`);

-- sales_orders(order_date, status)
-- Date-range reports filtered by order status.
CREATE INDEX idx_so_date_status
    ON sales_orders (`order_date`, `status`);

-- audit_logs(action, created_at)
-- Security team reviewing all DELETE actions in a given time range.
CREATE INDEX idx_audit_action_date
    ON audit_logs (`action`, `created_at`);

-- ────────────────────────────────────────────────────────────────────────────
-- COVERING INDEX
-- ────────────────────────────────────────────────────────────────────────────

-- products(category_id, is_active, name, unit_price)
-- This is a COVERING INDEX designed for the product catalogue page:
--   SELECT name, unit_price
--   FROM   products
--   WHERE  category_id = ? AND is_active = TRUE
--   ORDER BY name;
-- The query is satisfied entirely from the index (index-only scan)
-- without needing to read the clustered index (table data pages).
CREATE INDEX idx_products_covering_catalogue
    ON products (`category_id`, `is_active`, `name`, `unit_price`);

-- products(brand_id, is_active, name)
-- Covering index for brand-based catalogue browsing.
CREATE INDEX idx_products_brand_active_name
    ON products (`brand_id`, `is_active`, `name`);

-- inventory(warehouse_id, quantity_on_hand)
-- Covering index for the low-stock dashboard query:
--   SELECT product_id, quantity_on_hand
--   FROM   inventory
--   WHERE  warehouse_id = ? AND quantity_on_hand < threshold
-- warehouse_id is the range predicate; product_id is in the PK/unique key
-- and quantity_on_hand is included so the query never touches data pages.
CREATE INDEX idx_inventory_wh_qty
    ON inventory (`warehouse_id`, `quantity_on_hand`);

-- payments(reference_type, reference_id, status, amount)
-- Covering index for payment reconciliation:
--   SELECT status, amount FROM payments
--   WHERE reference_type = 'sales_order' AND reference_id = ?
CREATE INDEX idx_payments_covering_recon
    ON payments (`reference_type`, `reference_id`, `status`, `amount`);

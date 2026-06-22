-- ============================================================================
-- VIEWS — Enterprise Inventory Management System
-- 5 Business Reporting Views (matches schema.sql column names)
-- ============================================================================

-- ============================================================================
-- VIEW 1: Inventory Valuation
-- ============================================================================
DROP VIEW IF EXISTS vw_inventory_valuation;

CREATE VIEW vw_inventory_valuation AS
SELECT
    w.warehouse_id,
    w.warehouse_name,
    w.city AS warehouse_location,
    p.product_id,
    p.sku,
    p.name AS product_name,
    c.category_name,
    b.brand_name,
    i.quantity_on_hand,
    i.quantity_reserved,
    i.quantity_available,
    p.cost_price,
    p.unit_price,
    (i.quantity_on_hand * p.cost_price) AS stock_cost_value,
    (i.quantity_on_hand * p.unit_price) AS stock_retail_value,
    ((i.quantity_on_hand * p.unit_price) - (i.quantity_on_hand * p.cost_price)) AS potential_profit,
    i.last_counted_at,
    i.updated_at AS last_updated
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
WHERE p.is_active = TRUE
ORDER BY w.warehouse_name, p.name;

-- ============================================================================
-- VIEW 2: Supplier Performance
-- ============================================================================
DROP VIEW IF EXISTS vw_supplier_performance;

CREATE VIEW vw_supplier_performance AS
SELECT
    s.supplier_id,
    s.supplier_name,
    s.contact_person,
    s.email,
    s.payment_terms,
    COUNT(DISTINCT po.po_id) AS total_orders,
    SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) AS completed_orders,
    SUM(CASE WHEN po.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
    COALESCE(SUM(CASE WHEN po.status = 'received' THEN po.grand_total ELSE 0 END), 0) AS total_spend,
    COALESCE(AVG(CASE WHEN po.status = 'received' THEN po.grand_total END), 0) AS avg_order_value,
    ROUND(
        COALESCE(
            SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) * 100.0 /
            NULLIF(COUNT(DISTINCT po.po_id), 0),
        0), 2
    ) AS completion_rate_pct,
    ROUND(
        (
            COALESCE(
                SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) * 100.0 /
                NULLIF(COUNT(DISTINCT po.po_id), 0),
            0) * 0.5
        ) + (
            CASE
                WHEN COUNT(DISTINCT po.po_id) >= 10 THEN 30
                WHEN COUNT(DISTINCT po.po_id) >= 5 THEN 20
                WHEN COUNT(DISTINCT po.po_id) >= 1 THEN 10
                ELSE 0
            END
        ) + (
            CASE
                WHEN SUM(CASE WHEN po.status = 'cancelled' THEN 1 ELSE 0 END) = 0 THEN 20
                WHEN SUM(CASE WHEN po.status = 'cancelled' THEN 1 ELSE 0 END) <= 2 THEN 10
                ELSE 0
            END
        ),
    1) AS performance_score,
    MIN(po.order_date) AS first_order_date,
    MAX(po.order_date) AS last_order_date,
    s.is_active
FROM suppliers s
LEFT JOIN purchase_orders po ON s.supplier_id = po.supplier_id
GROUP BY s.supplier_id, s.supplier_name, s.contact_person, s.email, s.payment_terms, s.is_active
ORDER BY performance_score DESC;

-- ============================================================================
-- VIEW 3: Monthly Revenue
-- ============================================================================
DROP VIEW IF EXISTS vw_monthly_revenue;

CREATE VIEW vw_monthly_revenue AS
SELECT
    YEAR(so.order_date) AS revenue_year,
    MONTH(so.order_date) AS revenue_month,
    DATE_FORMAT(so.order_date, '%Y-%m') AS `year_month`,
    DATE_FORMAT(so.order_date, '%M %Y') AS month_name,
    COUNT(DISTINCT so.so_id) AS total_orders,
    COUNT(DISTINCT so.customer_id) AS unique_customers,
    COALESCE(SUM(so.subtotal), 0) AS gross_revenue,
    COALESCE(SUM(so.discount_amount), 0) AS total_discounts,
    COALESCE(SUM(so.tax_amount), 0) AS total_tax,
    COALESCE(SUM(so.grand_total), 0) AS net_revenue,
    COALESCE(AVG(so.grand_total), 0) AS avg_order_value,
    SUM(CASE WHEN so.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
    SUM(CASE WHEN so.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
FROM sales_orders so
WHERE so.status != 'cancelled'
GROUP BY YEAR(so.order_date), MONTH(so.order_date),
         DATE_FORMAT(so.order_date, '%Y-%m'),
         DATE_FORMAT(so.order_date, '%M %Y')
ORDER BY revenue_year DESC, revenue_month DESC;

-- ============================================================================
-- VIEW 4: Product Profitability
-- ============================================================================
DROP VIEW IF EXISTS vw_product_profitability;

CREATE VIEW vw_product_profitability AS
SELECT
    p.product_id,
    p.sku,
    p.name AS product_name,
    c.category_name,
    b.brand_name,
    p.cost_price,
    p.unit_price,
    COALESCE(sales.total_quantity_sold, 0) AS total_quantity_sold,
    COALESCE(sales.total_revenue, 0) AS total_revenue,
    COALESCE(sales.total_cost, 0) AS total_cost_of_goods,
    COALESCE(sales.total_revenue - sales.total_cost, 0) AS gross_profit,
    ROUND(
        CASE
            WHEN COALESCE(sales.total_revenue, 0) > 0
            THEN ((sales.total_revenue - sales.total_cost) / sales.total_revenue) * 100
            ELSE 0
        END,
    2) AS margin_percentage,
    COALESCE(sales.order_count, 0) AS order_count,
    COALESCE(stock.current_stock, 0) AS current_stock,
    COALESCE(stock.current_stock * p.cost_price, 0) AS current_stock_value,
    p.is_active
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN (
    SELECT
        soi.product_id,
        SUM(soi.quantity) AS total_quantity_sold,
        SUM(soi.line_total) AS total_revenue,
        SUM(soi.quantity * pr.cost_price) AS total_cost,
        COUNT(DISTINCT soi.so_id) AS order_count
    FROM sales_order_items soi
    INNER JOIN sales_orders so ON soi.so_id = so.so_id
    INNER JOIN products pr ON soi.product_id = pr.product_id
    WHERE so.status NOT IN ('cancelled')
    GROUP BY soi.product_id
) sales ON p.product_id = sales.product_id
LEFT JOIN (
    SELECT product_id, SUM(quantity_on_hand) AS current_stock
    FROM inventory
    GROUP BY product_id
) stock ON p.product_id = stock.product_id
ORDER BY gross_profit DESC;

-- ============================================================================
-- VIEW 5: Low Stock Dashboard
-- ============================================================================
DROP VIEW IF EXISTS vw_low_stock_dashboard;

CREATE VIEW vw_low_stock_dashboard AS
SELECT
    p.product_id,
    p.sku,
    p.name AS product_name,
    c.category_name,
    b.brand_name,
    w.warehouse_id,
    w.warehouse_name,
    i.quantity_on_hand,
    i.quantity_reserved,
    i.quantity_available,
    p.reorder_level,
    p.reorder_qty,
    (p.reorder_level - i.quantity_on_hand) AS stock_deficit,
    CASE
        WHEN i.quantity_on_hand = 0 THEN 'CRITICAL'
        WHEN i.quantity_on_hand <= FLOOR(p.reorder_level * 0.5) THEN 'HIGH'
        WHEN i.quantity_on_hand <= p.reorder_level THEN 'MEDIUM'
        ELSE 'LOW'
    END AS urgency_level,
    (p.reorder_qty * p.cost_price) AS estimated_restock_cost,
    DATEDIFF(NOW(), i.last_counted_at) AS days_since_stock_check,
    i.updated_at AS last_stock_update
FROM inventory i
INNER JOIN products p ON i.product_id = p.product_id
INNER JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
WHERE i.quantity_on_hand <= p.reorder_level
  AND p.is_active = TRUE
  AND w.is_active = TRUE
ORDER BY
    CASE
        WHEN i.quantity_on_hand = 0 THEN 1
        WHEN i.quantity_on_hand <= FLOOR(p.reorder_level * 0.5) THEN 2
        ELSE 3
    END,
    stock_deficit DESC;

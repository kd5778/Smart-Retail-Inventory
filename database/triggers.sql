-- ============================================================================
-- TRIGGERS — Enterprise Inventory Management System
-- Matches schema.sql column names exactly
-- ============================================================================

DROP TRIGGER IF EXISTS trg_purchase_item_received;
DROP TRIGGER IF EXISTS trg_sales_order_shipped;
DROP TRIGGER IF EXISTS trg_low_stock_alert;
DROP TRIGGER IF EXISTS trg_audit_products_insert;
DROP TRIGGER IF EXISTS trg_audit_products_update;
DROP TRIGGER IF EXISTS trg_audit_products_delete;
DROP TRIGGER IF EXISTS trg_payment_completed;

DELIMITER //

-- ============================================================================
-- TRIGGER 1: Auto Stock Increase on Purchase Receipt
-- ============================================================================
CREATE TRIGGER trg_purchase_item_received
AFTER UPDATE ON purchase_order_items
FOR EACH ROW
BEGIN
    DECLARE v_warehouse_id BIGINT UNSIGNED;
    DECLARE v_delta INT;

    IF NEW.quantity_received > OLD.quantity_received THEN
        SET v_delta = NEW.quantity_received - OLD.quantity_received;

        SELECT warehouse_id INTO v_warehouse_id
        FROM purchase_orders
        WHERE po_id = NEW.po_id;

        INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, last_counted_at)
        VALUES (NEW.product_id, v_warehouse_id, v_delta, 0, NOW())
        ON DUPLICATE KEY UPDATE
            quantity_on_hand = quantity_on_hand + v_delta,
            updated_at = NOW();

        INSERT INTO inventory_movements (
            product_id, warehouse_id, movement_type, quantity,
            reference_type, reference_id, reason, performed_by
        ) VALUES (
            NEW.product_id, v_warehouse_id, 'purchase_in', v_delta,
            'purchase_order', NEW.po_id,
            CONCAT('Received ', v_delta, ' units from PO item #', NEW.po_item_id),
            NULL
        );
    END IF;
END //

-- ============================================================================
-- TRIGGER 2: Auto Stock Decrease on Sales Order Shipped
-- ============================================================================
CREATE TRIGGER trg_sales_order_shipped
AFTER UPDATE ON sales_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
        UPDATE inventory i
        INNER JOIN sales_order_items soi ON i.product_id = soi.product_id
        SET i.quantity_on_hand = i.quantity_on_hand - CAST(soi.quantity AS SIGNED),
            i.quantity_reserved = GREATEST(0, i.quantity_reserved - CAST(soi.quantity AS SIGNED)),
            i.updated_at = NOW()
        WHERE soi.so_id = NEW.so_id
          AND i.warehouse_id = NEW.warehouse_id;

        INSERT INTO inventory_movements (
            product_id, warehouse_id, movement_type, quantity,
            reference_type, reference_id, reason, performed_by
        )
        SELECT
            soi.product_id,
            NEW.warehouse_id,
            'sale_out',
            soi.quantity,
            'sales_order',
            NEW.so_id,
            CONCAT('Shipped ', soi.quantity, ' units for SO #', NEW.so_number),
            NEW.created_by
        FROM sales_order_items soi
        WHERE soi.so_id = NEW.so_id;
    END IF;
END //

-- ============================================================================
-- TRIGGER 2B: Auto Stock Reservation Release on Sales Order Cancelled
-- ============================================================================
CREATE TRIGGER trg_sales_order_cancelled
AFTER UPDATE ON sales_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status IN ('draft', 'confirmed', 'processing') THEN
        UPDATE inventory i
        INNER JOIN sales_order_items soi ON i.product_id = soi.product_id
        SET i.quantity_reserved = GREATEST(0, i.quantity_reserved - CAST(soi.quantity AS SIGNED)),
            i.updated_at = NOW()
        WHERE soi.so_id = NEW.so_id
          AND i.warehouse_id = NEW.warehouse_id;
    END IF;
END //

-- ============================================================================
-- TRIGGER 3: Low Stock Alert
-- ============================================================================
CREATE TRIGGER trg_low_stock_alert
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    DECLARE v_reorder_level INT;
    DECLARE v_reorder_qty INT;
    DECLARE v_product_name VARCHAR(200);
    DECLARE v_warehouse_name VARCHAR(200);
    DECLARE v_manager_id BIGINT UNSIGNED;

    IF NEW.quantity_on_hand < OLD.quantity_on_hand THEN
        SELECT p.reorder_level, p.reorder_qty, p.name
        INTO v_reorder_level, v_reorder_qty, v_product_name
        FROM products p
        WHERE p.product_id = NEW.product_id;

        IF NEW.quantity_on_hand <= v_reorder_level AND OLD.quantity_on_hand > v_reorder_level THEN
            SELECT w.warehouse_name, w.manager_id
            INTO v_warehouse_name, v_manager_id
            FROM warehouses w
            WHERE w.warehouse_id = NEW.warehouse_id;

            INSERT INTO stock_reorder_requests (
                product_id, warehouse_id, current_qty, reorder_level,
                suggested_qty, status, requested_by
            ) VALUES (
                NEW.product_id, NEW.warehouse_id, NEW.quantity_on_hand,
                v_reorder_level, v_reorder_qty, 'open',
                v_manager_id
            );

            IF v_manager_id IS NOT NULL THEN
                INSERT INTO notifications (
                    user_id, title, message, notification_type, is_read,
                    reference_type, reference_id
                ) VALUES (
                    v_manager_id,
                    'Low Stock Alert',
                    CONCAT('Product "', v_product_name, '" in warehouse "', v_warehouse_name,
                           '" has dropped to ', NEW.quantity_on_hand, ' units (reorder level: ',
                           v_reorder_level, ')'),
                    'warning',
                    FALSE,
                    'product',
                    NEW.product_id
                );
            END IF;
        END IF;
    END IF;
END //

-- ============================================================================
-- TRIGGER 4A: Audit Log - Products INSERT
-- ============================================================================
CREATE TRIGGER trg_audit_products_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        action, table_name, record_id,
        old_values, new_values, changed_by
    ) VALUES (
        'INSERT',
        'products',
        NEW.product_id,
        NULL,
        JSON_OBJECT(
            'sku', NEW.sku,
            'name', NEW.name,
            'category_id', NEW.category_id,
            'brand_id', NEW.brand_id,
            'unit_price', NEW.unit_price,
            'cost_price', NEW.cost_price,
            'reorder_level', NEW.reorder_level,
            'is_active', NEW.is_active
        ),
        NULL
    );
END //

-- ============================================================================
-- TRIGGER 4B: Audit Log - Products UPDATE
-- ============================================================================
CREATE TRIGGER trg_audit_products_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        action, table_name, record_id,
        old_values, new_values, changed_by
    ) VALUES (
        'UPDATE',
        'products',
        NEW.product_id,
        JSON_OBJECT(
            'sku', OLD.sku,
            'name', OLD.name,
            'unit_price', OLD.unit_price,
            'cost_price', OLD.cost_price,
            'is_active', OLD.is_active
        ),
        JSON_OBJECT(
            'sku', NEW.sku,
            'name', NEW.name,
            'unit_price', NEW.unit_price,
            'cost_price', NEW.cost_price,
            'is_active', NEW.is_active
        ),
        NULL
    );
END //

-- ============================================================================
-- TRIGGER 4C: Audit Log - Products DELETE
-- ============================================================================
CREATE TRIGGER trg_audit_products_delete
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        action, table_name, record_id,
        old_values, new_values, changed_by
    ) VALUES (
        'DELETE',
        'products',
        OLD.product_id,
        JSON_OBJECT(
            'sku', OLD.sku,
            'name', OLD.name,
            'unit_price', OLD.unit_price,
            'cost_price', OLD.cost_price
        ),
        NULL,
        NULL
    );
END //

-- ============================================================================
-- TRIGGER 5: Payment Status Update
-- ============================================================================
CREATE TRIGGER trg_payment_completed
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(13,4);
    DECLARE v_order_total DECIMAL(13,4);

    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        IF NEW.reference_type = 'sales_order' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
            FROM payments
            WHERE reference_type = 'sales_order'
              AND reference_id = NEW.reference_id
              AND status = 'completed';

            SELECT grand_total INTO v_order_total
            FROM sales_orders
            WHERE so_id = NEW.reference_id;

            IF v_total_paid >= v_order_total THEN
                UPDATE sales_orders
                SET status = 'delivered', updated_at = NOW()
                WHERE so_id = NEW.reference_id
                  AND status IN ('shipped', 'processing', 'confirmed');
            END IF;

        ELSEIF NEW.reference_type = 'purchase_order' THEN
            INSERT INTO notifications (
                user_id, title, message, notification_type, is_read,
                reference_type, reference_id
            )
            SELECT
                created_by,
                'Payment Received',
                CONCAT('Payment of $', FORMAT(NEW.amount, 2), ' received for PO #', po_number),
                'info',
                FALSE,
                'purchase_order',
                NEW.reference_id
            FROM purchase_orders
            WHERE po_id = NEW.reference_id;
        END IF;
    END IF;
END //

DELIMITER ;

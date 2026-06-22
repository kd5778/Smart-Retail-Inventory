-- ============================================================================
-- Enterprise Inventory Management System — Database Schema
-- Engine  : MySQL 8+
-- Author  : DBA Team
-- Created : 2026-06-13
-- Notes   : All tables use InnoDB, BIGINT UNSIGNED AUTO_INCREMENT PKs,
--           DECIMAL(13,4) for money, TIMESTAMP for dates, 3NF normalised.
-- ============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. ROLES
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `role_id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_name`     VARCHAR(100)    NOT NULL,
    `description`   VARCHAR(255)    NULL,
    `is_active`     BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `uq_roles_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. PERMISSIONS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
    `permission_id`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `permission_name` VARCHAR(100)    NOT NULL,
    `module`          VARCHAR(50)     NOT NULL,
    `description`     VARCHAR(255)    NULL,
    `is_active`       BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`permission_id`),
    UNIQUE KEY `uq_permissions_name` (`permission_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. USERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username`      VARCHAR(50)     NOT NULL,
    `email`         VARCHAR(255)    NOT NULL,
    `password_hash` VARCHAR(255)    NOT NULL,
    `first_name`    VARCHAR(100)    NOT NULL,
    `last_name`     VARCHAR(100)    NOT NULL,
    `phone`         VARCHAR(20)     NULL,
    `is_active`     BOOLEAN         NOT NULL DEFAULT TRUE,
    `last_login`    TIMESTAMP       NULL,
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_username` (`username`),
    UNIQUE KEY `uq_users_email`    (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. USER_ROLES  (many-to-many bridge)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `user_role_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED NOT NULL,
    `role_id`      BIGINT UNSIGNED NOT NULL,
    `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_role_id`),
    UNIQUE KEY `uq_user_roles` (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`)
        REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. ROLE_PERMISSIONS  (many-to-many bridge)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
    `role_permission_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id`            BIGINT UNSIGNED NOT NULL,
    `permission_id`      BIGINT UNSIGNED NOT NULL,
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_permission_id`),
    UNIQUE KEY `uq_role_permissions` (`role_id`, `permission_id`),
    CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`)
        REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_role_permissions_perm` FOREIGN KEY (`permission_id`)
        REFERENCES `permissions` (`permission_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. CATEGORIES  (self-referential for hierarchy)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `category_id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_name`      VARCHAR(100)    NOT NULL,
    `parent_category_id` BIGINT UNSIGNED NULL,
    `description`        VARCHAR(255)    NULL,
    `is_active`          BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`category_id`),
    UNIQUE KEY `uq_categories_name` (`category_name`),
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_category_id`)
        REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. BRANDS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
    `brand_id`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `brand_name` VARCHAR(100)    NOT NULL,
    `logo_url`   VARCHAR(500)    NULL,
    `website`    VARCHAR(500)    NULL,
    `is_active`  BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`brand_id`),
    UNIQUE KEY `uq_brands_name` (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. PRODUCTS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `product_id`    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `sku`           VARCHAR(50)      NOT NULL,
    `name`          VARCHAR(200)     NOT NULL,
    `description`   TEXT             NULL,
    `category_id`   BIGINT UNSIGNED  NOT NULL,
    `brand_id`      BIGINT UNSIGNED  NULL,
    `unit_price`    DECIMAL(13,4)    NOT NULL DEFAULT 0.0000,
    `cost_price`    DECIMAL(13,4)    NOT NULL DEFAULT 0.0000,
    `weight_kg`     DECIMAL(10,3)    NULL,
    `dimensions`    VARCHAR(100)     NULL COMMENT 'LxWxH in cm',
    `barcode`       VARCHAR(100)     NULL,
    `reorder_level` INT UNSIGNED     NOT NULL DEFAULT 10,
    `reorder_qty`   INT UNSIGNED     NOT NULL DEFAULT 50,
    `unit_of_measure` VARCHAR(20)    NOT NULL DEFAULT 'EACH',
    `is_active`     BOOLEAN          NOT NULL DEFAULT TRUE,
    `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`),
    UNIQUE KEY `uq_products_sku` (`sku`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`)
        REFERENCES `brands` (`brand_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 9. SUPPLIERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
    `supplier_id`    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `supplier_name`  VARCHAR(200)    NOT NULL,
    `contact_person` VARCHAR(150)    NULL,
    `email`          VARCHAR(255)    NULL,
    `phone`          VARCHAR(20)     NULL,
    `address_line1`  VARCHAR(255)    NULL,
    `address_line2`  VARCHAR(255)    NULL,
    `city`           VARCHAR(100)    NULL,
    `state`          VARCHAR(100)    NULL,
    `postal_code`    VARCHAR(20)     NULL,
    `country`        VARCHAR(100)    NOT NULL DEFAULT 'India',
    `tax_id`         VARCHAR(50)     NULL,
    `payment_terms`  VARCHAR(100)    NULL COMMENT 'e.g. Net 30, Net 60',
    `lead_time_days` INT UNSIGNED    NULL DEFAULT 7,
    `rating`         DECIMAL(3,2)    NULL COMMENT '0.00 – 5.00',
    `is_active`      BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 10. WAREHOUSES
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
    `warehouse_id`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `warehouse_name` VARCHAR(200)    NOT NULL,
    `warehouse_code` VARCHAR(20)     NOT NULL,
    `address_line1`  VARCHAR(255)    NULL,
    `address_line2`  VARCHAR(255)    NULL,
    `city`           VARCHAR(100)    NULL,
    `state`          VARCHAR(100)    NULL,
    `postal_code`    VARCHAR(20)     NULL,
    `country`        VARCHAR(100)    NOT NULL DEFAULT 'India',
    `manager_id`     BIGINT UNSIGNED NULL,
    `capacity`       INT UNSIGNED    NULL COMMENT 'Max pallet positions',
    `is_active`      BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`warehouse_id`),
    UNIQUE KEY `uq_warehouses_code` (`warehouse_code`),
    CONSTRAINT `fk_warehouses_manager` FOREIGN KEY (`manager_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 11. INVENTORY  (UNIQUE on product_id + warehouse_id)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
    `inventory_id`      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id`        BIGINT UNSIGNED NOT NULL,
    `warehouse_id`      BIGINT UNSIGNED NOT NULL,
    `quantity_on_hand`  INT             NOT NULL DEFAULT 0,
    `quantity_reserved` INT             NOT NULL DEFAULT 0,
    `quantity_available` INT GENERATED ALWAYS AS (`quantity_on_hand` - `quantity_reserved`) STORED,
    `last_counted_at`   TIMESTAMP       NULL,
    `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`inventory_id`),
    UNIQUE KEY `uq_inventory_product_warehouse` (`product_id`, `warehouse_id`),
    CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`)
        REFERENCES `warehouses` (`warehouse_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 12. PURCHASE_ORDERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
    `po_id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `po_number`      VARCHAR(30)     NOT NULL,
    `supplier_id`    BIGINT UNSIGNED NOT NULL,
    `warehouse_id`   BIGINT UNSIGNED NOT NULL,
    `order_date`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expected_date`  TIMESTAMP       NULL,
    `status`         ENUM('draft','submitted','approved','partially_received','received','cancelled')
                         NOT NULL DEFAULT 'draft',
    `total_amount`   DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `tax_amount`     DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `shipping_cost`  DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `grand_total`    DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `notes`          TEXT            NULL,
    `created_by`     BIGINT UNSIGNED NOT NULL,
    `approved_by`    BIGINT UNSIGNED NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`po_id`),
    UNIQUE KEY `uq_po_number` (`po_number`),
    CONSTRAINT `fk_po_supplier`   FOREIGN KEY (`supplier_id`)
        REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_po_warehouse`  FOREIGN KEY (`warehouse_id`)
        REFERENCES `warehouses` (`warehouse_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_po_created_by` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_po_approved_by` FOREIGN KEY (`approved_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 13. PURCHASE_ORDER_ITEMS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
    `po_item_id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `po_id`            BIGINT UNSIGNED NOT NULL,
    `product_id`       BIGINT UNSIGNED NOT NULL,
    `quantity_ordered`  INT UNSIGNED   NOT NULL,
    `quantity_received` INT UNSIGNED   NOT NULL DEFAULT 0,
    `unit_cost`        DECIMAL(13,4)   NOT NULL,
    `line_total`       DECIMAL(13,4)   NOT NULL,
    `status`           ENUM('pending','partially_received','received','cancelled')
                           NOT NULL DEFAULT 'pending',
    `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`po_item_id`),
    CONSTRAINT `fk_poi_po`      FOREIGN KEY (`po_id`)
        REFERENCES `purchase_orders` (`po_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_poi_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 14. CUSTOMERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `customer_id`    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_name`  VARCHAR(200)    NOT NULL,
    `customer_type`  ENUM('retail','wholesale') NOT NULL DEFAULT 'retail',
    `email`          VARCHAR(255)    NULL,
    `phone`          VARCHAR(20)     NULL,
    `address_line1`  VARCHAR(255)    NULL,
    `address_line2`  VARCHAR(255)    NULL,
    `city`           VARCHAR(100)    NULL,
    `state`          VARCHAR(100)    NULL,
    `postal_code`    VARCHAR(20)     NULL,
    `country`        VARCHAR(100)    NOT NULL DEFAULT 'India',
    `tax_id`         VARCHAR(50)     NULL,
    `credit_limit`   DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `is_active`      BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 15. SALES_ORDERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `sales_orders`;
CREATE TABLE `sales_orders` (
    `so_id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `so_number`      VARCHAR(30)     NOT NULL,
    `customer_id`    BIGINT UNSIGNED NOT NULL,
    `warehouse_id`   BIGINT UNSIGNED NOT NULL,
    `order_date`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `shipped_date`   TIMESTAMP       NULL,
    `status`         ENUM('draft','confirmed','processing','shipped','delivered','cancelled','returned')
                         NOT NULL DEFAULT 'draft',
    `subtotal`       DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `tax_amount`     DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `discount_amount` DECIMAL(13,4)  NOT NULL DEFAULT 0.0000,
    `shipping_cost`  DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `grand_total`    DECIMAL(13,4)   NOT NULL DEFAULT 0.0000,
    `notes`          TEXT            NULL,
    `created_by`     BIGINT UNSIGNED NOT NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`so_id`),
    UNIQUE KEY `uq_so_number` (`so_number`),
    CONSTRAINT `fk_so_customer`   FOREIGN KEY (`customer_id`)
        REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_so_warehouse`  FOREIGN KEY (`warehouse_id`)
        REFERENCES `warehouses` (`warehouse_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_so_created_by` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 16. SALES_ORDER_ITEMS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `sales_order_items`;
CREATE TABLE `sales_order_items` (
    `so_item_id`      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `so_id`           BIGINT UNSIGNED NOT NULL,
    `product_id`      BIGINT UNSIGNED NOT NULL,
    `quantity`        INT UNSIGNED    NOT NULL,
    `unit_price`      DECIMAL(13,4)   NOT NULL,
    `discount_pct`    DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `line_total`      DECIMAL(13,4)   NOT NULL,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`so_item_id`),
    CONSTRAINT `fk_soi_so`      FOREIGN KEY (`so_id`)
        REFERENCES `sales_orders` (`so_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_soi_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 17. PAYMENTS  (polymorphic: reference_type + reference_id)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `payment_id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payment_number` VARCHAR(30)     NOT NULL,
    `reference_type` ENUM('purchase_order','sales_order') NOT NULL,
    `reference_id`   BIGINT UNSIGNED NOT NULL,
    `payment_date`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `amount`         DECIMAL(13,4)   NOT NULL,
    `payment_method` ENUM('cash','bank_transfer','credit_card','cheque','upi','other')
                         NOT NULL DEFAULT 'bank_transfer',
    `status`         ENUM('pending','processing','completed','failed','refunded')
                         NOT NULL DEFAULT 'pending',
    `transaction_ref` VARCHAR(255)   NULL,
    `notes`          TEXT            NULL,
    `created_by`     BIGINT UNSIGNED NOT NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_id`),
    UNIQUE KEY `uq_payment_number` (`payment_number`),
    CONSTRAINT `fk_payments_created_by` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 18. INVENTORY_MOVEMENTS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `inventory_movements`;
CREATE TABLE `inventory_movements` (
    `movement_id`    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id`     BIGINT UNSIGNED NOT NULL,
    `warehouse_id`   BIGINT UNSIGNED NOT NULL,
    `movement_type`  ENUM('purchase_in','sale_out','adjustment','transfer_in','transfer_out','return_in','return_out','write_off')
                         NOT NULL,
    `quantity`       INT             NOT NULL COMMENT 'Positive = in, Negative = out',
    `reference_type` VARCHAR(50)     NULL COMMENT 'e.g. purchase_order, sales_order',
    `reference_id`   BIGINT UNSIGNED NULL,
    `reason`         VARCHAR(500)    NULL,
    `performed_by`   BIGINT UNSIGNED NOT NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`movement_id`),
    CONSTRAINT `fk_im_product`   FOREIGN KEY (`product_id`)
        REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_im_warehouse` FOREIGN KEY (`warehouse_id`)
        REFERENCES `warehouses` (`warehouse_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_im_performed_by` FOREIGN KEY (`performed_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 19. STOCK_REORDER_REQUESTS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `stock_reorder_requests`;
CREATE TABLE `stock_reorder_requests` (
    `reorder_id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id`     BIGINT UNSIGNED NOT NULL,
    `warehouse_id`   BIGINT UNSIGNED NOT NULL,
    `current_qty`    INT             NOT NULL,
    `reorder_level`  INT UNSIGNED    NOT NULL,
    `suggested_qty`  INT UNSIGNED    NOT NULL,
    `status`         ENUM('open','approved','ordered','cancelled') NOT NULL DEFAULT 'open',
    `po_id`          BIGINT UNSIGNED NULL COMMENT 'Linked PO once ordered',
    `requested_by`   BIGINT UNSIGNED NULL,
    `approved_by`    BIGINT UNSIGNED NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`reorder_id`),
    CONSTRAINT `fk_srr_product`   FOREIGN KEY (`product_id`)
        REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_srr_warehouse` FOREIGN KEY (`warehouse_id`)
        REFERENCES `warehouses` (`warehouse_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_srr_po`        FOREIGN KEY (`po_id`)
        REFERENCES `purchase_orders` (`po_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_srr_requested_by` FOREIGN KEY (`requested_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_srr_approved_by`  FOREIGN KEY (`approved_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 20. AUDIT_LOGS  (JSON columns for old/new values)
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `audit_id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `table_name`   VARCHAR(100)    NOT NULL,
    `record_id`    BIGINT UNSIGNED NOT NULL,
    `action`       ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    `old_values`   JSON            NULL,
    `new_values`   JSON            NULL,
    `changed_by`   BIGINT UNSIGNED NULL,
    `ip_address`   VARCHAR(45)     NULL,
    `user_agent`   VARCHAR(500)    NULL,
    `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────────
-- 21. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT UNSIGNED NOT NULL,
    `title`           VARCHAR(200)    NOT NULL,
    `message`         TEXT            NOT NULL,
    `notification_type` ENUM('info','warning','error','success') NOT NULL DEFAULT 'info',
    `is_read`         BOOLEAN         NOT NULL DEFAULT FALSE,
    `reference_type`  VARCHAR(50)     NULL,
    `reference_id`    BIGINT UNSIGNED NULL,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`notification_id`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

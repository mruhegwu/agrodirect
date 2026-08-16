-- PostgreSQL Production Schema for AgroDirect Marketplace

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'FARMER', 'FARMER_STAFF', 'LOGISTICS_PROVIDER', 'LOGISTICS_STAFF', 'ADMIN', 'SUPER_ADMIN')),
    avatar_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Farms
CREATE TABLE IF NOT EXISTS farms (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    farm_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL,
    lga TEXT NOT NULL,
    address TEXT NOT NULL,
    gps_lat REAL,
    gps_lng REAL,
    farm_size TEXT,
    farm_type TEXT,
    main_products TEXT,
    description TEXT,
    farm_photos TEXT, -- JSON array
    logo_url TEXT,
    rating REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Farmer Verifications
CREATE TABLE IF NOT EXISTS farmer_verifications (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    id_document_url TEXT NOT NULL,
    farm_documents TEXT NOT NULL, -- JSON array
    farm_photos TEXT NOT NULL, -- JSON array
    cooperative_info TEXT,
    bank_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    rejection_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    unit TEXT NOT NULL,
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    maximum_quantity INTEGER,
    inventory INTEGER NOT NULL DEFAULT 0,
    availability_date TEXT,
    harvest_date TEXT,
    packaging_type TEXT,
    packaging_fee REAL NOT NULL DEFAULT 0,
    is_perishable INTEGER NOT NULL DEFAULT 1,
    cold_chain_required INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED')),
    images TEXT NOT NULL, -- JSON array
    attributes TEXT NOT NULL, -- JSON object
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- 6. Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- 7. Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    state TEXT NOT NULL,
    lga TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    delivery_instructions TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 8. Carts
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    subtotal REAL NOT NULL,
    packaging_fee REAL NOT NULL DEFAULT 0,
    logistics_fee REAL NOT NULL DEFAULT 0,
    platform_fee REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN (
        'PENDING_PAYMENT', 'PAID', 'FARMER_CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
        'LOGISTICS_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
        'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED'
    )),
    delivery_address TEXT NOT NULL, -- JSON
    delivery_instructions TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES users (id),
    FOREIGN KEY (farm_id) REFERENCES farms (id),
    FOREIGN KEY (farmer_id) REFERENCES users (id)
);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    product_attributes TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 11. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('PAYSTACK', 'FLUTTERWAVE')),
    provider_reference TEXT UNIQUE NOT NULL,
    idempotency_key TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    metadata TEXT NOT NULL, -- JSON
    paid_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users (id)
);

-- 12. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL, -- JSON
    created_at TEXT NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE
);

-- 13. Logistics Providers
CREATE TABLE IF NOT EXISTS logistics_providers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('PENDING', 'VERIFIED', 'SUSPENDED')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 14. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('MOTORCYCLE', 'VAN', 'TRUCK', 'REFRIGERATED_TRUCK')),
    plate_number TEXT UNIQUE NOT NULL,
    max_weight_kg REAL NOT NULL,
    has_refrigeration INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES logistics_providers (id) ON DELETE CASCADE
);

-- 15. Logistics Routes
CREATE TABLE IF NOT EXISTS logistics_routes (
    id TEXT PRIMARY KEY,
    origin_state TEXT NOT NULL,
    destination_state TEXT NOT NULL,
    base_price REAL NOT NULL,
    per_kg_rate REAL NOT NULL,
    cold_chain_surcharge REAL NOT NULL DEFAULT 0,
    estimated_transit_days INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(origin_state, destination_state)
);

-- 16. Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    provider_id TEXT,
    vehicle_id TEXT,
    tracking_number TEXT UNIQUE NOT NULL,
    origin_state TEXT NOT NULL,
    destination_state TEXT NOT NULL,
    estimated_delivery TEXT,
    actual_delivery TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_ASSIGNMENT' CHECK (status IN (
        'PENDING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'PICKED_UP',
        'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'
    )),
    proof_of_delivery_note TEXT,
    proof_of_delivery_image TEXT,
    recipient_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES logistics_providers (id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
);

-- 17. Delivery Events
CREATE TABLE IF NOT EXISTS delivery_events (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT NOT NULL,
    location TEXT,
    gps_lat REAL,
    gps_lng REAL,
    proof_image TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
);

-- 18. Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('FARMER', 'LOGISTICS')),
    available_balance REAL NOT NULL DEFAULT 0,
    pending_balance REAL NOT NULL DEFAULT 0,
    total_earnings REAL NOT NULL DEFAULT 0,
    total_withdrawals REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 19. Wallet Transactions (Immutable Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'SETTLEMENT', 'WITHDRAWAL', 'REFUND', 'FEE')),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('ORDER', 'WITHDRAWAL', 'REFUND', 'ADJUSTMENT')),
    reference_id TEXT,
    description TEXT NOT NULL,
    balance_after REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
);

-- 20. Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    farm_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    logistics_id TEXT,
    product_amount REAL NOT NULL,
    packaging_amount REAL NOT NULL DEFAULT 0,
    logistics_amount REAL NOT NULL DEFAULT 0,
    platform_fee_amount REAL NOT NULL DEFAULT 0,
    farmer_net_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ELIGIBLE', 'PROCESSING', 'PAID', 'HELD')),
    held_reason TEXT,
    eligible_at TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (farm_id) REFERENCES farms (id),
    FOREIGN KEY (farmer_id) REFERENCES users (id)
);

-- 21. Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'REJECTED', 'FAILED')),
    rejection_reason TEXT,
    audit_note TEXT,
    processed_by TEXT,
    processed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 22. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    product_id TEXT,
    rating REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
    farmer_rating REAL,
    logistics_rating REAL,
    comment TEXT NOT NULL,
    photos TEXT, -- JSON array
    created_at TEXT NOT NULL,
    UNIQUE(order_id, customer_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users (id),
    FOREIGN KEY (farm_id) REFERENCES farms (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 23. Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    farm_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT NOT NULL, -- JSON array
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 'RESOLVED', 'CLOSED')),
    resolution_type TEXT CHECK (resolution_type IN ('NO_REFUND', 'PARTIAL_REFUND', 'FULL_REFUND', 'FARMER_COMPENSATION', 'LOGISTICS_COMPENSATION')),
    refund_amount REAL DEFAULT 0,
    resolution_notes TEXT,
    resolved_by TEXT,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users (id),
    FOREIGN KEY (farm_id) REFERENCES farms (id)
);

-- 24. Dispute Messages
CREATE TABLE IF NOT EXISTS dispute_messages (
    id TEXT PRIMARY KEY,
    dispute_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (dispute_id) REFERENCES disputes (id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id)
);

-- 25. Bulk Orders (B2B Module)
CREATE TABLE IF NOT EXISTS bulk_order_requests (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    required_quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    target_price_per_unit REAL,
    delivery_state TEXT NOT NULL,
    delivery_lga TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    specifications TEXT NOT NULL, -- JSON
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESPONDED', 'CLOSED', 'EXPIRED')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users (id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS bulk_order_offers (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    offered_price_per_unit REAL NOT NULL,
    total_amount REAL NOT NULL,
    available_date TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (request_id) REFERENCES bulk_order_requests (id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users (id)
);

-- 26. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ORDER', 'DELIVERY', 'PAYMENT', 'VERIFICATION', 'DISPUTE', 'SYSTEM')),
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 27. Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PRODUCT', 'FARM')),
    item_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, type, item_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 28. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    created_at TEXT NOT NULL
);

-- 29. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by TEXT,
    updated_at TEXT NOT NULL
);

-- Indices for high performance queries
CREATE INDEX IF NOT EXISTS idx_products_farm_id ON products(farm_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_order_id ON settlements(order_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

# AgroDirect — Full Build Prompt

Use this prompt to build the complete AgroDirect multi-vendor agricultural marketplace from scratch.

---

## MASTER BUILD PROMPT

Build a Production-Ready Multi-Vendor Agricultural Marketplace called **AgroDirect**.

You are acting as a Senior Product Architect, Full-Stack Engineer, Database Architect, UI/UX Designer, DevOps Engineer, Security Engineer, and QA Engineer.

Your task is to DESIGN, BUILD, TEST, DEBUG, and DEPLOY a production-ready agricultural marketplace application.

Do not create a static mockup or landing page.

Build a functional full-stack application with authentication, database, marketplace, farmer dashboards, customer dashboards, logistics management, payments architecture, order management, settlements, reviews, disputes, notifications, and a powerful admin dashboard.

The application must be architected so it can scale from an MVP operating between Nigerian states into a nationwide agricultural marketplace.

---

## 1. PRODUCT

Working name: AgroDirect

Concept: AgroDirect connects verified farmers and agricultural suppliers directly with consumers and businesses across Nigerian states.

Core marketplace flow:

```
FARMER → AGRODIRECT MARKETPLACE → LOGISTICS PROVIDER → CUSTOMER
```

Example:
A farmer in Abia lists 500 broiler chickens. A customer in Lagos purchases 20 chickens.

AgroDirect:
1. Confirms the farmer.
2. Confirms inventory.
3. Calculates product price.
4. Calculates packaging.
5. Calculates inter-state logistics.
6. Calculates platform fee.
7. Collects payment.
8. Sends order to farmer.
9. Farmer prepares order.
10. Logistics provider picks up order.
11. Product travels to Lagos.
12. Customer receives delivery.
13. Customer confirms delivery.
14. Farmer settlement becomes eligible.
15. Farmer receives payment.
16. Customer reviews farmer/product.

The system must support both B2C and future B2B agricultural procurement.

---

## 2. INITIAL MVP MARKET

Build the MVP around:
- Origin: Abia State, Nigeria
- Initial destination: Lagos State, Nigeria

The architecture must support future expansion to all Nigerian states. Do NOT hard-code Abia and Lagos into the architecture. States and routes must be database-driven.

---

## 3. INITIAL PRODUCTS

Start with: Chicken, Eggs, Fish, Yam, Plantain, Vegetables, Rice, Beans, Fruits

Design the category system so additional agricultural products can easily be added.

---

## 4. USER ROLES

Implement proper role-based access control:
1. Customer
2. Farmer
3. Farmer Staff
4. Logistics Provider
5. Logistics Staff
6. Admin
7. Super Admin

Never trust role information supplied by the frontend. Authorization must be enforced server-side/database-side.

---

## 5. CUSTOMER APPLICATION

Create a modern mobile-first marketplace.

Main navigation: Home, Shop, Categories, Farms, Bulk Orders, How It Works

Authenticated: My Orders, Wishlist, Cart, Notifications, Profile

Customer capabilities:
- Register, Login, Browse products, Search, Filter
- View farmer, View farm, View product
- Add to cart, Checkout, Add delivery address
- See logistics estimate, Pay, Track order
- Confirm delivery, Review farmer, Review product
- Open dispute, Request refund, Save products, Save farms

---

## 6. FARMER APPLICATION

Farmer onboarding must be multi-step:

**Step 1 — Account:** Full name, Email, Phone, Password

**Step 2 — Farm information:** Farm name, State, LGA, Address, GPS, Farm size, Farm type, Main products, Farm description

**Step 3 — Verification:** Government ID, ID type, ID number, ID document, Farm documents, Farm photos, Cooperative information

**Step 4 — Bank information:** Bank, Account name, Account number

**Step 5:** Submit for review.

Farmer statuses: Pending, Under Review, Verified, Rejected, Suspended

Only verified farmers can publish products.

---

## 7. FARMER DASHBOARD

Dashboard cards: Total Sales, This Month, Pending Orders, Available Products, Inventory Value, Pending Settlement, Available Balance, Rating

Navigation: Dashboard, Products, Add Product, Inventory, Orders, Earnings, Withdrawals, Reviews, Farm Profile, Verification, Notifications, Settings

Farmer must be able to:
- Create/edit products, Upload images, Set price/quantity/minimum order/availability date
- Manage inventory, Confirm orders, Prepare orders, Mark order ready
- See logistics pickup, See earnings, Request withdrawal

---

## 8. PRODUCT SYSTEM

Products must support: Name, Description, Category, Price, Currency, Unit, Minimum quantity, Maximum quantity, Inventory, Farm, Farmer, Images, Availability date, Harvest date, Packaging, Perishable status, Cold-chain requirement, Specifications

Units: Piece, Bird, Kg, Gram, Bag, Basket, Crate, Tray, Bunch, Tonne, Litre, Carton

Create a flexible product attributes system using structured JSON/product attributes. Examples:
- Chicken: Breed, Average Weight, Age, Live/Dressed, Processing Date
- Fish: Species, Weight, Fresh/Frozen
- Yam: Variety, Grade, Average Size, Harvest Date

---

## 9. MARKETPLACE

Build: Homepage, Shop, Category pages, Product pages, Farmer storefronts

Search by: Product, Category, Farmer, State, LGA

Filters: Price, Rating, Verified farmer, Availability, Product type, Fresh/Frozen, Delivery availability

Sorting: Relevance, Price, Rating, Newest, Popular, Distance

---

## 10. FARMER STOREFRONT

Every farmer should have a public profile at `/farms/:slug`

Show: Farm name, Verification badge, Location, Rating, Completed orders, Products, Farm description, Farm photos, Reviews

---

## 11. CART

For MVP, prefer one farmer per checkout. If a customer adds products from different farmers, automatically split the cart into separate orders.

Display: Product subtotal, Packaging, Logistics, Platform fee, Discount, Total

Never hide delivery charges until after payment.

---

## 12. CHECKOUT

Collect: Customer name, Phone, Email, Delivery address, State, LGA, Delivery instructions

Calculate: PRODUCT SUBTOTAL + PACKAGING + LOGISTICS + PLATFORM FEE - DISCOUNT = TOTAL

Show a transparent breakdown before payment: Farmer, Origin, Destination, Estimated delivery time, Product quantity, Total cost

---

## 13. LOGISTICS SYSTEM

Build logistics as an independent module. Logistics providers can register and specify: Business name, Contact information, Vehicle, Vehicle capacity, Refrigeration, Routes, Pricing, Delivery areas

Create configurable route records (e.g., Abia → Lagos): Origin, Destination, Base price, Weight price, Estimated delivery time, Cold-chain surcharge, Active/inactive

Never hard-code delivery prices in frontend code.

---

## 14. DELIVERY STATES

Use a strict state machine:

```
Pending Assignment → Assigned → Accepted → Pickup Scheduled → Picked Up → In Transit → Out for Delivery → Delivered
Alternative: Failed, Cancelled
```

Every state change should generate a delivery event with: Timestamp, User, Status, Note, GPS if available, Proof image where appropriate

---

## 15. ORDER STATE MACHINE

```
Pending Payment → Paid → Farmer Confirmed → Preparing → Ready for Pickup → Logistics Assigned → Picked Up → In Transit → Out for Delivery → Delivered → Completed
Alternative: Payment Failed, Cancelled, Disputed, Refunded
```

Do not allow arbitrary state changes. Create backend validation for permitted transitions.

---

## 16. PAYMENT SYSTEM

Design payment architecture for Paystack and Flutterwave.

Payment must be server-verified. Never trust "payment successful" from the browser.

Create: Payment, Payment Transaction, Provider Reference, Payment Status, Amount, Currency, Metadata

Use idempotency protection. Prevent: Duplicate orders, Duplicate payment processing, Double settlement

Use webhook architecture for payment providers.

---

## 17. MARKETPLACE COMMISSION

Use configurable platform fees. Default MVP: 5% platform transaction fee. Do NOT hard-code this value.

Admin must be able to change: Platform fee, Logistics fee, Packaging fee, Minimum withdrawal, Refund policy, Settlement delay

---

## 18. SETTLEMENT

Example order breakdown:
- Product: ₦190,000
- Packaging: ₦10,000
- Logistics: ₦35,000
- Platform fee: ₦7,500
- Customer pays: ₦242,500

Financial ledger: Farmer → ₦190,000, Logistics → ₦35,000, Packaging → ₦10,000, Platform → ₦7,500

Settlement flow: Pending → Eligible → Processing → Paid
If disputed: Settlement becomes Held

---

## 19. FARMER WALLET

Dashboard: Available Balance, Pending Balance, Total Earnings, Total Withdrawals

Wallet transactions must be immutable. Support: Credit, Debit, Settlement, Withdrawal, Refund adjustment, Fee

Do not calculate wallet balances only from frontend state.

---

## 20. WITHDRAWALS

Farmer can request withdrawal. Collect: Bank, Account Name, Account Number, Amount

Statuses: Pending, Processing, Paid, Failed, Rejected

Admin can review withdrawals. Every withdrawal must have an audit trail.

---

## 21. DISPUTES

Customer can open dispute after an order. Reasons: Product not delivered, Wrong product, Quantity shortage, Damaged product, Poor quality, Late delivery, Product differs from listing

Workflow: Open → Under Review → Evidence Requested → Decision → Resolved

Admin resolution: No refund, Partial refund, Full refund, Farmer compensation, Logistics compensation

Allow image/document evidence.

---

## 22. REVIEWS

Only customers with completed orders can review. Ratings: 1–5 stars.

Review: Farmer, Product, Logistics

Prevent duplicate reviews for the same purchase.

---

## 23. ADMIN DASHBOARD

Build a professional enterprise-style dashboard.

Sidebar: Dashboard, Users, Farmers, Farmer Verification, Customers, Products, Categories, Orders, Payments, Settlements, Withdrawals, Logistics, Routes, Vehicles, Disputes, Reviews, Promotions, Bulk Orders, Reports, Notifications, Settings, Audit Logs

---

## 24. ADMIN DASHBOARD METRICS

Display: Total GMV, Platform Revenue, Orders Today, Orders This Month, Active Farmers, Verified Farmers, Customers, Active Products, Pending Verification, Pending Withdrawals, Open Disputes, Orders In Transit

Charts: GMV over time, Orders over time, Revenue over time, Orders by state, Sales by category, Top farmers, Top products, Delivery performance

---

## 25. FARMER VERIFICATION ADMIN

Admin can: View application, View ID, View farm documents, View farm images, Approve, Reject, Request more information, Suspend, Reactivate

Every action creates an audit log.

---

## 26. ORDER ADMIN

Admin can: Search, Filter, View order, View payment, View farmer, View customer, View shipment, View timeline, Assign logistics, Cancel, Refund, Resolve dispute

---

## 27. LOGISTICS ADMIN

Admin can: Approve logistics providers, Suspend providers, Manage routes, Manage pricing, Manage vehicles, Assign deliveries, Monitor active deliveries, View failed deliveries, View delivery performance

---

## 28. NOTIFICATION SYSTEM

Create in-app notifications for all key events. Design notification architecture so email, SMS and WhatsApp can be added later.

---

## 29. DATABASE

Use PostgreSQL. Use UUID primary keys.

Core tables: profiles, farms, farmer_verifications, categories, products, product_images, product_attributes, inventory, inventory_movements, addresses, carts, cart_items, orders, order_items, payments, payment_transactions, logistics_providers, vehicles, logistics_routes, shipments, delivery_events, settlements, wallets, wallet_transactions, withdrawals, reviews, disputes, dispute_messages, notifications, favorites, bulk_order_requests, bulk_order_offers, audit_logs, platform_settings

Add proper: Foreign keys, Indexes, Unique constraints, Check constraints, Created timestamps, Updated timestamps

---

## 30. SECURITY

Implement: Secure authentication, Role-based authorization, Server-side authorization, Database-level access control, Input validation, File upload validation, Secure storage, Signed URLs, Rate limiting, Audit logs, Payment webhook verification, CSRF protection, XSS protection, SQL injection protection, Secure environment variables

Never expose: Payment secrets, Database service keys, Private farmer documents, Admin credentials

---

## 31. DESIGN SYSTEM

Use a premium modern African agricultural visual identity.

Style: Modern, Clean, Trustworthy, Natural, Professional, Mobile-first

Palette:
- Primary: Agricultural green (#2D6A4F)
- Secondary: Deep forest green (#1B4332)
- Accent: Warm orange (#E76F51)
- Background: Warm off-white (#FEFAE0)
- Text: Dark charcoal (#2D3436)

Use green strategically rather than making the entire application green. Use high-quality agricultural imagery.

Product cards should emphasize: Image, Product name, Price, Unit, Farmer, Location, Rating, Verification badge, Delivery availability

---

## 32. MOBILE EXPERIENCE

Optimize heavily for Android/mobile users.

Mobile navigation: Home, Shop, Orders, Cart, Account

Use: Large touch targets, Sticky checkout CTA, Fast-loading images, Skeleton loaders, Empty states, Error states, Offline-friendly considerations

Desktop should use richer dashboards.

---

## 33. B2B FUTURE ARCHITECTURE

Prepare for: Restaurants, Hotels, Supermarkets, Food processors, Wholesalers

B2B features (architecture only, don't overbuild in MVP): Bulk orders, RFQs, Supplier offers, Negotiated pricing, Recurring orders, Invoices, Purchase orders

---

## 34. FUTURE FEATURES

Architect so these can be added later: AI product recommendations, Demand forecasting, Farmer production forecasting, Dynamic pricing, Agricultural financing, Micro-insurance, Cold-chain monitoring, IoT farm data, Export marketplace, International buyers, Warehouse management, Farm aggregation, Cooperative management

---

## 35. PAGES

**PUBLIC:** /, /shop, /products/:slug, /categories/:slug, /farms, /farms/:slug, /bulk-orders, /how-it-works, /become-a-farmer, /become-a-logistics-partner, /login, /register

**CUSTOMER:** /account, /account/orders, /account/orders/:id, /account/cart, /account/wishlist, /account/addresses, /account/profile, /account/notifications

**FARMER:** /farmer, /farmer/products, /farmer/products/new, /farmer/products/:id, /farmer/inventory, /farmer/orders, /farmer/orders/:id, /farmer/earnings, /farmer/withdrawals, /farmer/profile, /farmer/verification, /farmer/settings

**LOGISTICS:** /logistics, /logistics/jobs, /logistics/jobs/:id, /logistics/routes, /logistics/vehicles, /logistics/earnings, /logistics/profile

**ADMIN:** /admin, /admin/users, /admin/farmers, /admin/farmers/verification, /admin/customers, /admin/products, /admin/categories, /admin/orders, /admin/payments, /admin/settlements, /admin/withdrawals, /admin/logistics, /admin/routes, /admin/vehicles, /admin/disputes, /admin/reviews, /admin/reports, /admin/settings, /admin/audit-logs

---

## 36. PROJECT STRUCTURE

Use a clean scalable architecture. Separate: Components, Pages, Layouts, Hooks, Services, Types, Validation, Database, Authentication, Payment services, Logistics services, Notification services, Admin services

Create reusable components: ProductCard, FarmerCard, OrderStatusBadge, PriceBreakdown, DeliveryTimeline, VerificationBadge, RatingStars, InventoryStatus, PaymentStatus, EmptyState, LoadingState, ErrorState, DataTable, DashboardCard

---

## 37. API / SERVICE ARCHITECTURE

Create service abstractions: authService, productService, inventoryService, orderService, paymentService, logisticsService, settlementService, walletService, notificationService, reviewService, disputeService, adminService

Payment interface should support: PaymentProvider → PaystackProvider, FlutterwaveProvider

Do not tightly couple the entire application to one payment provider.

---

## 38. ERROR HANDLING

Every important operation must handle: Loading, Success, Failure, Empty state, Unauthorized, Forbidden, Not found, Validation errors, Network failure

Show user-friendly messages. Never expose raw database errors to users.

---

## 39. PERFORMANCE

Optimize for: Mobile networks, Low bandwidth, Image compression, Lazy loading, Pagination, Database indexes, Caching, Efficient queries

Do not load the entire product catalog at once. Use pagination.

---

## 40. SEO

Public pages should have: Proper page titles, Meta descriptions, Open Graph metadata, Canonical URLs, Structured product metadata, Readable URLs (e.g., /products/fresh-broiler-chicken-2kg)

---

## 41. TESTING

Before declaring the project complete, test: Authentication, Registration, Login, Role permissions, Farmer onboarding, Farmer verification, Product creation, Product editing, Inventory, Cart, Checkout, Payment success, Payment failure, Order creation, Order cancellation, Logistics assignment, Shipment tracking, Delivery, Settlement, Withdrawal, Review, Dispute, Admin operations

Test both desktop and mobile. Fix all critical errors before completion.

---

## 42. SEED DATA

Create development/demo data:

Farmers: Obegu Integrated Farms, Green Valley Poultry, Sunrise Agro Farm, Eastern Harvest Farms

Products: Broiler Chicken, Fresh Eggs, Catfish, Yam, Plantain, Tomatoes, Pepper, Rice, Beans

States: Abia, Lagos, Anambra, Enugu, Rivers, Imo, Ebonyi, FCT

Create realistic demo: Customers, Orders, Shipments, Payments, Reviews, Farmers, Products

Clearly label demo/test records.

---

## 43. IMPORTANT BUSINESS RULES

1. Only verified farmers can publish products.
2. Only active products can be purchased.
3. Inventory must be reserved when an order is created.
4. Do not oversell inventory.
5. Payment must be verified server-side.
6. Settlement cannot be released before delivery/completion.
7. Disputed orders automatically hold settlement.
8. Only completed orders can receive reviews.
9. Only authorized administrators can approve farmers.
10. All financial operations require immutable transaction records.
11. All sensitive administrative actions require audit logs.
12. Never trust prices, fees or totals submitted by the client. Recalculate important financial values server-side.

---

## 44. DEVELOPMENT STRATEGY

Work in phases:

**PHASE 1 — FOUNDATION:** Authentication, Database, Profiles, Roles, RLS/authorization, Design system, Navigation, Layouts. Then test.

**PHASE 2 — FARMER:** Farmer onboarding, Farm profile, Verification, Products, Images, Inventory, Farmer dashboard. Then test.

**PHASE 3 — MARKETPLACE:** Homepage, Shop, Categories, Search, Filters, Product page, Farmer storefront, Cart. Then test.

**PHASE 4 — COMMERCE:** Checkout, Addresses, Order creation, Payment architecture, Order state machine. Then test.

**PHASE 5 — LOGISTICS:** Providers, Vehicles, Routes, Shipment, Delivery tracking, Proof of delivery. Then test.

**PHASE 6 — FINANCE:** Wallet, Settlement, Withdrawal, Refund, Financial ledger. Then test.

**PHASE 7 — ADMIN:** Admin dashboard, Verification, Orders, Payments, Logistics, Disputes, Reports, Audit logs. Then test.

**PHASE 8 — POLISH:** Mobile UI, Performance, SEO, Accessibility, Error states, Loading states, Empty states, Security, Testing.

---

## 45. IMPORTANT INSTRUCTION

Do not merely explain how to build this application. Actually build it.

---

## TECH STACK

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js with tRPC or Express
- Database: PostgreSQL with UUID primary keys
- Authentication: JWT with server-side RBAC
- Payments: Paystack + Flutterwave (provider-agnostic interface)
- Deployment: Production-ready build

---

export type UserRole =
  | 'CUSTOMER'
  | 'FARMER'
  | 'FARMER_STAFF'
  | 'LOGISTICS_PROVIDER'
  | 'LOGISTICS_STAFF'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FarmStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  slug: string;
  state: string;
  lga: string;
  address: string;
  gps_lat?: number;
  gps_lng?: number;
  farm_size?: string;
  farm_type?: string;
  main_products?: string;
  description: string;
  farm_photos?: string[];
  logo_url?: string;
  rating: number;
  total_reviews: number;
  completed_orders: number;
  status: FarmStatus;
  created_at: string;
  updated_at: string;
  // Joins
  farmer_name?: string;
  farmer_email?: string;
  farmer_phone?: string;
}

export interface FarmerVerification {
  id: string;
  farm_id: string;
  farmer_id: string;
  id_type: string;
  id_number: string;
  id_document_url: string;
  farm_documents: string[];
  farm_photos: string[];
  cooperative_info?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: FarmStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type ProductUnit =
  | 'Piece'
  | 'Bird'
  | 'Kg'
  | 'Gram'
  | 'Bag'
  | 'Basket'
  | 'Crate'
  | 'Tray'
  | 'Bunch'
  | 'Tonne'
  | 'Litre'
  | 'Carton';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

export interface Product {
  id: string;
  farm_id: string;
  farmer_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  unit: ProductUnit;
  minimum_quantity: number;
  maximum_quantity?: number;
  inventory: number;
  availability_date?: string;
  harvest_date?: string;
  packaging_type?: string;
  packaging_fee: number;
  is_perishable: boolean;
  cold_chain_required: boolean;
  status: ProductStatus;
  images: string[];
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joins
  farm_name?: string;
  farm_slug?: string;
  farm_state?: string;
  farm_lga?: string;
  category_name?: string;
  farmer_name?: string;
  rating?: number;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  change_amount: number;
  reason: 'ORDER_RESERVED' | 'ORDER_CANCELLED' | 'RESTOCK' | 'SPOILAGE' | 'MANUAL_ADJUSTMENT';
  reference_id?: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  street_address: string;
  state: string;
  lga: string;
  is_default: boolean;
  delivery_instructions?: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joins
  product?: Product;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'FARMER_CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'LOGISTICS_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  farm_id: string;
  farmer_id: string;
  subtotal: number;
  packaging_fee: number;
  logistics_fee: number;
  platform_fee: number;
  discount: number;
  total_amount: number;
  status: OrderStatus;
  delivery_address: {
    full_name: string;
    phone: string;
    street_address: string;
    state: string;
    lga: string;
    delivery_instructions?: string;
  };
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
  // Joins
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  farm_name?: string;
  farm_state?: string;
  farmer_name?: string;
  items?: OrderItem[];
  shipment?: Shipment;
  settlement?: Settlement;
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit: string;
  price: number;
  quantity: number;
  total_price: number;
  product_attributes: Record<string, any>;
  created_at: string;
}

export type PaymentProvider = 'PAYSTACK' | 'FLUTTERWAVE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  provider: PaymentProvider;
  provider_reference: string;
  idempotency_key?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, any>;
  paid_at?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface LogisticsProvider {
  id: string;
  user_id: string;
  company_name: string;
  phone: string;
  email: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  created_at: string;
}

export type VehicleType = 'MOTORCYCLE' | 'VAN' | 'TRUCK' | 'REFRIGERATED_TRUCK';

export interface Vehicle {
  id: string;
  provider_id: string;
  vehicle_type: VehicleType;
  plate_number: string;
  max_weight_kg: number;
  has_refrigeration: boolean;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';
  created_at: string;
}

export interface LogisticsRoute {
  id: string;
  origin_state: string;
  destination_state: string;
  base_price: number;
  per_kg_rate: number;
  cold_chain_surcharge: number;
  estimated_transit_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus =
  | 'PENDING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface Shipment {
  id: string;
  order_id: string;
  provider_id?: string;
  vehicle_id?: string;
  tracking_number: string;
  origin_state: string;
  destination_state: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  status: DeliveryStatus;
  proof_of_delivery_note?: string;
  proof_of_delivery_image?: string;
  recipient_name?: string;
  created_at: string;
  updated_at: string;
  // Joins
  provider_name?: string;
  provider_phone?: string;
  vehicle_plate?: string;
  events?: DeliveryEvent[];
}

export interface DeliveryEvent {
  id: string;
  shipment_id: string;
  status: DeliveryStatus;
  note: string;
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  proof_image?: string;
  created_by?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  role: 'FARMER' | 'LOGISTICS';
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  total_withdrawals: number;
  created_at: string;
  updated_at: string;
}

export type WalletTxType = 'CREDIT' | 'DEBIT' | 'SETTLEMENT' | 'WITHDRAWAL' | 'REFUND' | 'FEE';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: WalletTxType;
  reference_type: 'ORDER' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT';
  reference_id?: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export type SettlementStatus = 'PENDING' | 'ELIGIBLE' | 'PROCESSING' | 'PAID' | 'HELD';

export interface Settlement {
  id: string;
  order_id: string;
  farm_id: string;
  farmer_id: string;
  logistics_id?: string;
  product_amount: number;
  packaging_amount: number;
  logistics_amount: number;
  platform_fee_amount: number;
  farmer_net_amount: number;
  status: SettlementStatus;
  held_reason?: string;
  eligible_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED';

export interface Withdrawal {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  rejection_reason?: string;
  audit_note?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  // Joins
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  farm_id: string;
  product_id?: string;
  rating: number; // 1-5
  farmer_rating?: number;
  logistics_rating?: number;
  comment: string;
  photos?: string[];
  created_at: string;
  // Joins
  customer_name?: string;
  product_name?: string;
  farm_name?: string;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'RESOLVED' | 'CLOSED';
export type DisputeResolution =
  | 'NO_REFUND'
  | 'PARTIAL_REFUND'
  | 'FULL_REFUND'
  | 'FARMER_COMPENSATION'
  | 'LOGISTICS_COMPENSATION';

export interface Dispute {
  id: string;
  order_id: string;
  customer_id: string;
  farm_id: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;
  resolution_type?: DisputeResolution;
  refund_amount?: number;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joins
  order_number?: string;
  customer_name?: string;
  farm_name?: string;
  messages?: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_role: string;
  sender_name?: string;
  message: string;
  attachment_url?: string;
  created_at: string;
}

export interface BulkOrderRequest {
  id: string;
  buyer_id: string;
  category_id: string;
  product_name: string;
  required_quantity: number;
  unit: string;
  target_price_per_unit?: number;
  delivery_state: string;
  delivery_lga: string;
  delivery_date: string;
  specifications: Record<string, any>;
  status: 'OPEN' | 'RESPONDED' | 'CLOSED' | 'EXPIRED';
  created_at: string;
  // Joins
  buyer_name?: string;
  buyer_company?: string;
  offers?: BulkOrderOffer[];
}

export interface BulkOrderOffer {
  id: string;
  request_id: string;
  farmer_id: string;
  offered_price_per_unit: number;
  total_amount: number;
  available_date: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  // Joins
  farmer_name?: string;
  farm_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'DELIVERY' | 'PAYMENT' | 'VERIFICATION' | 'DISPUTE' | 'SYSTEM';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_by?: string;
  updated_at: string;
}

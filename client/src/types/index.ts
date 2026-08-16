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
  farm_photos: string[];
  logo_url?: string;
  rating: number;
  total_reviews: number;
  completed_orders: number;
  status: FarmStatus;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  farmer_email?: string;
  farmer_phone?: string;
  active_product_count?: number;
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
  product_count?: number;
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
  farm_name?: string;
  farm_slug?: string;
  farm_state?: string;
  farm_lga?: string;
  category_name?: string;
  farmer_name?: string;
  rating?: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_slug: string;
  price: number;
  unit: string;
  images: string[];
  inventory: number;
  packaging_fee: number;
  is_perishable: boolean;
  cold_chain_required: boolean;
  farm_id: string;
  farm_name: string;
  farm_state: string;
  farm_lga: string;
  farm_status: FarmStatus;
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
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  farm_name?: string;
  farm_state?: string;
  farmer_name?: string;
  item_count?: number;
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
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, any>;
  paid_at?: string;
  created_at: string;
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

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'SETTLEMENT' | 'WITHDRAWAL' | 'REFUND' | 'FEE';
  reference_type: 'ORDER' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT';
  reference_id?: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface Settlement {
  id: string;
  order_id: string;
  order_number?: string;
  farm_id: string;
  farm_name?: string;
  farmer_id: string;
  farmer_name?: string;
  logistics_id?: string;
  product_amount: number;
  packaging_amount: number;
  logistics_amount: number;
  platform_fee_amount: number;
  farmer_net_amount: number;
  status: 'PENDING' | 'ELIGIBLE' | 'PROCESSING' | 'PAID' | 'HELD';
  held_reason?: string;
  eligible_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED';
  rejection_reason?: string;
  audit_note?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
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
  rating: number;
  farmer_rating?: number;
  logistics_rating?: number;
  comment: string;
  photos?: string[];
  created_at: string;
  customer_name?: string;
  product_name?: string;
  farm_name?: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  order_number?: string;
  customer_id: string;
  customer_name?: string;
  farm_id: string;
  farm_name?: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'RESOLVED' | 'CLOSED';
  resolution_type?: string;
  refund_amount?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
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
  buyer_name?: string;
  category_id: string;
  category_name?: string;
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
  offer_count?: number;
  offers?: BulkOrderOffer[];
}

export interface BulkOrderOffer {
  id: string;
  request_id: string;
  farmer_id: string;
  farmer_name?: string;
  farm_name?: string;
  offered_price_per_unit: number;
  total_amount: number;
  available_date: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
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

export interface Vehicle {
  id: string;
  provider_id: string;
  vehicle_type: 'MOTORCYCLE' | 'VAN' | 'TRUCK' | 'REFRIGERATED_TRUCK';
  plate_number: string;
  max_weight_kg: number;
  has_refrigeration: boolean;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';
  created_at: string;
  provider_name?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}


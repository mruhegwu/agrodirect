let rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_BASE = rawApiUrl.replace(/\/+$/, '').endsWith('/api') 
  ? rawApiUrl.replace(/\/+$/, '') 
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

export function getAuthToken(): string | null {
  return localStorage.getItem('agrodirect_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('agrodirect_token', token);
  } else {
    localStorage.removeItem('agrodirect_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'An error occurred while communicating with AgroDirect API');
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: { email: string; password: string; full_name: string; phone: string; role?: string }) =>
      request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request<{ user: any; farm: any; verification: any; wallet: any }>('/auth/me'),
    updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Categories & Products
  categories: {
    list: () => request<any[]>('/categories'),
    getBySlug: (slug: string) => request<any>(`/categories/${slug}`),
  },

  products: {
    list: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
      return request<any[]>(`/products?${query.toString()}`);
    },
    getBySlug: (slug: string) => request<any>(`/products/slug/${slug}`),
    getById: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getInventoryHistory: (id: string) => request<any[]>(`/products/${id}/inventory-history`),
  },

  // Farms
  farmers: {
    list: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
      return request<any[]>(`/farmers?${query.toString()}`);
    },
    getStoreBySlug: (slug: string) => request<any>(`/farmers/store/${slug}`),
    getDashboard: () => request<any>('/farmers/dashboard'),
    submitOnboarding: (data: any) => request<any>('/farmers/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Cart
  cart: {
    get: () => request<any[]>('/cart'),
    add: (product_id: string, quantity: number) =>
      request<any[]>('/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
    update: (id: string, quantity: number) =>
      request<any[]>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (id: string) => request<any[]>(`/cart/items/${id}`, { method: 'DELETE' }),
    clear: () => request<any>('/cart', { method: 'DELETE' }),
    previewSummary: (delivery_state: string) =>
      request<any>('/cart/preview-summary', { method: 'POST', body: JSON.stringify({ delivery_state }) }),
  },

  // Orders & Commerce
  orders: {
    checkout: (data: { delivery_address: any; delivery_instructions?: string }) =>
      request<{ orders: any[]; totalAmount: number }>('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
    getMyOrders: (status?: string) => request<any[]>(`/orders/my-orders${status ? `?status=${status}` : ''}`),
    getFarmerOrders: (status?: string) => request<any[]>(`/orders/farmer-orders${status ? `?status=${status}` : ''}`),
    getAdminOrders: (status?: string) => request<any[]>(`/orders/admin-orders${status ? `?status=${status}` : ''}`),
    getById: (id: string) => request<any>(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      request<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // Payments
  payments: {
    initialize: (data: { order_id: string; amount: number; provider?: string }) =>
      request<any>('/payments/initialize', { method: 'POST', body: JSON.stringify(data) }),
    verify: (reference: string, simulate_success: boolean = true) =>
      request<any>('/payments/verify', { method: 'POST', body: JSON.stringify({ reference, simulate_success }) }),
  },

  // Logistics
  logistics: {
    calculateRate: (data: { origin_state: string; destination_state: string; total_weight_kg: number; requires_cold_chain: boolean }) =>
      request<any>('/logistics/calculate-rate', { method: 'POST', body: JSON.stringify(data) }),
    listRoutes: () => request<any[]>('/logistics/routes'),
    upsertRoute: (data: any) => request<any>('/logistics/routes', { method: 'POST', body: JSON.stringify(data) }),
    track: (trackingNumber: string) => request<any>(`/logistics/track/${trackingNumber}`),
    listJobs: (status?: string) => request<any[]>(`/logistics/jobs${status ? `?status=${status}` : ''}`),
    updateDeliveryStatus: (shipmentId: string, data: { status: string; note: string; location?: string; proof_image?: string }) =>
      request<any>(`/logistics/shipments/${shipmentId}/events`, { method: 'POST', body: JSON.stringify(data) }),
    listVehicles: () => request<any[]>('/logistics/vehicles'),
    addVehicle: (data: any) => request<any>('/logistics/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Wallets & Withdrawals
  wallets: {
    getMyWallet: () => request<{ wallet: any; transactions: any[]; withdrawals: any[] }>('/wallets/my-wallet'),
    requestWithdrawal: (data: { amount: number; bank_name: string; account_number: string; account_name: string }) =>
      request<any>('/wallets/withdraw', { method: 'POST', body: JSON.stringify(data) }),
    listAdminWithdrawals: () => request<any[]>('/wallets/admin/withdrawals'),
    processWithdrawal: (id: string, status: 'PAID' | 'REJECTED', note?: string) =>
      request<any>(`/wallets/admin/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  },

  // Settlements
  settlements: {
    list: (status?: string) => request<any[]>(`/settlements${status ? `?status=${status}` : ''}`),
    release: (id: string) => request<any>(`/settlements/${id}/release`, { method: 'POST' }),
  },

  // Disputes
  disputes: {
    create: (data: { order_id: string; reason: string; description: string; evidence_urls?: string[] }) =>
      request<any>('/disputes', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<any[]>('/disputes'),
    getById: (id: string) => request<any>(`/disputes/${id}`),
    addMessage: (id: string, message: string, attachment_url?: string) =>
      request<any>(`/disputes/${id}/messages`, { method: 'POST', body: JSON.stringify({ message, attachment_url }) }),
    resolve: (id: string, data: { resolution_type: string; refund_amount?: number; resolution_notes: string }) =>
      request<any>(`/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Reviews
  reviews: {
    create: (data: { order_id: string; product_id?: string; rating: number; farmer_rating?: number; logistics_rating?: number; comment: string; photos?: string[] }) =>
      request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    listByFarm: (farmId: string) => request<any[]>(`/reviews/farm/${farmId}`),
    listByProduct: (productId: string) => request<any[]>(`/reviews/product/${productId}`),
  },

  // Bulk Orders (B2B)
  bulkOrders: {
    createRequest: (data: any) => request<any>('/bulk-orders/requests', { method: 'POST', body: JSON.stringify(data) }),
    listRequests: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
      return request<any[]>(`/bulk-orders/requests?${query.toString()}`);
    },
    getRequestById: (id: string) => request<any>(`/bulk-orders/requests/${id}`),
    submitOffer: (requestId: string, data: any) =>
      request<any>(`/bulk-orders/requests/${requestId}/offers`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Admin
  admin: {
    getMetrics: () => request<any>('/admin/metrics'),
    listVerifications: (status?: string) => request<any[]>(`/admin/verifications${status ? `?status=${status}` : ''}`),
    reviewVerification: (id: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'REACTIVATE', reason?: string) =>
      request<any>(`/admin/verifications/${id}/review`, { method: 'POST', body: JSON.stringify({ action, reason }) }),
    listUsers: (role?: string, search?: string) => {
      const query = new URLSearchParams();
      if (role) query.append('role', role);
      if (search) query.append('search', search);
      return request<any[]>(`/admin/users?${query.toString()}`);
    },
    toggleUserStatus: (id: string, is_active: boolean) =>
      request<any>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    getSettings: () => request<any[]>('/admin/settings'),
    updateSetting: (key: string, value: any) =>
      request<any>('/admin/settings', { method: 'POST', body: JSON.stringify({ key, value }) }),
    getAuditLogs: (limit: number = 50) => request<any[]>(`/admin/audit-logs?limit=${limit}`),
  },

  // Notifications
  notifications: {
    list: () => request<{ notifications: any[]; unreadCount: number }>('/notifications'),
    markAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
  }
};

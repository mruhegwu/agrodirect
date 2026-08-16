import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PersonaSwitcher } from './components/common/PersonaSwitcher';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { Shop } from './pages/public/Shop';
import { ProductDetail } from './pages/public/ProductDetail';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { FarmsList } from './pages/public/FarmsList';
import { FarmStorefront } from './pages/public/FarmStorefront';
import { BulkOrders } from './pages/public/BulkOrders';
import { HowItWorks } from './pages/public/HowItWorks';
import { BecomeFarmer } from './pages/public/BecomeFarmer';
import { BecomeLogistics } from './pages/public/BecomeLogistics';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerOrders } from './pages/customer/CustomerOrders';
import { CustomerOrderDetail } from './pages/customer/CustomerOrderDetail';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { CustomerWishlist } from './pages/customer/CustomerWishlist';
import { CustomerAddresses } from './pages/customer/CustomerAddresses';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';

// Farmer Pages
import { FarmerLayout } from './pages/farmer/FarmerLayout';
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProducts } from './pages/farmer/FarmerProducts';
import { FarmerProductForm } from './pages/farmer/FarmerProductForm';
import { FarmerInventory } from './pages/farmer/FarmerInventory';
import { FarmerOrders } from './pages/farmer/FarmerOrders';
import { FarmerOrderDetail } from './pages/farmer/FarmerOrderDetail';
import { FarmerEarnings } from './pages/farmer/FarmerEarnings';
import { FarmerWithdrawals } from './pages/farmer/FarmerWithdrawals';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { FarmerVerification } from './pages/farmer/FarmerVerification';
import { FarmerSettings } from './pages/farmer/FarmerSettings';

// Logistics Pages
import { LogisticsLayout } from './pages/logistics/LogisticsLayout';
import { LogisticsDashboard } from './pages/logistics/LogisticsDashboard';
import { LogisticsJobs } from './pages/logistics/LogisticsJobs';
import { LogisticsJobDetail } from './pages/logistics/LogisticsJobDetail';
import { LogisticsRoutes } from './pages/logistics/LogisticsRoutes';
import { LogisticsVehicles } from './pages/logistics/LogisticsVehicles';
import { LogisticsEarnings } from './pages/logistics/LogisticsEarnings';
import { LogisticsProfile } from './pages/logistics/LogisticsProfile';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminFarmers } from './pages/admin/AdminFarmers';
import { AdminFarmerVerification } from './pages/admin/AdminFarmerVerification';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminSettlements } from './pages/admin/AdminSettlements';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';
import { AdminLogistics } from './pages/admin/AdminLogistics';
import { AdminRoutes as AdminLogisticsRoutes } from './pages/admin/AdminRoutes';
import { AdminVehicles } from './pages/admin/AdminVehicles';
import { AdminDisputes } from './pages/admin/AdminDisputes';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-cream-100 font-sans antialiased text-charcoal-900 selection:bg-agro-500 selection:text-white">
              {/* Persona Switcher toolbar for rapid live testing across roles */}
              <PersonaSwitcher />

              {/* Main Top Navigation */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:slug" element={<CategoriesPage />} />
                  <Route path="/farms" element={<FarmsList />} />
                  <Route path="/farms/:slug" element={<FarmStorefront />} />
                  <Route path="/bulk-orders" element={<BulkOrders />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/become-a-farmer" element={<BecomeFarmer />} />
                  <Route path="/become-a-logistics-partner" element={<BecomeLogistics />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer Authenticated Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <CustomerProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <CustomerProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <CustomerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders/:id"
                    element={
                      <ProtectedRoute>
                        <CustomerOrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/wishlist"
                    element={
                      <ProtectedRoute>
                        <CustomerWishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <CustomerAddresses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/notifications"
                    element={
                      <ProtectedRoute>
                        <CustomerNotifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Farmer Portal Routes */}
                  <Route
                    path="/farmer"
                    element={
                      <ProtectedRoute allowedRoles={['FARMER', 'FARMER_STAFF', 'ADMIN', 'SUPER_ADMIN']}>
                        <FarmerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<FarmerDashboard />} />
                    <Route path="products" element={<FarmerProducts />} />
                    <Route path="products/new" element={<FarmerProductForm />} />
                    <Route path="products/:id" element={<FarmerProductForm />} />
                    <Route path="inventory" element={<FarmerInventory />} />
                    <Route path="orders" element={<FarmerOrders />} />
                    <Route path="orders/:id" element={<FarmerOrderDetail />} />
                    <Route path="earnings" element={<FarmerEarnings />} />
                    <Route path="withdrawals" element={<FarmerWithdrawals />} />
                    <Route path="profile" element={<FarmerProfile />} />
                    <Route path="verification" element={<FarmerVerification />} />
                    <Route path="settings" element={<FarmerSettings />} />
                  </Route>

                  {/* Logistics Portal Routes */}
                  <Route
                    path="/logistics"
                    element={
                      <ProtectedRoute allowedRoles={['LOGISTICS_PROVIDER', 'LOGISTICS_STAFF', 'ADMIN', 'SUPER_ADMIN']}>
                        <LogisticsLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<LogisticsDashboard />} />
                    <Route path="jobs" element={<LogisticsJobs />} />
                    <Route path="jobs/:id" element={<LogisticsJobDetail />} />
                    <Route path="routes" element={<LogisticsRoutes />} />
                    <Route path="vehicles" element={<LogisticsVehicles />} />
                    <Route path="earnings" element={<LogisticsEarnings />} />
                    <Route path="profile" element={<LogisticsProfile />} />
                  </Route>

                  {/* Admin Portal Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="farmers" element={<AdminFarmers />} />
                    <Route path="farmers/verification" element={<AdminFarmerVerification />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="settlements" element={<AdminSettlements />} />
                    <Route path="withdrawals" element={<AdminWithdrawals />} />
                    <Route path="logistics" element={<AdminLogistics />} />
                    <Route path="routes" element={<AdminLogisticsRoutes />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="disputes" element={<AdminDisputes />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

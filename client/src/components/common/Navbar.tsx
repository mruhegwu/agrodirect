import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Bell,
  User as UserIcon,
  Menu,
  X,
  Sprout,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Package,
  Truck,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-agro-100 shadow-xs">
      {/* Top Banner for Inter-State Corridor */}
      <div className="bg-agro-900 text-white text-[11px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="bg-harvest-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Abia → Lagos Corridor Active
            </span>
            <span className="text-agro-200">
              Direct farm gate fresh supply from verified farms in Abia State delivered across Lagos in 48 hours.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-agro-200">
            <Link to="/bulk-orders" className="hover:text-white transition-colors">B2B Wholesale Procurement</Link>
            <span>•</span>
            <Link to="/how-it-works" className="hover:text-white transition-colors">How Cold-Chain Logistics Works</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agro-500 to-agro-700 flex items-center justify-center text-white shadow-md shadow-agro-500/20">
              <Sprout className="w-6 h-6 text-cream-100" />
            </div>
            <div>
              <span className="text-2xl font-extrabold font-display tracking-tight text-agro-900 leading-none block">
                Agro<span className="text-harvest-400">Direct</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-agro-600">
                Farm-to-Door Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search broiler chicken, fresh eggs, catfish, white yam..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-cream-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-agro-500 focus:bg-white transition-all text-charcoal-800 placeholder-charcoal-400"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-charcoal-700">
            <Link
              to="/shop"
              className={`hover:text-agro-600 transition-colors ${isActive('/shop') ? 'text-agro-600 font-bold' : ''}`}
            >
              Shop Produce
            </Link>
            <Link
              to="/farms"
              className={`hover:text-agro-600 transition-colors ${isActive('/farms') ? 'text-agro-600 font-bold' : ''}`}
            >
              Verified Farms
            </Link>
            <Link
              to="/categories"
              className={`hover:text-agro-600 transition-colors ${isActive('/categories') ? 'text-agro-600 font-bold' : ''}`}
            >
              Categories
            </Link>
            <Link
              to="/bulk-orders"
              className={`hover:text-agro-600 transition-colors flex items-center ${isActive('/bulk-orders') ? 'text-agro-600 font-bold' : ''}`}
            >
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase mr-1.5">B2B</span>
              Bulk Orders
            </Link>
          </nav>

          {/* Action Icons & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-charcoal-700 hover:text-agro-600 hover:bg-agro-50 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-harvest-400 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <Link
                to="/account/notifications"
                className="relative p-2 text-charcoal-700 hover:text-agro-600 hover:bg-agro-50 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-harvest-500 rounded-full ring-2 ring-white" />
                )}
              </Link>
            )}

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-agro-300 bg-white transition-all text-xs font-semibold text-charcoal-800"
                >
                  <div className="w-7 h-7 rounded-full bg-agro-100 text-agro-700 flex items-center justify-center font-bold">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.full_name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">{user.full_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 bg-agro-50 text-agro-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="py-1 text-xs text-charcoal-700">
                      {/* Portals depending on role */}
                      {['SUPER_ADMIN', 'ADMIN'].includes(user.role) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-agro-50 text-purple-700 font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5" />
                          Admin Console
                        </Link>
                      )}

                      {['FARMER', 'FARMER_STAFF'].includes(user.role) && (
                        <Link
                          to="/farmer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-agro-50 text-emerald-700 font-semibold"
                        >
                          <Sprout className="w-4 h-4 mr-2.5" />
                          Farmer Dashboard
                        </Link>
                      )}

                      {['LOGISTICS_PROVIDER', 'LOGISTICS_STAFF'].includes(user.role) && (
                        <Link
                          to="/logistics"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-agro-50 text-blue-700 font-semibold"
                        >
                          <Truck className="w-4 h-4 mr-2.5" />
                          Logistics Dashboard
                        </Link>
                      )}

                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 mr-2.5 text-gray-400" />
                        My Orders
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 hover:bg-gray-50"
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-gray-400" />
                        Profile Settings
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-agro-700 hover:text-agro-900 px-3 py-2 rounded-lg hover:bg-agro-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-agro-600 hover:bg-agro-700 text-white px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal-700 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farm produce..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-cream-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-cream-100 rounded-xl text-agro-900 flex items-center space-x-2"
            >
              <Package className="w-4 h-4 text-agro-600" />
              <span>Shop All</span>
            </Link>
            <Link
              to="/farms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-cream-100 rounded-xl text-agro-900 flex items-center space-x-2"
            >
              <Sprout className="w-4 h-4 text-agro-600" />
              <span>Verified Farms</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-cream-100 rounded-xl text-agro-900 flex items-center space-x-2"
            >
              <Layers className="w-4 h-4 text-agro-600" />
              <span>Categories</span>
            </Link>
            <Link
              to="/bulk-orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-amber-50 rounded-xl text-amber-900 flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>B2B Bulk RFQ</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs font-semibold text-charcoal-600">
            <Link to="/become-a-farmer" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-agro-700">
              🌱 List Your Farm on AgroDirect
            </Link>
            <Link to="/become-a-logistics-partner" onClick={() => setIsMobileMenuOpen(false)} className="block py-1 text-blue-700">
              🚚 Become a Logistics Fleet Partner
            </Link>
            <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
              How Inter-State Delivery Works
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

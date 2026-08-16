import React, { useState } from 'react';
import { Users, Check, Shield, Truck, Sprout, ShoppingBag, ChevronDown, LogOut } from 'lucide-react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';

export const PersonaSwitcher: React.FC = () => {
  const { user, switchPersona, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSelect = async (key: keyof typeof DEMO_PERSONAS) => {
    setIsSwitching(true);
    try {
      await switchPersona(key);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'FARMER':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'LOGISTICS_PROVIDER':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-harvest-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-agro-900 text-white px-4 py-2.5 rounded-full shadow-modal hover:bg-agro-800 transition-all border border-agro-700/50 backdrop-blur-md group"
          title="Switch Test Persona"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <Users className="w-4 h-4 text-emerald-300" />
          <div className="text-left leading-none text-xs">
            <span className="text-[10px] text-agro-300 block font-normal">Demo Persona:</span>
            <span className="font-semibold">{user ? user.full_name.split(' ')[0] : 'Guest (Browse)'}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-agro-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-agro-100 p-3 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-3 py-2 border-b border-gray-100 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-agro-700 block">
                AgroDirect Role Switcher
              </span>
              <p className="text-gray-400 text-[11px]">Instant 1-click login for any marketplace role</p>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {(Object.keys(DEMO_PERSONAS) as (keyof typeof DEMO_PERSONAS)[]).map((key) => {
                const p = DEMO_PERSONAS[key];
                const isCurrent = user?.email === p.email;

                return (
                  <button
                    key={key}
                    disabled={isSwitching}
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-agro-50 text-agro-900 border border-agro-200 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-gray-100">
                        {getRoleIcon(p.role)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-xs">{p.label}</div>
                        <div className="text-[10px] text-gray-400 flex items-center space-x-1.5">
                          <span>{p.email}</span>
                          <span>•</span>
                          <span className="text-agro-700 font-medium">{p.location}</span>
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-agro-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {user && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout to Guest View</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

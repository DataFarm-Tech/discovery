'use client';

import { FiSettings, FiLayers, FiHome, FiMapPin, FiActivity, FiUser, FiLogOut } from 'react-icons/fi';

interface SidebarProps {
  menuOpen: boolean;
  setMenuOpen: (state: boolean) => void;
}

const Sidebar = ({ menuOpen, setMenuOpen }: SidebarProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 h-full w-[320px] bg-gradient-to-b from-[#0f1525] to-[#0b1320] border-r border-[#00be64]/20 shadow-2xl p-8 flex flex-col rounded-r-2xl transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-start border-b border-white/10 pb-6 px-1">
            <img src="/datafarm-logo-trans.png" alt="DataFarm Logo" className="w-40 h-auto" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              <a 
                href="/dashboard" 
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-[#00be64]/10 transition-all duration-200 group"
              >
                <FiHome size={22} className="group-hover:text-[#00be64] transition-colors" />
                <span className="font-medium text-base">Dashboard</span>
              </a>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/10"></div>

            {/* Bottom Navigation */}
            <div className="space-y-2">
              <a 
                href="/settings" 
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-[#00be64]/10 transition-all duration-200 group"
              >
                <FiSettings size={22} className="group-hover:text-[#00be64] transition-colors" />
                <span className="font-medium text-base">Settings</span>
              </a>

              <a 
                href="/help" 
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-[#00be64]/10 transition-all duration-200 group"
              >
                <FiLayers size={22} className="group-hover:text-[#00be64] transition-colors" />
                <span className="font-medium text-base">Help & Support</span>
              </a>

              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
              >
                <FiLogOut size={22} className="group-hover:text-red-400 transition-colors" />
                <span className="font-medium text-base">Logout</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="bg-[#00be64]/5 border border-[#00be64]/20 rounded-xl p-4">
              <p className="text-xs text-white/60 text-center leading-relaxed">
                DataFarm Technologies Pty Ltd<br />
                <span className="text-[#00be64]">© {new Date().getFullYear()}</span>
              </p>
              <p className="text-[10px] text-white/40 text-center mt-2">
                Version 0.0.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
'use client';

import { FiSettings, FiLayers } from 'react-icons/fi';

interface SidebarProps {
  menuOpen: boolean;
  setMenuOpen: (state: boolean) => void;
}

const Sidebar = ({ menuOpen, setMenuOpen }: SidebarProps) => {
  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ease-in-out"
          style={{ opacity: 1 }} // Ensures the background opacity is animated
          onClick={() => setMenuOpen(false)} // Close the sidebar when clicking outside
        >
          <div
            className={`absolute top-0 left-0 h-full w-[360px] backdrop-blur-lg border-r border-white/20 shadow-lg p-8 flex flex-col justify-between rounded-r-2xl transition-transform duration-500 ease-in-out ${
              menuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ backgroundColor: 'rgba(11, 19, 32, 0.85)' }} // Dark blue background with transparency
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Logo */}
            <div className="mb-6 flex items-center justify-start">
              <img src="./datafarm-logo-trans.png" alt="DataFarm Logo" className="w-46 h-auto" />
            </div>

            {/* Settings and Help at the bottom */}
            <div className="mt-auto">
              <ul className="space-y-6 text-white/90">
                <li className="text-lg">
                  <a href="/settings" className="flex items-center gap-4 hover:text-[#00be64] transition">
                    <FiSettings size={24} />
                    <span>Settings</span>
                  </a>
                </li>
                <li className="mb-6 text-lg">
                  <a href="/help" className="flex items-center gap-4 hover:text-[#00be64] transition">
                    <FiLayers size={24} />
                    <span>Help</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-white/10 text-sm text-white/70 mt-6">
              <p className="text-lg">DataFarm Technologies Pty Ltd © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

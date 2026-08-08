"use client";

import { useState } from "react";
import Navlinks from "@/components/dashboard/Navlinks";
import Signout from "@/components/dashboard/Signout";
import { Menu, X, Building2 } from "lucide-react";

export default function DashboardSidebar({ subdomain, navItems }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Top Mobile Header with Hamburger Toggle */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg uppercase tracking-wider text-indigo-400">
          <Building2 className="w-5 h-5 text-indigo-500" />
          <span>{subdomain}</span>
        </div>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl focus:outline-none transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Top Logo & Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold text-lg uppercase tracking-wider text-indigo-400">
              <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="truncate">{subdomain} Panel</span>
            </div>
            
            {/* Mobile Close Icon inside Sidebar */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item, i) => (
              <div key={i} onClick={() => setIsOpen(false)}>
                <Navlinks item={item} />
              </div>
            ))}
          </nav>
        </div>

        {/*  Signout Button */}
        <div className="pt-6 border-t border-slate-800/80 mt-auto">
          <Signout />
        </div>
      </aside>
    </>
  );
}
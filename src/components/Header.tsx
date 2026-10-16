import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  user: UserProfile | null;
  onSignOut: () => void;
  unreadNotifications?: number;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  user,
  onSignOut,
  unreadNotifications = 1,
  onNotificationClick,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#eaedff]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1280px] mx-auto h-14 px-4 flex items-center justify-between">
        {/* Brand logo & identity */}
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'welcome')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[19px]">auto_graph</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[18px] text-[#131b2e] leading-tight tracking-tight">
                FinAssist <span className="text-[#1d4ed8]">AI</span>
              </span>
            </div>
            <span className="text-[10px] text-[#434655] font-medium leading-none tracking-normal">
              Enterprise Intelligence
            </span>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell */}
              <button
                aria-label="Notifications"
                onClick={onNotificationClick}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#434655] hover:text-[#131b2e] hover:bg-[#eaedff]/60 transition-colors"
                title="1 Unread Anomaly Flag"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#faf8ff]"></span>
                )}
              </button>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
                  aria-label="User Profile Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0037b0] text-white flex items-center justify-center ring-2 ring-[#dce1ff] shadow-sm font-semibold text-[13px]">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'M'}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-3 z-50 text-left">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#eaedff]">
                      <div className="w-9 h-9 rounded-full bg-[#0037b0] text-white flex items-center justify-center font-bold text-sm">
                        {user.fullName ? user.fullName[0].toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-[#131b2e] truncate">{user.fullName}</p>
                        <p className="text-[11px] text-[#434655] truncate">{user.email}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#82f5c1]/30 text-[#005137]">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-[13px] font-medium text-[#131b2e] hover:bg-[#eaedff] rounded flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[17px] text-[#1d4ed8]">grid_view</span>
                        Executive Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('payments');
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-[13px] font-medium text-[#131b2e] hover:bg-[#eaedff] rounded flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[17px] text-[#006c4a]">account_balance_wallet</span>
                        PayPal Sandbox & Billing
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#eaedff]">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[17px]">logout</span>
                        Sign Out of Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('signin')}
                className="h-10 px-4 rounded bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </button>
              <div className="w-8 h-8 rounded-full bg-[#0037b0] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

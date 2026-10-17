import React from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';
import {
  LayoutDashboard,
  Users,
  HandCoins,
  Receipt,
  Package,
  BarChart3,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'shopkeepers' | 'recovery' | 'billing' | 'inventory' | 'reports';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, lang }) => {
  const t = translations[lang];

  const items = [
    {
      id: 'dashboard' as NavTab,
      label: t.dashboard,
      icon: LayoutDashboard,
      activeColor: 'text-blue-600',
      activeBg: 'bg-blue-50',
    },
    {
      id: 'shopkeepers' as NavTab,
      label: lang === 'ur' ? 'کھاتہ' : t.shopkeepers,
      icon: Users,
      activeColor: 'text-indigo-600',
      activeBg: 'bg-indigo-50',
    },
    {
      id: 'recovery' as NavTab,
      label: lang === 'ur' ? 'وصولی' : t.recovery,
      icon: HandCoins,
      isSpecial: true,
    },
    {
      id: 'billing' as NavTab,
      label: lang === 'ur' ? 'بل' : 'Billing',
      icon: Receipt,
      activeColor: 'text-violet-600',
      activeBg: 'bg-violet-50',
    },
    {
      id: 'inventory' as NavTab,
      label: lang === 'ur' ? 'اسٹاک' : t.inventory,
      icon: Package,
      activeColor: 'text-amber-600',
      activeBg: 'bg-amber-50',
    },
    {
      id: 'reports' as NavTab,
      label: lang === 'ur' ? 'رپورٹس' : t.reports,
      icon: BarChart3,
      activeColor: 'text-cyan-600',
      activeBg: 'bg-cyan-50',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl px-2 py-1.5 sm:py-2">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center relative -top-3.5 cursor-pointer group active:scale-90 transition-transform duration-200"
              >
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 ${
                    isActive
                      ? 'btn-vibrant-emerald ring-4 ring-emerald-300 scale-105'
                      : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/40 ring-2 ring-emerald-400/30'
                  }`}
                >
                  <Icon className="h-7 w-7 text-white stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-emerald-800 mt-1 drop-shadow-xs">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? `${item.activeColor} ${item.activeBg} font-black shadow-xs ring-1 ring-black/5`
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'} transition-transform`} />
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

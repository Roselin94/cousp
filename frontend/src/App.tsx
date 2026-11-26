import React, { useState } from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Bell, 
  AlertTriangle, 
  Boxes, 
  Activity,
  Users,
  Building2,
  FileText,
  FlaskConical,
  History,
  LogOut
} from 'lucide-react';
import { DashboardView } from './modules/dashboard/DashboardView';
import { AlertsView } from './modules/alerts/AlertsView';
import { IncidentsView } from './modules/incidents/IncidentsView';
import { CaseRecordsView } from './modules/cases/CaseRecordsView';
import { StocksView } from './modules/stocks/StocksView';
import { SitrepsView } from './modules/sitreps/SitrepsView';
import { LaboratoriesView } from './modules/laboratories/LaboratoriesView';
import { AuditLogsView } from './modules/audit/AuditLogsView';
import { UsersManagementView } from './modules/users/UsersManagementView';
import { FacilitiesAndCitiesView } from './modules/facilities/FacilitiesAndCitiesView';
import { LoginPage } from './modules/auth/LoginPage';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('cousp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'alerts' | 'incidents' | 'cases' | 'sitreps' | 'labs' | 'stocks' | 'users' | 'facilities' | 'audit'
  >('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('cousp_token');
    localStorage.removeItem('cousp_user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord National', icon: LayoutDashboard },
    { id: 'alerts', label: 'Alertes & Notifications', icon: Bell },
    { id: 'incidents', label: 'Incidents & Urgences IMS', icon: AlertTriangle },
    { id: 'cases', label: 'Fiches de Cas & Clinique', icon: Activity },
    { id: 'sitreps', label: 'Bulletins SITREP (Officiels)', icon: FileText },
    { id: 'labs', label: 'Laboratoire & Analyses', icon: FlaskConical },
    { id: 'stocks', label: 'Stocks Stratégiques', icon: Boxes },
  ];

  const adminItems = [
    { id: 'users', label: 'Gestion des Utilisateurs', icon: Users },
    { id: 'facilities', label: 'Centres & Villes', icon: Building2 },
    { id: 'audit', label: "Journal d'Audit Sécurisé", icon: History },
  ];

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-sans text-slate-100 relative overflow-hidden text-xs">
      {/* 1. Ruban Officiel République du Congo (Vert - Jaune - Rouge) */}
      <div className="w-full h-1 flex fixed top-0 left-0 z-50 shadow-md">
        <div className="h-full flex-1 bg-[#009543]"></div>
        <div className="h-full flex-1 bg-[#FBDE4A]"></div>
        <div className="h-full flex-1 bg-[#DC241F]"></div>
      </div>

      {/* 2. Halos d'ambiance sombres */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#009543]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#DC241F]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex pt-1 relative z-10 overflow-hidden h-[calc(100vh-4px)]">
        {/* Barre Latérale Navigation Institutionnelle */}
        <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Logo COUSP officiel */}
            <div className="p-3 border-b border-slate-800/90 flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 p-0.5 rounded-lg bg-gradient-to-tr from-[#009543] via-[#FBDE4A] to-[#DC241F] shadow-md shadow-black/40 shrink-0 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="COUSP Congo Logo" 
                  className="w-full h-full object-cover rounded-[6px] bg-slate-900" 
                />
              </div>
              <div className="overflow-hidden">
                <div className="font-extrabold text-white text-xs tracking-tight flex items-center gap-1.5">
                  COUSP-MIS
                  <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#009543]/20 text-emerald-400 border border-[#009543]/30">
                    Officiel
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Rép. du Congo</div>
              </div>
            </div>

            {/* Statut Veille */}
            <div className="px-3.5 py-2 bg-slate-800/40 border-b border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-300 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009543] animate-pulse"></span>
              <span>Veille Sanitaire Active (24/7)</span>
            </div>

            {/* Liens de Navigation */}
            <nav className="p-2 space-y-0.5 overflow-y-auto flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600/25 text-white border border-[#009543]/60 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FBDE4A]' : 'text-slate-400'}`} />
                    <span className="truncate text-left">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2.5 pb-1 px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Administration
              </div>

              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600/25 text-white border border-[#009543]/60 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FBDE4A]' : 'text-slate-400'}`} />
                    <span className="truncate text-left">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profil & Déconnexion - Toujours visible et très lisible */}
          <div className="p-3 border-t border-slate-700 bg-slate-900/95 shrink-0 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2.5 bg-slate-800/90 p-2 rounded-xl border border-slate-700/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#FBDE4A] font-bold text-xs shrink-0">
                {user.firstName ? user.firstName[0] : 'A'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] font-bold text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[9px] font-medium text-emerald-400 truncate">
                  {user.title || 'Coordinateur Général'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-[11px] font-semibold text-red-300 hover:text-red-200 shadow-sm transition-all active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </aside>

        {/* Contenu Principal */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'incidents' && <IncidentsView />}
            {activeTab === 'cases' && <CaseRecordsView />}
            {activeTab === 'sitreps' && <SitrepsView />}
            {activeTab === 'labs' && <LaboratoriesView />}
            {activeTab === 'stocks' && <StocksView />}
            {activeTab === 'users' && <UsersManagementView />}
            {activeTab === 'facilities' && <FacilitiesAndCitiesView />}
            {activeTab === 'audit' && <AuditLogsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

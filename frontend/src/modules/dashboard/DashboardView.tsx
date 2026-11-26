import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Skull, 
  MapPin, 
  RefreshCw,
  Bell,
  Clock,
  Globe2
} from 'lucide-react';
import { api } from '../../services/api';

export const DashboardView: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, deptRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/departments'),
      ]);
      setKpis(kpiRes.data?.data?.kpis || null);
      setLastUpdated(kpiRes.data?.data?.lastUpdated || new Date().toISOString());
      setDepartments(deptRes.data?.data?.departments || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header & Statut de Synchronisation Institutionnel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 rounded-xl border border-slate-800 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-[10px] font-medium text-emerald-400 mb-1">
            <Globe2 className="w-3 h-3 text-[#FBDE4A]" />
            <span>République du Congo • Surveillance Épidémiologique</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Tableau de Bord National de Surveillance et de Riposte
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Surveillance intégrée en temps réel des 12 départements sanitaires
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Mise à jour : {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('fr-FR') : 'En attente'}</span>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-900 bg-gradient-to-r from-emerald-400 to-[#FBDE4A] hover:brightness-105 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1 : Alertes Sanitaires */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Alertes Sanitaires
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {kpis?.pendingAlerts ?? 0}
            </span>
            <span className="text-[10px] font-semibold text-amber-400">En cours de qualification</span>
          </div>
        </div>

        {/* KPI 2 : Incidents Actifs */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Incidents & Urgences IMS
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {kpis?.activeIncidents ?? 0}
            </span>
            <span className="text-[10px] font-semibold text-red-400">Activations COUSP</span>
          </div>
        </div>

        {/* KPI 3 : Cas Confirmés */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Cas Confirmés
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {kpis?.confirmedCases ?? 0}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              sur {kpis?.totalReportedCases ?? 0} notifiés
            </span>
          </div>
        </div>

        {/* KPI 4 : Taux de Létalité */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Taux de Létalité
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <Skull className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {kpis?.caseFatalityRate ?? '0.0%'}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              ({kpis?.totalDeaths ?? 0} décès)
            </span>
          </div>
        </div>
      </div>

      {/* Situation Opérationnelle des 12 Départements */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800 shadow-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FBDE4A]" />
            Situation Opérationnelle des 12 Départements (Congo)
          </h2>
          <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sous contrôle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Vigilance
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Alerte Critique
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {departments.map((dept) => {
            const isRed = dept.hasCriticalAlert;
            const isAmber = dept.activeIncidentsCount > 0 && !isRed;
            return (
              <div 
                key={dept.id} 
                className={`p-3 rounded-lg border transition-all ${
                  isRed
                    ? 'border-red-500/40 bg-red-950/20 hover:border-red-500/70 shadow-md'
                    : isAmber
                    ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/70 shadow-md'
                    : 'border-slate-800/80 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {dept.name}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    isRed
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : isAmber
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-700/60 border-slate-600/50 text-slate-300'
                  }`}>
                    {dept.code}
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between items-center">
                  <span>Pop: {dept.population ? Number(dept.population).toLocaleString('fr-FR') : 'N/A'}</span>
                  <span className={`font-semibold ${
                    isRed 
                      ? 'text-red-400' 
                      : isAmber 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                  }`}>
                    {isRed ? 'Alerte Critique' : isAmber ? `${dept.activeIncidentsCount} incident(s)` : 'Stable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

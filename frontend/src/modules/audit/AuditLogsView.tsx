import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  Loader2,
  Clock,
  Globe
} from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit');
      setLogs(res.data.data.logs);
    } catch (err) {
      console.error('Erreur journal d audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Piste d'Audit Immuable & Traçabilité Médico-légale
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Journalisation sécurisée de toutes les connexions, déclarations et validations d'urgences
          </p>
        </div>
      </div>

      {/* Tableau d'Audit */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement du journal d'audit...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun enregistrement d'audit pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Action Enregistrée</th>
                  <th className="py-3 px-4">Utilisateur / Auteur</th>
                  <th className="py-3 px-4">Ressource Cible</th>
                  <th className="py-3 px-4">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[10px] ${
                        log.action.includes('AUTH')
                          ? 'bg-blue-50 text-blue-700'
                          : log.action.includes('CREATE')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système Automatisé'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {log.resource}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

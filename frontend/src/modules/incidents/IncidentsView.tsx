import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Building2, 
  Loader2,
  FileCheck2,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';

export const IncidentsView: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents');
      setIncidents(res.data.data.incidents);
    } catch (err) {
      console.error('Erreur chargement incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Centre de Commandement des Incidents IMS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordination tactique des opérations d'urgence de santé publique en République du Congo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des opérations en cours...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
            Aucun incident actif pour le moment.
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {inc.incidentNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">{inc.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Département : <span className="font-medium text-slate-700">{inc.primaryDepartment?.name}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  inc.activationLevel === 'NIVEAU_3_URGENCE_MAJEURE'
                    ? 'bg-red-100 text-red-700'
                    : inc.activationLevel === 'NIVEAU_2_ALERTE'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {inc.activationLevel.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-xs text-slate-400">Cas Suivis</div>
                  <div className="text-base font-bold text-slate-900">{inc._count.caseRecords}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-xs text-slate-400">Missions Terrain</div>
                  <div className="text-base font-bold text-slate-900">{inc._count.operations}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-xs text-slate-400">SITREP Produits</div>
                  <div className="text-base font-bold text-slate-900">{inc._count.sitreps}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Coordinateur : <b>{inc.incidentCommander?.firstName} {inc.incidentCommander?.lastName}</b></span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  ● {inc.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

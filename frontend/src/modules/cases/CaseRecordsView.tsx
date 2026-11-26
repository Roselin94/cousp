import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  FlaskConical, 
  Calendar, 
  Building2, 
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export const CaseRecordsView: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/case-records');
      setCases(res.data.data.caseRecords);
    } catch (err) {
      console.error('Erreur fiches de cas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Fiches Épidémiologiques & Suivi Clinique des Cas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Données de santé pseudonymisées, traçabilité des admissions et confirmation de laboratoire
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des fiches de cas...</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun cas épidémiologique enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Identifiant Cas</th>
                  <th className="py-3 px-4">Pseudonyme</th>
                  <th className="py-3 px-4">Pathologie</th>
                  <th className="py-3 px-4">Âge / Sexe</th>
                  <th className="py-3 px-4">Formation Sanitaire</th>
                  <th className="py-3 px-4 text-center">Classification</th>
                  <th className="py-3 px-4 text-center">Statut Clinique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">
                      {c.caseIdentifier}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      {c.patientPseudonym}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.disease?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.ageYears} ans ({c.gender})
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{c.healthFacility?.name}</div>
                      <div className="text-[11px] text-slate-400">{c.residenceDepartment} - {c.residenceDistrict}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        c.classification === 'CONFIRME'
                          ? 'bg-blue-100 text-blue-800'
                          : c.classification === 'PROBABLE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.outcome === 'GUERI'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.outcome === 'DECEDE'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.outcome}
                      </span>
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

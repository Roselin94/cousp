import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ThermometerSnowflake, 
  Building2, 
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const LaboratoriesView: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    testMethod: 'RT-PCR en Temps Réel',
    pathogenDetected: 'Monkeypox Virus (Clade I)',
    resultStatus: 'POSITIF',
    ctValue: 21.4,
    analyzedBy: 'Laboratoire National de Santé Publique (LNSP Brazzaville)',
    validatedBy: 'Dr. Biologiste Médical Référent',
  });

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/laboratories/requests');
      setRequests(res.data.data.requests);
    } catch (err) {
      console.error('Erreur laboratoire:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabData();
  }, []);

  const handleValidateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    try {
      setSubmitting(true);
      await api.post('/laboratories/results', {
        labRequestId: selectedReq.id,
        ...form,
        ctValue: Number(form.ctValue),
      });
      setIsModalOpen(false);
      setSelectedReq(null);
      await fetchLabData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la validation du résultat');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            Laboratoires, Analyses & Confirmation Biologique
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des prélèvements, chaîne de froid, tests PCR / TDR et validation médicale des résultats
          </p>
        </div>
      </div>

      {/* Tableau des Prélèvements */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des prélèvements biologiques...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun échantillon de laboratoire en attente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Code Prélèvement</th>
                  <th className="py-3 px-4">Patient / Pathologie</th>
                  <th className="py-3 px-4">Nature Échantillon</th>
                  <th className="py-3 px-4 text-center">Chaîne de Froid</th>
                  <th className="py-3 px-4 text-center">Résultat d'Analyse</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">
                      {r.requestNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{r.caseRecord?.patientPseudonym}</div>
                      <div className="text-[11px] font-semibold text-slate-500">{r.caseRecord?.disease?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {r.sampleType}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <ThermometerSnowflake className="w-3.5 h-3.5" />
                        Maintenue
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.labResult ? (
                        <div className="font-bold">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] ${
                            r.labResult.resultStatus === 'POSITIF'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {r.labResult.resultStatus}
                          </span>
                          {r.labResult.ctValue && (
                            <div className="text-[10px] font-mono text-slate-400 font-normal">
                              Ct: {r.labResult.ctValue}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">En attente d'analyse</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'VALIDE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!r.labResult && (
                        <button
                          onClick={() => {
                            setSelectedReq(r);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-[11px] shadow-sm transition-colors"
                        >
                          Saisir Résultat
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Saisie Résultat Laboratoire */}
      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                Validation du Résultat de Laboratoire ({selectedReq.requestNumber})
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleValidateResult} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Méthode de Test *</label>
                  <input
                    type="text"
                    required
                    value={form.testMethod}
                    onChange={(e) => setForm({ ...form, testMethod: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Résultat Biologique *</label>
                  <select
                    value={form.resultStatus}
                    onChange={(e) => setForm({ ...form, resultStatus: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="POSITIF">Positif (Pathogène Détecté)</option>
                    <option value="NEGATIF">Négatif (Non Détecté)</option>
                    <option value="INDETERMINE">Indéterminé (À re-tester)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pathogène Identifié</label>
                  <input
                    type="text"
                    value={form.pathogenDetected}
                    onChange={(e) => setForm({ ...form, pathogenDetected: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valeur Cycle Threshold (Ct)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.ctValue}
                    onChange={(e) => setForm({ ...form, ctValue: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratoire d'Analyse *</label>
                <input
                  type="text"
                  required
                  value={form.analyzedBy}
                  onChange={(e) => setForm({ ...form, analyzedBy: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biologiste Valideur *</label>
                <input
                  type="text"
                  required
                  value={form.validatedBy}
                  onChange={(e) => setForm({ ...form, validatedBy: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Valider le Résultat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

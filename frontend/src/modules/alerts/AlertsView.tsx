import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Filter, 
  Loader2,
  Calendar,
  Building,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal Déclaration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    diseaseId: '',
    healthFacilityId: '',
    reporterName: '',
    reporterContact: '',
    reporterType: 'AGENT_SANTE',
    suspectedCases: 1,
    suspectedDeaths: 0,
    description: '',
    severity: 'MODEREE',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, diseasesRes, facilitiesRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/diseases'),
        api.get('/facilities'),
      ]);
      setAlerts(alertsRes.data.data.alerts);
      setDiseases(diseasesRes.data.data.diseases);
      setFacilities(facilitiesRes.data.data.facilities);
      if (diseasesRes.data.data.diseases.length > 0) {
        setForm((prev) => ({ ...prev, diseaseId: diseasesRes.data.data.diseases[0].id }));
      }
      if (facilitiesRes.data.data.facilities.length > 0) {
        setForm((prev) => ({ ...prev, healthFacilityId: facilitiesRes.data.data.facilities[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement alertes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/alerts', {
        ...form,
        suspectedCases: Number(form.suspectedCases),
        suspectedDeaths: Number(form.suspectedDeaths),
      });
      setIsModalOpen(false);
      setForm({
        diseaseId: diseases[0]?.id || '',
        healthFacilityId: facilities[0]?.id || '',
        reporterName: '',
        reporterContact: '',
        reporterType: 'AGENT_SANTE',
        suspectedCases: 1,
        suspectedDeaths: 0,
        description: '',
        severity: 'MODEREE',
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l enregistrement de l alerte');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id: string, createIncident: boolean) => {
    try {
      setSubmitting(true);
      await api.patch(`/alerts/${id}/validate`, {
        createIncident,
        activationLevel: 'NIVEAU_1_VIGILANCE',
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Veuillez spécifier le motif formel du rejet de cette alerte :');
    if (!reason) return;
    try {
      setSubmitting(true);
      await api.patch(`/alerts/${id}/reject`, { rejectionReason: reason });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Registre National des Alertes Sanitaires
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance intégrée, qualification épidémiologique et escalade COUSP
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Alerte Sanitaire
        </button>
      </div>

      {/* Barre de Filtres */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filtres :
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Toutes Sévérités</option>
          <option value="CRITIQUE">Critique</option>
          <option value="ELEVEE">Élevée</option>
          <option value="MODEREE">Modérée</option>
          <option value="FAIBLE">Faible</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Tous Statuts</option>
          <option value="RECUE">Reçue (En attente)</option>
          <option value="VALIDEE">Validée</option>
          <option value="REJETEE">Rejetée</option>
        </select>

        <span className="text-slate-400 ml-auto">
          {filteredAlerts.length} alerte(s) affichée(s)
        </span>
      </div>

      {/* Tableau des Alertes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des alertes sanitaires...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucune alerte sanitaire correspondant aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Pathologie</th>
                  <th className="py-3 px-4">Formation Sanitaire</th>
                  <th className="py-3 px-4 text-center">Cas / Décès</th>
                  <th className="py-3 px-4 text-center">Sévérité</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">
                      {al.alertNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {al.disease?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{al.healthFacility?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {al.healthFacility?.healthArea?.healthZone?.department?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="text-slate-800">{al.suspectedCases}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-red-600">{al.suspectedDeaths}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        al.severity === 'CRITIQUE'
                          ? 'bg-red-100 text-red-700'
                          : al.severity === 'ELEVEE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {al.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        al.status === 'VALIDEE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : al.status === 'REJETEE'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {al.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {al.status === 'RECUE' && (
                        <>
                          <button
                            onClick={() => handleValidate(al.id, true)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-[11px] shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valider & Riposte
                          </button>
                          <button
                            onClick={() => handleReject(al.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            Rejeter
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulaire de Déclaration d'Alerte */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Déclaration d'une Nouvelle Alerte Sanitaire
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pathologie Sous Surveillance *
                  </label>
                  <select
                    required
                    value={form.diseaseId}
                    onChange={(e) => setForm({ ...form, diseaseId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {diseases.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Formation Sanitaire Déclarante *
                  </label>
                  <select
                    required
                    value={form.healthFacilityId}
                    onChange={(e) => setForm({ ...form, healthFacilityId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cas Suspects *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.suspectedCases}
                    onChange={(e) => setForm({ ...form, suspectedCases: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Décès Suspects
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.suspectedDeaths}
                    onChange={(e) => setForm({ ...form, suspectedDeaths: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Niveau de Sévérité *
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="FAIBLE">Faible</option>
                    <option value="MODEREE">Modérée</option>
                    <option value="ELEVEE">Élevée</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Titre du Déclarant *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dr. Moukoko"
                    value={form.reporterName}
                    onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone de Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+242 06..."
                    value={form.reporterContact}
                    onChange={(e) => setForm({ ...form, reporterContact: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description Clinique et Contexte Épidémiologique *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrire les signes cliniques, antécédents, notion de contact ou flambée communautaire..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                ></textarea>
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
                  Enregistrer l'Alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

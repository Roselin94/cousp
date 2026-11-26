import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Building2, 
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const SitrepsView: React.FC = () => {
  const [sitreps, setSitreps] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSitrep, setSelectedSitrep] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    incidentId: '',
    responseSummary: '',
    recommendations: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sitRes, incRes] = await Promise.all([
        api.get('/sitreps'),
        api.get('/incidents'),
      ]);
      setSitreps(sitRes.data.data.sitreps);
      setIncidents(incRes.data.data.incidents);
      if (incRes.data.data.incidents.length > 0) {
        setForm((prev) => ({ ...prev, incidentId: incRes.data.data.incidents[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement SITREP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateSitrep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await api.post('/sitreps/generate', form);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la génération du SITREP');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Rapports de Situation Épidémiologique Officiels (SITREP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidation périodique normalisée OMS / IMS pour les autorités de la République du Congo et partenaires
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Générer un Nouveau SITREP
        </button>
      </div>

      {/* Liste des SITREP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des rapports officiels...</span>
          </div>
        ) : sitreps.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
            Aucun rapport de situation SITREP généré pour le moment.
          </div>
        ) : (
          sitreps.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {s.sitrepNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ● {s.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{s.incident?.title}</h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {s.incident?.primaryDepartment?.name || 'République du Congo'}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Cas Cumulés</div>
                    <div className="text-base font-bold text-slate-900">{s.totalCases}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Décès Cumulés</div>
                    <div className="text-base font-bold text-red-600">{s.totalDeaths}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <button
                  onClick={() => setSelectedSitrep(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Consulter & Imprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vue Détaillée Document SITREP pour Impression / PDF */}
      {selectedSitrep && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 print:border-black">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                RÉPUBLIQUE DU CONGO • MINISTÈRE DE LA SANTÉ ET DE LA POPULATION
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                BULLETIN DE SITUATION ÉPIDÉMIOLOGIQUE (SITREP) N° {selectedSitrep.sitrepNumber}
              </h2>
              <div className="text-sm font-semibold text-blue-700 mt-0.5">
                Urgence : {selectedSitrep.incident?.title}
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimer / Exporter PDF
              </button>
              <button
                onClick={() => setSelectedSitrep(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 py-3 bg-slate-50 rounded-2xl p-4 text-center">
            <div>
              <div className="text-xs text-slate-500 font-semibold">Période Couverte</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">7 derniers jours</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Total Cas Notifiés</div>
              <div className="text-xl font-black text-blue-700 mt-0.5">{selectedSitrep.totalCases}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Total Décès</div>
              <div className="text-xl font-black text-red-600 mt-0.5">{selectedSitrep.totalDeaths}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Statut Document</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">APPROUVÉ COUSP</div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-1">
                1. Faits Marquants & Synthèse Opérationnelle
              </h4>
              <p className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {selectedSitrep.responseSummary}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-1">
                2. Goulots d'Étranglement & Besoins Logistiques
              </h4>
              <p className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {selectedSitrep.gapsAndChallenges || 'Pré-positionnement des kits de prélèvement et approvisionnement continu de la chaîne de froid.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-1">
                3. Directives & Recommandations du Centre de Commandement
              </h4>
              <p className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {selectedSitrep.recommendations}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-500">
            <div>
              <div>Rapport préparé par : <b>{selectedSitrep.preparedBy}</b></div>
              <div>Approbation : <b>{selectedSitrep.approvedBy}</b></div>
            </div>
            <div className="text-right">
              <div>Centre des Opérations d'Urgence de Santé Publique (COUSP)</div>
              <div>Brazzaville, République du Congo</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Génération SITREP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Compilation Automatique d'un SITREP
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSitrep} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Sanitaire Cible *</label>
                <select
                  required
                  value={form.incidentId}
                  onChange={(e) => setForm({ ...form, incidentId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>{inc.incidentNumber} - {inc.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Synthèse des Opérations de Riposte</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrire les activités de terrain menées (isolement, enquêtes épidémiologiques, prise en charge)..."
                  value={form.responseSummary}
                  onChange={(e) => setForm({ ...form, responseSummary: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recommandations Stratégiques</label>
                <textarea
                  rows={2}
                  placeholder="Directives pour les équipes départementales et dotations en intrants..."
                  value={form.recommendations}
                  onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
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
                  disabled={generating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {generating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Compiler le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

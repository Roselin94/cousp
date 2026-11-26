import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  X,
  Hospital,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';

export const FacilitiesAndCitiesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'facilities' | 'zones'>('facilities');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire Formation Sanitaire (Centre)
  const [facForm, setFacForm] = useState({
    name: '',
    code: '',
    type: 'CENTRE_SANTE_INTEGRE',
    level: 1,
    contactPhone: '',
    healthAreaId: '',
    latitude: -4.26,
    longitude: 15.24,
  });

  // Formulaire Ville / District Sanitaire
  const [zoneForm, setZoneForm] = useState({
    departmentId: '',
    name: '',
    code: '',
    headquarter: '',
    population: 50000,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facRes, zoneRes, deptRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/geography/health-zones'),
        api.get('/geography/departments'),
      ]);
      setFacilities(facRes.data.data.facilities);
      setZones(zoneRes.data.data.zones);
      setDepartments(deptRes.data.data.departments);
      if (deptRes.data.data.departments.length > 0) {
        setZoneForm((prev) => ({ ...prev, departmentId: deptRes.data.data.departments[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement centres et villes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Trouver une aire de santé disponible par défaut
      const defaultAreaId = facilities[0]?.healthAreaId || 'ha-chu';
      await api.post('/facilities', {
        ...facForm,
        healthAreaId: facForm.healthAreaId || defaultAreaId,
        level: Number(facForm.level),
      });
      setIsFacilityModalOpen(false);
      setFacForm({
        name: '',
        code: '',
        type: 'CENTRE_SANTE_INTEGRE',
        level: 1,
        contactPhone: '',
        healthAreaId: '',
        latitude: -4.26,
        longitude: 15.24,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création du centre sanitaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/geography/health-zones', {
        ...zoneForm,
        population: Number(zoneForm.population),
      });
      setIsZoneModalOpen(false);
      setZoneForm({
        departmentId: departments[0]?.id || '',
        name: '',
        code: '',
        headquarter: '',
        population: 50000,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la zone/ville');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFacility = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement la structure sanitaire ${name} ?`)) return;
    try {
      await api.delete(`/facilities/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur suppression');
    }
  };

  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`Supprimer le district sanitaire ${name} ?`)) return;
    try {
      await api.delete(`/geography/health-zones/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Référentiels Sanitaires : Centres Hospitaliers & Villes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cartographie des formations sanitaires (FOSA) et découpage des districts sanitaires congolais
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'facilities' ? (
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau Centre Sanitaire
            </button>
          ) : (
            <button
              onClick={() => setIsZoneModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau District / Ville
            </button>
          )}
        </div>
      </div>

      {/* Onglets de sous-navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('facilities')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeSubTab === 'facilities'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Formations Sanitaires & Hôpitaux ({facilities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('zones')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeSubTab === 'zones'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Districts Sanitaires & Villes ({zones.length})
        </button>
      </div>

      {/* VUE 1 : CENTRES ET FORMATIONS SANITAIRES */}
      {activeSubTab === 'facilities' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Chargement des structures sanitaires...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Code / Nom Structure</th>
                    <th className="py-3 px-4">Type de FOSA</th>
                    <th className="py-3 px-4">Localisation & Département</th>
                    <th className="py-3 px-4">Téléphone Contact</th>
                    <th className="py-3 px-4 text-center">Niveau</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilities.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{f.name}</div>
                        <div className="text-[11px] font-mono text-blue-700">{f.code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {f.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {f.healthArea?.healthZone?.department?.name || 'Congo'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {f.healthArea?.healthZone?.name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {f.contactPhone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 text-[10px]">
                          Niveau {f.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteFacility(f.id, f.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer la structure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VUE 2 : DISTRICTS SANITAIRES ET VILLES */}
      {activeSubTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Chargement des districts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">District Sanitaire</th>
                    <th className="py-3 px-4">Chef-lieu / Ville</th>
                    <th className="py-3 px-4">Département de Rattachement</th>
                    <th className="py-3 px-4 text-center">Population Couverte</th>
                    <th className="py-3 px-4 text-center">Aires Sanitaires</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zones.map((z) => (
                    <tr key={z.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{z.name}</div>
                        <div className="text-[11px] font-mono text-blue-700">{z.code}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {z.headquarter}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{z.department?.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({z.department?.code})</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {z.population.toLocaleString('fr-FR')} hab.
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-blue-700">
                        {z._count?.healthAreas || 0} aire(s)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteZone(z.id, z.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer le district"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Création Centre Sanitaire */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Hospital className="w-5 h-5 text-blue-600" />
                Ajouter une Formation Sanitaire (FOSA)
              </h2>
              <button onClick={() => setIsFacilityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'Établissement *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Centre de Santé Intégré de Moungali"
                  value={facForm.name}
                  onChange={(e) => setFacForm({ ...facForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code FOSA *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: FOSA-MGL-01"
                    value={facForm.code}
                    onChange={(e) => setFacForm({ ...facForm, code: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type d'Établissement *</label>
                  <select
                    value={facForm.type}
                    onChange={(e) => setFacForm({ ...facForm, type: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="HOPITAL_GENERAL">Hôpital Général</option>
                    <option value="HOPITAL_REFERENCE">Hôpital de Référence / Base</option>
                    <option value="CENTRE_SANTE_INTEGRE">Centre de Santé Intégré (CSI)</option>
                    <option value="POSTE_SANTE">Poste de Santé</option>
                    <option value="LABORATOIRE_NATIONAL">Laboratoire National</option>
                    <option value="CENTRE_TRAITEMENT_EPIDEMIQUE">Centre Traitement Épidémique (CTE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Niveau Hiérarchique</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={facForm.level}
                    onChange={(e) => setFacForm({ ...facForm, level: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone d'Urgence</label>
                  <input
                    type="text"
                    placeholder="+242 06..."
                    value={facForm.contactPhone}
                    onChange={(e) => setFacForm({ ...facForm, contactPhone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(false)}
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création District Sanitaire / Ville */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Ajouter un District Sanitaire / Ville
              </h2>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Département de Rattachement *</label>
                <select
                  required
                  value={zoneForm.departmentId}
                  onChange={(e) => setZoneForm({ ...zoneForm, departmentId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du District *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: District Sanitaire Dolisie"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code District *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: HZ-NIA-DOL"
                    value={zoneForm.code}
                    onChange={(e) => setZoneForm({ ...zoneForm, code: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chef-lieu / Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dolisie"
                    value={zoneForm.headquarter}
                    onChange={(e) => setZoneForm({ ...zoneForm, headquarter: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Population Couverte</label>
                  <input
                    type="number"
                    min="1000"
                    value={zoneForm.population}
                    onChange={(e) => setZoneForm({ ...zoneForm, population: parseInt(e.target.value, 10) || 50000 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
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
                  Créer le District
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Loader2,
  X,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    title: '',
    organization: 'Ministère de la Santé et de la Population',
    roleSlug: 'EPIDEMIOLOGIST',
    departmentId: '',
    isNational: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/geography/departments'),
      ]);
      setUsers(usersRes.data.data.users);
      setDepartments(deptsRes.data.data.departments);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/users', form);
      setIsModalOpen(false);
      setForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        title: '',
        organization: 'Ministère de la Santé et de la Population',
        roleSlug: 'EPIDEMIOLOGIST',
        departmentId: '',
        isNational: true,
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création de l utilisateur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression du compte de ${name} ?`)) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            Administration des Utilisateurs & Habilitations IAM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des comptes, profils de rôles et restrictions territoriales départementales
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Utilisateur
        </button>
      </div>

      {/* Tableau des Utilisateurs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement des utilisateurs...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun utilisateur enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Contact & Organisation</th>
                  <th className="py-3 px-4 text-center">Rôle Attribué</th>
                  <th className="py-3 px-4 text-center">Périmètre Territorial</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const role = u.userRoles[0]?.role;
                  const scope = u.scopes[0];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold">{u.firstName} {u.lastName}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{u.title || 'Agent Sanitaire'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {u.organization} {u.phone ? `• ${u.phone}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {role?.name || 'Utilisateur'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">
                        {scope?.isNational ? (
                          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                            National (12 départements)
                          </span>
                        ) : scope?.department ? (
                          <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {scope.department.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Non spécifié</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Création d'un Nouveau Compte Utilisateur
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Institutionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="agent@sante.gouv.cg"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de Passe *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre / Fonction</label>
                  <input
                    type="text"
                    placeholder="ex: Médecin Épidémiologiste"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+242 06..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle Système *</label>
                  <select
                    value={form.roleSlug}
                    onChange={(e) => setForm({ ...form, roleSlug: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="EPIDEMIOLOGIST">Épidémiologiste</option>
                    <option value="FIELD_AGENT">Point Focal Départemental</option>
                    <option value="LAB_TECH">Biologiste Laboratoire</option>
                    <option value="LOGISTICIAN">Gestionnaire Logistique</option>
                    <option value="COUSP_DIRECTOR">Directeur COUSP</option>
                    <option value="SUPER_ADMIN">Super Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Périmètre Départemental</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ 
                      ...form, 
                      departmentId: e.target.value,
                      isNational: e.target.value === '' 
                    })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="">National (Tous les 12 départements)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
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
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Globe2
} from 'lucide-react';
import { api } from '../../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin.cousp@sante.gouv.cg');
  const [password, setPassword] = useState('CouspCongo2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;
      localStorage.setItem('cousp_token', tokens.accessToken);
      localStorage.setItem('cousp_user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Identifiants incorrects ou serveur indisponible.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans text-slate-100">
      {/* 1. Ruban Officiel République du Congo (Vert - Jaune - Rouge) discret et élégant en haut */}
      <div className="w-full h-2 flex fixed top-0 left-0 z-50 shadow-md">
        <div className="h-full flex-1 bg-[#009543]"></div>
        <div className="h-full flex-1 bg-[#FBDE4A]"></div>
        <div className="h-full flex-1 bg-[#DC241F]"></div>
      </div>

      {/* 2. Halos d'ambiance sombres très discrets */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#009543]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#DC241F]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* 3. Header Supérieur Institutionnel */}
      <header className="pt-8 px-6 sm:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          {/* Logo officiel avec liseré subtil aux couleurs du drapeau */}
          <div className="w-12 h-12 p-0.5 rounded-2xl bg-gradient-to-tr from-[#009543] via-[#FBDE4A] to-[#DC241F] shadow-lg shadow-black/40 overflow-hidden shrink-0">
            <img 
              src="/logo.png" 
              alt="COUSP République du Congo" 
              className="w-full h-full object-cover rounded-[14px] bg-slate-900" 
            />
          </div>
          <div>
            <div className="text-white font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
              COUSP-MIS
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#009543]/20 text-emerald-400 border border-[#009543]/30">
                Portail National
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              République du Congo • Ministère de la Santé et de la Population
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#009543] animate-pulse"></span>
          <span>Veille Sanitaire Active (24/7)</span>
        </div>
      </header>

      {/* 4. Corps Principal : Présentation & Carte de Connexion */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Colonne Gauche : Présentation du Mandat Républicain */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-[#FBDE4A]" />
              <span>Surveillance des 12 Départements</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Centre des Opérations d'Urgence de <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400">
                Santé Publique
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
              Système unifié pour la détection précoce, la gestion tactique des incidents épidémiologiques et la logistique d'intervention rapide.
            </p>

            {/* Badges Territoires & Norme */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Territoires</div>
                <div className="text-sm font-bold text-white mt-0.5">12 Départements</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Surveillance</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">SIMR Congo</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Doctrine</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">Cadre IMS</div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Formulaire d'Authentification */}
          <div className="lg:col-span-6">
            <div className="bg-slate-800/80 backdrop-blur-md p-7 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
              {/* Liseré supérieur aux couleurs nationales */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#009543] via-[#FBDE4A] to-[#DC241F]"></div>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Authentification Sécurisée
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Accès restreint aux autorités sanitaires habilitées
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Identifiant Professionnel (Email)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009543] focus:border-transparent transition-all"
                      placeholder="nom@sante.gouv.cg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Mot de Passe Sécurisé
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#009543] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#009543] to-[#007032] hover:from-[#00a84c] hover:to-[#00853c] shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Accéder au Centre des Opérations
                        <ArrowRight className="w-4 h-4 text-[#FBDE4A]" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-500">
                  Accès strictement réservé aux agents habilités du COUSP.
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 5. Footer Institutionnel */}
      <footer className="py-4 px-6 text-center text-[11px] text-slate-500 border-t border-slate-800 bg-slate-950/80 z-10">
        <div>
          © 2026 Ministère de la Santé et de la Population — République du Congo (COUSP-MIS).
        </div>
      </footer>
    </div>
  );
};

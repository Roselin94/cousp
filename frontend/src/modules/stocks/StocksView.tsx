import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Building2, 
  Loader2,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';

export const StocksView: React.FC = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stocks');
      setStockItems(res.data.data.stockItems);
    } catch (err) {
      console.error('Erreur chargement stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Gestion des Stocks Stratégiques & Produits d'Urgence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des dotations en réactifs, vaccins, EPI et médicaments d'urgence dans les structures sanitaires
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement de l'inventaire logistique...</span>
          </div>
        ) : stockItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucun article en stock inventorié.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Produit / Code</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Formation Sanitaire</th>
                  <th className="py-3 px-4">Numéro de Lot</th>
                  <th className="py-3 px-4">Péremption</th>
                  <th className="py-3 px-4 text-center">Disponible</th>
                  <th className="py-3 px-4 text-center">Réservé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockItems.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{st.product?.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{st.product?.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {st.product?.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {st.healthFacility?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {st.batchNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(st.expiryDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                      {st.quantityAvailable} {st.product?.unitOfMeasure}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                      {st.quantityReserved}
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

# Contrat d'Interface API REST v1 (OpenAPI / Swagger)
**COUSP-MIS – République du Congo**
**Base URL** : `http://localhost:5000/api/v1`

---

## 1. Sécurité et Headers
- **Format** : `application/json`
- **Authentification** : `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Refresh Token** : Transmis par Cookie HTTP-Only sécurisé ou Payload `/auth/refresh`
- **Rate Limiting** : 100 requêtes / 15 minutes par IP en production

---

## 2. Inventaire Détaillé des Endpoints /api/v1

### 2.1 Authentification & Profil (`/auth`)
- `POST /auth/login` : Authentification utilisateur (email, mot de passe). Renvoie access token JWT et refresh token.
- `POST /auth/refresh` : Renouvellement du token JWT d'accès.
- `POST /auth/logout` : Révocation de session et invalidation du token.
- `GET /auth/me` : Profil de l'utilisateur connecté, rôles, permissions et périmètre territorial (département / national).

### 2.2 Géographie & Formations Sanitaires (`/geography`, `/facilities`)
- `GET /departments` : Liste des 12 départements de la République du Congo avec indicateurs.
- `GET /departments/:id/health-zones` : Districts sanitaires rattachés à un département.
- `GET /health-zones/:id/facilities` : Formations sanitaires (FOSA) d'une zone.
- `GET /facilities` : Liste filtrable des hôpitaux, CSI et laboratoires avec coordonnées géographiques.
- `POST /facilities` : Ajout d'une nouvelle structure sanitaire (Admin).

### 2.3 Surveillance & Alertes Sanitaires (`/diseases`, `/alerts`)
- `GET /diseases` : Référentiel des pathologies sous surveillance SIMR (Ebola, Mpox, Choléra, etc.).
- `GET /alerts` : Liste paginée des alertes avec filtres (statut, sévérité, département, maladie).
- `POST /alerts` : Déclaration d'une alerte sanitaire (génère code `ALT-YYYYMMDD-XXXX`).
- `GET /alerts/:id` : Détails d'une alerte et historique de traitement.
- `PATCH /alerts/:id/validate` : Validation officielle de l'alerte par le responsable épidémiologique.
- `PATCH /alerts/:id/reject` : Rejet motivé de l'alerte.

### 2.4 Incidents COUSP & IMS (`/incidents`)
- `GET /incidents` : Liste des incidents et urgences actives (avec filtres de niveau 1, 2, 3).
- `POST /incidents` : Déclaration d'un incident (souvent escaladé d'une alerte validée), désignation du coordinateur d'incident.
- `GET /incidents/:id` : Tableau de bord tactique d'un incident spécifique.
- `PATCH /incidents/:id/level` : Changement du niveau d'activation IMS (Niveau 1, 2, 3).
- `PATCH /incidents/:id/close` : Clôture formelle de l'incident avec synthèse finale.

### 2.5 Opérations, Équipes & Tâches (`/operations`, `/teams`, `/tasks`)
- `GET /incidents/:id/operations` : Liste des opérations de riposte rattachées à un incident.
- `POST /operations` : Création d'une opération d'intervention ou d'investigation.
- `POST /teams` : Constitution d'une équipe d'intervention rapide (RRT).
- `POST /tasks` : Création et assignation d'une tâche opérationnelle avec date d'échéance.
- `PATCH /tasks/:id/status` : Mise à jour du statut d'une tâche (À faire -> En cours -> Terminé).

### 2.6 Cas Sanitaires & Laboratoires (`/case-records`, `/laboratories`)
- `GET /case-records` : Liste paginée des fiches épidémiologiques (données pseudonymisées).
- `POST /case-records` : Enregistrement d'un cas suspect ou confirmé.
- `GET /case-records/:id` : Dossier épidémiologique complet.
- `POST /lab-requests` : Prescription d'un prélèvement et envoi au laboratoire.
- `POST /lab-results` : Enregistrement et validation des résultats d'analyses biologiques.

### 2.7 Logistique & Stocks d'Urgence (`/stocks`)
- `GET /stocks` : État des stocks par structure sanitaire et type de produit (EPI, tests, médicaments).
- `POST /stocks/movements` : Transaction de mouvement de stock (Entrée, Transfert, Sortie d'urgence). Vérification atomique de disponibilité.
- `GET /stocks/alerts` : Alertes de rupture de stock imminente ou péremption.

### 2.8 Partenaires & Contributions Financières (`/partners`)
- `GET /partners` : Liste des partenaires techniques et financiers (OMS, UNICEF, CDC, Banque Mondiale).
- `POST /partners/contributions` : Enregistrement d'un apport financier ou matériel chiffré en FCFA (XAF).

### 2.9 SITREP & Rapports de Situation (`/sitreps`)
- `GET /sitreps` : Liste des rapports de situation épidémiologique.
- `POST /sitreps/generate` : Compilation automatique des indicateurs pour une période donnée.
- `PATCH /sitreps/:id/approve` : Validation officielle et publication du SITREP par le coordinateur.
- `GET /sitreps/:id/export-pdf` : Export normalisé du document SITREP pour les autorités.

### 2.10 Dashboard & Statistiques Nationales (`/dashboard`)
- `GET /dashboard/kpis` : Indicateurs clés consolidés (alertes actives, cas totaux, lits occupés, taux de létalité, missions en cours).
- `GET /dashboard/epicurve` : Courbe épidémiologique journalière/hebdomadaire par pathologie.
- `GET /dashboard/map-distribution` : Agrégation géographique par département pour la cartographie SIG.
- `GET /dashboard/logistics-overview` : Disponibilité nationale des stocks stratégiques.


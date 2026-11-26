# COUSP-MIS : Plateforme Nationale de Gestion des Urgences de Santé Publique
**République du Congo – Ministère de la Santé et de la Population**

COUSP-MIS (*Centre des Opérations d'Urgence de Santé Publique – Management Information System*) est la plateforme institutionnelle souveraine dédiée à la détection précoce, à la notification des alertes, à la coordination opérationnelle de crise (IMS), à la surveillance épidémiologique et au suivi logistique sur l'ensemble des 12 départements de la République du Congo.

---

## 1. Architecture et Stack Technique

- **Backend** : Node.js (v22), Express, TypeScript, Prisma ORM, architecture monolithe modulaire.
- **Base de Données** : PostgreSQL 16 avec extension spatiale PostGIS (WGS 84).
- **Sécurité** : Chiffrement des mots de passe avec **Argon2id**, authentification par jetons **JWT** à courte durée de vie et refresh tokens, contrôle d'accès granulaire **RBAC** et **restriction territoriale (ABAC)**.
- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, support PWA hors connexion.
- **Infrastructure & Asynchrone** : Redis 7, BullMQ, MinIO (S3-compatible), Docker Compose.

---

## 2. Structure du Dépôt

```
COUSP/
├── backend/                  # Monolithe modulaire Express / TypeScript
│   ├── prisma/               # Schéma Prisma et migrations relationnelles
│   ├── src/
│   │   ├── config/           # Configuration d'environnement avec validation Zod
│   │   ├── common/           # Middlewares (AuthGuard, RBAC, RateLimit, ErrorHandler)
│   │   ├── database/         # Client Prisma et scripts de seed territoriaux
│   │   ├── modules/          # Modules métier autonomes (auth, alerts, dashboard, etc.)
│   │   └── server.ts         # Point d'entrée de l'API REST v1
│   └── tests/                # Tests unitaires et d'intégration (Vitest)
├── frontend/                 # Application monopage React / TypeScript / Vite
│   ├── src/
│   │   ├── components/       # Composants d'interface institutionnels
│   │   ├── modules/          # Vues métier (Dashboard, Alertes, Auth)
│   │   └── services/         # Client API Axios avec intercepteurs sécurisés
│   └── index.html
├── infrastructure/           # Conteneurs et orchestration
│   └── docker/               # docker-compose.yml (Postgres+PostGIS, Redis, MinIO)
└── documentation/            # Dossiers d'architecture, base de données et API
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    └── API.md
```

---

## 3. Démarrage Rapide en Local

### 3.1 Démarrage des Services d'Infrastructure
```bash
cd infrastructure/docker
docker compose up -d
```

### 3.2 Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
*Le serveur backend démarre sur `http://localhost:5000`.*

### 3.3 Frontend
```bash
cd frontend
npm install
npm run dev
```
*L'application frontend est accessible sur `http://localhost:5173`.*

---

## 4. Tests et Assurance Qualité

Exécuter la suite de tests automatisés (sécurité cryptographique, authentification, tokens) :
```bash
cd backend
npm run test
```


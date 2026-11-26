import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cousp_jwt_secret_dev_2026';

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Middlewares d'authentification
const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Token expiré ou invalide' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authentification requise' });
  }
};

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'COUSP-MIS Backend API', timestamp: new Date() });
});

// --- AUTHENTIFICATION ---
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        scopes: { include: { department: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.userRoles[0]?.role?.slug },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Enregistrement d'audit
    await prisma.auditLog.create({
      data: {
        action: 'AUTH_CONNEXION_REUSSIE',
        resource: 'PORTAIL_COUSP_MIS',
        ipAddress: req.ip || '127.0.0.1',
        userId: user.id,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({
      code: 200,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        tokens: { accessToken: token, refreshToken: token },
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur serveur auth', error: error.message });
  }
});

// --- DASHBOARD ---
app.get('/api/v1/dashboard/kpis', async (req, res) => {
  try {
    const [pendingAlerts, activeIncidents, confirmedCases, totalCases, deaths] = await Promise.all([
      prisma.alert.count({ where: { status: 'EN_COURS' } }),
      prisma.incident.count({ where: { status: 'ACTIF' } }),
      prisma.caseRecord.count({ where: { classification: 'CONFIRME' } }),
      prisma.caseRecord.count(),
      prisma.caseRecord.count({ where: { outcome: 'DECEDE' } }),
    ]);

    const cfr = totalCases > 0 ? `${((deaths / totalCases) * 100).toFixed(1)}%` : '0.0%';

    res.json({
      code: 200,
      data: {
        kpis: {
          pendingAlerts,
          activeIncidents,
          confirmedCases,
          totalReportedCases: totalCases,
          caseFatalityRate: cfr,
          totalDeaths: deaths,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/dashboard/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ code: 200, data: { departments } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- GÉOGRAPHIE & FORMATIONS SANITAIRES ---
app.get('/api/v1/geography/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    res.json({ code: 200, data: { departments } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/geography/health-zones', async (req, res) => {
  try {
    const zones = await prisma.healthZone.findMany({
      include: {
        department: true,
        _count: { select: { healthAreas: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ code: 200, data: { zones } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/geography/health-zones', async (req, res) => {
  try {
    const zone = await prisma.healthZone.create({
      data: req.body,
      include: { department: true, _count: { select: { healthAreas: true } } },
    });
    res.status(201).json({ code: 201, data: zone });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/v1/geography/health-zones/:id', async (req, res) => {
  try {
    await prisma.healthZone.delete({ where: { id: req.params.id } });
    res.json({ code: 200, message: 'Zone supprimée' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/v1/facilities', async (req, res) => {
  try {
    const facilities = await prisma.healthFacility.findMany({
      include: {
        healthArea: {
          include: {
            healthZone: {
              include: { department: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ code: 200, data: { facilities } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/facilities', async (req, res) => {
  try {
    const facility = await prisma.healthFacility.create({ data: req.body });
    res.status(201).json({ code: 201, data: facility });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/v1/facilities/:id', async (req, res) => {
  try {
    await prisma.healthFacility.delete({ where: { id: req.params.id } });
    res.json({ code: 200, message: 'Structure supprimée' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// --- ALERTES & MALADIES ---
app.get('/api/v1/diseases', async (req, res) => {
  try {
    const diseases = await prisma.disease.findMany({ orderBy: { name: 'asc' } });
    res.json({ code: 200, data: { diseases } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/alerts', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: { disease: true, healthFacility: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ code: 200, data: { alerts } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/alerts', async (req, res) => {
  try {
    const alertNumber = `ALT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const alert = await prisma.alert.create({
      data: {
        alertNumber,
        ...req.body,
      },
      include: { disease: true, healthFacility: true },
    });
    res.status(201).json({ code: 201, data: alert });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/v1/alerts/:id/validate', async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { status: 'VALIDEE' },
    });
    res.json({ code: 200, data: alert });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/v1/alerts/:id/reject', async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { status: 'REJETEE', rejectionReason: req.body.rejectionReason },
    });
    res.json({ code: 200, data: alert });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// --- INCIDENTS IMS ---
app.get('/api/v1/incidents', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        incidentCommander: true,
        primaryDepartment: true,
        _count: { select: { caseRecords: true, sitreps: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ code: 200, data: { incidents } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- FICHES DE CAS ---
app.get('/api/v1/case-records', async (req, res) => {
  try {
    const caseRecords = await prisma.caseRecord.findMany({
      include: { disease: true, healthFacility: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ code: 200, data: { caseRecords } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- STOCKS STRATÉGIQUES ---
app.get('/api/v1/stocks', async (req, res) => {
  try {
    const stockItems = await prisma.stockItem.findMany({
      include: { product: true, healthFacility: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ code: 200, data: { stockItems } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- SITREP ---
app.get('/api/v1/sitreps', async (req, res) => {
  try {
    const sitreps = await prisma.sitrep.findMany({
      include: {
        incident: {
          include: { primaryDepartment: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ code: 200, data: { sitreps } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- LABORATOIRES ---
app.get('/api/v1/laboratories/requests', async (req, res) => {
  try {
    const requests = await prisma.labRequest.findMany({
      include: {
        caseRecord: {
          include: { disease: true, healthFacility: true },
        },
        labResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ code: 200, data: { requests } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- UTILISATEURS IAM ---
app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userRoles: { include: { role: true } },
        scopes: { include: { department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const sanitized = users.map(({ passwordHash, ...u }) => u);
    res.json({ code: 200, data: { users: sanitized } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, title, organization, roleSlug, departmentId, isNational } = req.body;
    const passwordHash = await argon2.hash(password || 'CouspCongo2026!');

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        title,
        organization,
        scopes: {
          create: {
            isNational: !!isNational,
            departmentId: departmentId || null,
          },
        },
      },
    });

    if (roleSlug) {
      let role = await prisma.role.findUnique({ where: { slug: roleSlug } });
      if (!role) {
        role = await prisma.role.create({ data: { slug: roleSlug, name: roleSlug } });
      }
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }

    res.status(201).json({ code: 201, data: user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/v1/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ code: 200, message: 'Utilisateur supprimé' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// --- PISTE D'AUDIT ---
app.get('/api/v1/audit', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    res.json({ code: 200, data: { logs } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[COUSP-MIS] Backend API démarré sur http://localhost:${PORT}`);
});

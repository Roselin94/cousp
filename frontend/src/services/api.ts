import axios from 'axios';
import { mockData } from './mockData';

// Détection : mode mock activable via variable d'environnement ou fallback dev
const isMockEnabled = ((import.meta as any).env?.VITE_USE_MOCK !== 'false');

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cousp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur Mock transparent pour le développement local
if (isMockEnabled) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // Délai réaliste de 40ms
    await new Promise((resolve) => setTimeout(resolve, 40));

    let mockResponseData: any = null;

    if (url.includes('/auth/login')) {
      mockResponseData = {
        code: 200,
        message: 'Authentification réussie',
        data: {
          user: mockData.user,
          tokens: {
            accessToken: 'mock-jwt-token-cousp-2026',
            refreshToken: 'mock-refresh-token',
          },
        },
      };
    } else if (url.includes('/dashboard/kpis')) {
      mockResponseData = {
        code: 200,
        data: {
          kpis: mockData.kpis,
          lastUpdated: new Date().toISOString(),
        },
      };
    } else if (url.includes('/dashboard/departments') || url.includes('/geography/departments')) {
      mockResponseData = {
        code: 200,
        data: {
          departments: mockData.departments,
        },
      };
    } else if (url.includes('/geography/health-zones')) {
      if (method === 'post') {
        const payload = config.data ? JSON.parse(config.data) : {};
        const deptObj = mockData.departments.find((d) => d.id === payload.departmentId) || { name: 'Brazzaville', code: 'BZV' };
        const newZone = {
          id: `hz-${Date.now()}`,
          name: payload.name,
          code: payload.code,
          headquarter: payload.headquarter,
          population: Number(payload.population || 50000),
          departmentId: payload.departmentId,
          department: deptObj,
          _count: { healthAreas: 2 },
        };
        mockData.zones.unshift(newZone);
        mockResponseData = { code: 201, data: newZone };
      } else if (method === 'delete') {
        const idToDelete = url.split('/').pop();
        const idx = mockData.zones.findIndex((z) => z.id === idToDelete);
        if (idx !== -1) mockData.zones.splice(idx, 1);
        mockResponseData = { code: 200, message: 'Zone supprimée avec succès' };
      } else {
        mockResponseData = {
          code: 200,
          data: {
            zones: mockData.zones,
            healthZones: mockData.zones,
          },
        };
      }
    } else if (url.includes('/diseases')) {
      mockResponseData = {
        code: 200,
        data: {
          diseases: mockData.diseases,
        },
      };
    } else if (url.includes('/facilities')) {
      if (method === 'post') {
        const payload = config.data ? JSON.parse(config.data) : {};
        const newFac = {
          id: `fosa-${Date.now()}`,
          name: payload.name,
          code: payload.code,
          type: payload.type || 'CENTRE_SANTE_INTEGRE',
          level: Number(payload.level || 1),
          contactPhone: payload.contactPhone,
          healthArea: {
            name: 'Aire de Santé',
            healthZone: {
              name: 'District Sanitaire',
              department: { name: 'Congo', code: 'CG' }
            }
          },
          ...payload,
        };
        mockData.facilities.unshift(newFac);
        mockResponseData = { code: 201, data: newFac };
      } else if (method === 'delete') {
        const idToDelete = url.split('/').pop();
        const idx = mockData.facilities.findIndex((f) => f.id === idToDelete);
        if (idx !== -1) mockData.facilities.splice(idx, 1);
        mockResponseData = { code: 200, message: 'Structure supprimée avec succès' };
      } else {
        mockResponseData = {
          code: 200,
          data: { facilities: mockData.facilities },
        };
      }
    } else if (url.includes('/alerts')) {
      if (method === 'post') {
        const payload = config.data ? JSON.parse(config.data) : {};
        const diseaseObj = mockData.diseases.find((d) => d.id === payload.diseaseId) || { name: 'Autre pathologie' };
        const facObj = mockData.facilities.find((f) => f.id === payload.healthFacilityId) || { name: 'Structure Sanitaire' };
        const newAlert = {
          id: `alt-${Date.now()}`,
          alertNumber: `ALT-20261126-${Math.floor(1000 + Math.random() * 9000)}`,
          code: `ALT-20261126-${Math.floor(1000 + Math.random() * 9000)}`,
          disease: diseaseObj,
          healthFacility: facObj,
          status: 'EN_COURS',
          createdAt: new Date().toISOString(),
          ...payload,
        };
        mockData.alerts.unshift(newAlert);
        mockResponseData = { code: 201, data: newAlert };
      } else if (url.includes('/validate')) {
        mockResponseData = { code: 200, message: 'Alerte validée' };
      } else if (url.includes('/reject')) {
        mockResponseData = { code: 200, message: 'Alerte rejetée' };
      } else {
        mockResponseData = {
          code: 200,
          data: { alerts: mockData.alerts },
        };
      }
    } else if (url.includes('/incidents')) {
      mockResponseData = {
        code: 200,
        data: { incidents: mockData.incidents },
      };
    } else if (url.includes('/case-records')) {
      mockResponseData = {
        code: 200,
        data: { caseRecords: mockData.caseRecords },
      };
    } else if (url.includes('/stocks')) {
      mockResponseData = {
        code: 200,
        data: { stockItems: mockData.stocks, stocks: mockData.stocks },
      };
    } else if (url.includes('/sitreps')) {
      if (method === 'post') {
        const payload = config.data ? JSON.parse(config.data) : {};
        const newSitrep = {
          id: `sit-${Date.now()}`,
          sitrepNumber: `SITREP-2026-N${mockData.sitreps.length + 1}`,
          incident: { title: 'Incident sous surveillance', primaryDepartment: { name: 'Congo' } },
          totalCases: 10,
          totalDeaths: 0,
          status: 'BROUILLON',
          createdAt: new Date().toISOString(),
          ...payload,
        };
        mockData.sitreps.unshift(newSitrep);
        mockResponseData = { code: 201, data: newSitrep };
      } else {
        mockResponseData = {
          code: 200,
          data: { sitreps: mockData.sitreps },
        };
      }
    } else if (url.includes('/laboratories/requests') || url.includes('/laboratories')) {
      mockResponseData = {
        code: 200,
        data: { requests: mockData.requests },
      };
    } else if (url.includes('/users')) {
      if (method === 'post') {
        const payload = config.data ? JSON.parse(config.data) : {};
        const deptObj = mockData.departments.find((d) => d.id === payload.departmentId);
        const newUser = {
          id: `usr-${Date.now()}`,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          title: payload.title || 'Agent Sanitaire',
          organization: payload.organization || 'Ministère de la Santé',
          phone: payload.phone || '+242 06 000 00 00',
          status: 'ACTIVE',
          userRoles: [
            { role: { name: payload.roleSlug, slug: payload.roleSlug } }
          ],
          scopes: [
            { isNational: !!payload.isNational, department: deptObj || null }
          ],
        };
        mockData.users.unshift(newUser);
        mockResponseData = { code: 201, data: newUser };
      } else if (method === 'delete') {
        const idToDelete = url.split('/').pop();
        const idx = mockData.users.findIndex((u) => u.id === idToDelete);
        if (idx !== -1) mockData.users.splice(idx, 1);
        mockResponseData = { code: 200, message: 'Utilisateur supprimé avec succès' };
      } else {
        mockResponseData = {
          code: 200,
          data: { users: mockData.users },
        };
      }
    } else if (url.includes('/audit')) {
      mockResponseData = {
        code: 200,
        data: { logs: mockData.audit },
      };
    }

    if (mockResponseData) {
      config.adapter = async () => ({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }

    return config;
  });
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cousp_token');
      localStorage.removeItem('cousp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

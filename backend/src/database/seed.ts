import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initialisation du seed territorial national COUSP-MIS (Rép. du Congo) ---');

  // 1. Les 12 Départements Congolais
  const departments = [
    { code: 'BZV', name: 'Brazzaville', capitalCity: 'Brazzaville', population: 2145000, hasCriticalAlert: true, activeIncidentsCount: 1 },
    { code: 'PNR', name: 'Pointe-Noire', capitalCity: 'Pointe-Noire', population: 1150000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'KOU', name: 'Kouilou', capitalCity: 'Hinda', population: 98000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'NIA', name: 'Niari', capitalCity: 'Dolisie', population: 260000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'BOU', name: 'Bouenza', capitalCity: 'Madingou', population: 340000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'LEK', name: 'Lékoumou', capitalCity: 'Sibiti', population: 105000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'POL', name: 'Pool', capitalCity: 'Kinkala', population: 275000, hasCriticalAlert: true, activeIncidentsCount: 1 },
    { code: 'PLA', name: 'Plateaux', capitalCity: 'Djambala', population: 210000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'CUV', name: 'Cuvette', capitalCity: 'Owando', population: 175000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'CUW', name: 'Cuvette-Ouest', capitalCity: 'Ewo', population: 85000, hasCriticalAlert: false, activeIncidentsCount: 0 },
    { code: 'SAN', name: 'Sangha', capitalCity: 'Ouesso', population: 110000, hasCriticalAlert: true, activeIncidentsCount: 1 },
    { code: 'LIK', name: 'Likouala', capitalCity: 'Impfondo', population: 160000, hasCriticalAlert: false, activeIncidentsCount: 0 },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: dept,
      create: dept,
    });
  }

  // 2. Rôles IAM
  const adminRole = await prisma.role.upsert({
    where: { slug: 'COORDINATEUR_NATIONAL' },
    update: {},
    create: { slug: 'COORDINATEUR_NATIONAL', name: 'Coordinateur National IMS', description: 'Accès souverain global' },
  });

  // 3. Compte Administrateur Officiel
  const passwordHash = await argon2.hash('CouspCongo2026!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.cousp@sante.gouv.cg' },
    update: { passwordHash },
    create: {
      email: 'admin.cousp@sante.gouv.cg',
      passwordHash,
      firstName: 'Administrateur',
      lastName: 'National',
      title: 'Coordinateur Général COUSP',
      organization: 'Ministère de la Santé et de la Population',
      phone: '+242 06 500 00 00',
      status: 'ACTIVE',
      userRoles: { create: { roleId: adminRole.id } },
      scopes: { create: { isNational: true } },
    },
  });

  // 4. Pathologies prioritaires SIMR
  const diseases = [
    { code: 'MPOX', name: 'Mpox (Variole du Singe)', epidemicPotential: 'TRES_ELEVE' },
    { code: 'CHOL', name: 'Choléra', epidemicPotential: 'TRES_ELEVE' },
    { code: 'EBO', name: 'Ebola / Fièvre Marburg', epidemicPotential: 'CRITIQUE' },
    { code: 'POLIO', name: 'Poliomyélite', epidemicPotential: 'ELEVE' },
  ];

  for (const dis of diseases) {
    await prisma.disease.upsert({
      where: { code: dis.code },
      update: dis,
      create: dis,
    });
  }

  console.log('--- Seed territorial national COUSP-MIS terminé avec succès ! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

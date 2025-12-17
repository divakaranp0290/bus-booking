// scripts/seed.ts
import { prisma } from "./utils/prisma";
import { hashPassword } from '../src/utils/auth';


async function main() {
  const pw = await hashPassword('Admin123!');
  await prisma.user.upsert({
    where: { email: 'admin@busapp.test' },
    update: {},
    create: { email: 'admin@busapp.test', password: pw, name: 'Admin', role: 'ADMIN' }
  });
  console.log('Seeded admin');
}
main().catch(e => { console.error(e); process.exit(1); });

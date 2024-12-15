import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readdir } from 'fs/promises';
import { join } from 'path';

initializeApp({
  credential: cert(
    join(__dirname, '../src/packages/clients/firebase/serviceAccountKey.json'),
  ),
});

const db = getFirestore();
const migrationsPath = join(__dirname, '../migrations-firebase');

const collection = 'Migrations';

async function getExecutedMigrations() {
  const migrationsRef = db.collection(collection);
  const snapshot = await migrationsRef.get();
  const executedMigrations = snapshot.docs.map((doc) => doc.id);
  return new Set(executedMigrations);
}

async function runMigration(filePath: string, migrationId: string) {
  console.log(`Executando migração: ${migrationId}...`);
  const { default: migration } = await import(filePath);

  try {
    await migration(db);
    await db.collection(collection).doc(migrationId).set({
      id: migrationId,
      status: 'executed',
      createdAt: new Date().getTime(),
    });
    console.log(`Migração "${migrationId}" concluída com sucesso.`);
  } catch (error) {
    console.error(`Erro ao executar migração "${migrationId}":`, error);
    process.exit(1);
  }
}

async function runMigrations() {
  console.log('Iniciando execução de migrações...');

  const executedMigrations = await getExecutedMigrations();
  const migrationFiles = await readdir(migrationsPath);

  const sortedMigrations = migrationFiles
    .filter((file) => file.endsWith('.ts'))
    .sort();

  for (const file of sortedMigrations) {
    const migrationId = file.replace('.ts', '');

    if (executedMigrations.has(migrationId)) {
      console.log(`Migração "${migrationId}" já foi executada. Pulando...`);
      continue;
    }

    const filePath = join(migrationsPath, file);
    await runMigration(filePath, migrationId);
  }

  console.log('Todas as migrações foram processadas.');
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro geral ao executar migrações:', err);
    process.exit(1);
  });

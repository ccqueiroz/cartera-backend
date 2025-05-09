import 'dotenv/config';

import { clientWinston } from './../src/packages/clients/winston';
import { serviceAccountKey } from './../src/packages/clients/firebase/serviceAccountKey';
import * as admin from 'firebase-admin';
import { readdir } from 'fs/promises';
import { join } from 'path';

const migrationsPath = join(__dirname, '../migrations-firebase');
const collection = 'Migrations';

const getDb = () => {
  try {
    return admin
      .initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccountKey.projectId,
          clientEmail: serviceAccountKey.clientEmail,
          privateKey: serviceAccountKey.privateKey,
        } as admin.ServiceAccount),
        databaseURL: `https://${serviceAccountKey.projectId}.firebaseio.com`,
        storageBucket: `${serviceAccountKey.projectId}.appspot.com`,
        serviceAccountId: serviceAccountKey.clientEmail,
      })
      .firestore();
  } catch (error) {
    return error as Error;
  }
};

const db = getDb();

async function getExecutedMigrations(db: admin.firestore.Firestore) {
  const migrationsRef = db.collection(collection);
  const snapshot = await migrationsRef.get();
  const executedMigrations = snapshot.docs.map((doc) => doc.id);
  return new Set(executedMigrations);
}

async function runMigration(
  db: admin.firestore.Firestore,
  filePath: string,
  migrationId: string,
) {
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
    clientWinston.error(
      `Erro ao executar migração "${migrationId}": ${
        (error as Error)?.message
      }`,
    );
    new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
        process.exit(1);
      }, 10),
    );
  }
}

async function runMigrations(db: admin.firestore.Firestore | Error) {
  if (db instanceof Error) throw new Error(db.message);

  console.log('Iniciando execução de migrações...');

  const executedMigrations = await getExecutedMigrations(db);
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
    await runMigration(db, filePath, migrationId);
  }

  console.log('Todas as migrações foram processadas.');
}

runMigrations(db)
  .then(() => process.exit(0))
  .catch((err: Error) => {
    clientWinston.error(
      `Erro geral ao executar migrações: ${err.message} - ${JSON.stringify(
        err.stack,
      )}.`,
    );

    new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
        process.exit(1);
      }, 10),
    );
  });

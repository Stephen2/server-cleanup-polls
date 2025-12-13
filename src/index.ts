import { createSonarrService } from './services/sonarr-service.js';
import { createDatabase } from './services/database-service.js';
import { createSignalService } from './services/signal-service.js';

// Built in to Node. Awesome.
process.loadEnvFile();

const getEnvironmentVariableOrThrow = (key: string): string => {
  const environmentVariable = process.env[key];

  if (!environmentVariable) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return environmentVariable;
};

const config = {
  SONARR_URL: getEnvironmentVariableOrThrow('SONARR_URL'),
  SONARR_API_KEY: getEnvironmentVariableOrThrow('SONARR_API_KEY'),

  SIGNAL_URL: getEnvironmentVariableOrThrow('SIGNAL_URL'),
  SIGNAL_USER: getEnvironmentVariableOrThrow('SIGNAL_USER'),
  SIGNAL_GROUP: getEnvironmentVariableOrThrow('SIGNAL_GROUP'),

  DB_PATH: getEnvironmentVariableOrThrow('DB_PATH'),
};

(async () => {
  const sonarrService = createSonarrService({
    url: config.SONARR_URL,
    apiKey: config.SONARR_API_KEY,
  });

  const { database, saveDatabase } = await createDatabase({
    dbPath: config.DB_PATH,
  });

  const signalService = createSignalService({
    url: config.SIGNAL_URL,
    sender: config.SIGNAL_USER,
  });

  const biggestShow = await sonarrService.getLargetShowExcluding(
    database.seriesPolled.map((_) => _.sonarrSeriesId),
  );

  if (!biggestShow) {
    throw new Error('No shows found that have not been polled before');
  }

  const { timestamp } = await signalService.sendMessage({
    message: `
      Show: ${biggestShow.title}\n
      Overview: ${biggestShow.overview}\n
      Size on Disk: ${(biggestShow.statistics.sizeOnDisk / (1024 * 1024 * 1024)).toFixed(2)} GiB\n
      React: 👍 or 👎 to Keep or Delete. In 24hrs, if only 👎 exist, show will be deleted
    `,
    recipients: [config.SIGNAL_GROUP],
  });

  // Save to datbase
  database.seriesPolled.push({
    sonarrSeriesId: biggestShow.id,
    pollSentAt: new Date(timestamp),
  });

  await saveDatabase(database);
})().catch(console.error);

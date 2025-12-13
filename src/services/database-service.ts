import fs from 'node:fs/promises';
import z from 'zod';

type Params = {
  dbPath: string;
};

const seriesPolledRecordSchema = z.object({
  sonarrSeriesId: z.number(),
  pollSentAt: z.coerce.date(),
});

type SeriesPolledRecord = z.infer<typeof seriesPolledRecordSchema>;

type Database = {
  seriesPolled: SeriesPolledRecord[];
};

export const createDatabase = async ({ dbPath }: Params) => {
  const rawRecords = (await fs.readFile(dbPath, 'utf-8')).split('\n').filter(Boolean);

  // I suppose we'll expand this later, but this'll do for now
  const seriesPolled = rawRecords.reduce<SeriesPolledRecord[]>((acc, line) => {
    const [recordType, rawJSON] = line.split('\t');

    if (!recordType || !rawJSON) {
      throw new Error('Malformed database record');
    }

    if (recordType === 'SeriesPolledRecord') {
      const parsedSeriesPolledRecord = seriesPolledRecordSchema.safeParse(JSON.parse(rawJSON));

      if (!parsedSeriesPolledRecord.success) {
        throw new Error(
          `Invalid SeriesPolledRecord in database: ${parsedSeriesPolledRecord.error.message}`,
        );
      }

      acc.push(parsedSeriesPolledRecord.data);
    }

    return acc;
  }, []);

  const saveDatabase = async (database: Database) => {
    const lines = database.seriesPolled.map(
      (record) => `SeriesPolledRecord\t${JSON.stringify(record)}`,
    );

    const content = lines.join('\n');

    await fs.writeFile(dbPath, content, 'utf-8');
  };

  return {
    database: {
      seriesPolled,
    },
    saveDatabase,
  };
};

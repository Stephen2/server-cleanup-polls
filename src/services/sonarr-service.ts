import axios from 'axios';

type Params = {
  url: string;
  apiKey: string;
};

type Series = {
  id: number;
  title: string;
  overview: string;
  statistics: {
    sizeOnDisk: number;
  };
};

export const createSonarrService = ({ url, apiKey }: Params) => {
  const sonarrClient = axios.create({
    baseURL: url,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 12e4,
  });

  const getShows = async () => {
    // Placeholder for fetching shows from Sonarr
    const { data } = await sonarrClient.get<Series[]>('/api/v3/series');

    return data;
  };

  const getLargetShowExcluding = async (excludeIds: number[]) => {
    const shows = await getShows();

    return shows
      .filter((_) => !excludeIds.includes(_.id))
      .sort((a, b) => b.statistics.sizeOnDisk - a.statistics.sizeOnDisk)[0];
  };

  return {
    getShows,
    getLargetShowExcluding,
  };
};

// src/integrations/bitla/bitla.search.ts

import { mapBitlaTrip } from './bitla.mapper';
import mockSearch from '../../integrations/mock/mock-search.json';


export async function bitlaSearch(_: any) {

  const searchId = `SRCH_${Date.now()}`;

  return mockSearch.trips.map((trip: any) =>
    mapBitlaTrip(trip, searchId)
  );
}

import mockCities from '../../integrations/mock/mock-cities.json';
import { adaptCities } from './location.adapter';
// import { BitlaClient } from '../../integrations/bitla/bitla.client';

export class LocationService {
  async getCities() {

    return mockCities;

    // 🔁 REAL API MODE (later)
    // const raw = await new BitlaClient().getCities();
    // return adaptCities(raw);
  }
}

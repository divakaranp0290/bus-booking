// backend/src/modules/search/search.service.ts

import { bitlaSearch } from '../../integrations/bitla/bitla.search';

export class SearchService {

  
  async search(payload: {
    from: string;
    to: string;
    date: string;
  }) {

    if (!payload.from || !payload.to || !payload.date) {
      throw new Error('from, to and date are required');
    }

    return bitlaSearch(payload);
  }
}

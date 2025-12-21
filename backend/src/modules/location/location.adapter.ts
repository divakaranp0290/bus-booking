export function adaptCities(raw: any[]) {
  return raw.map(c => ({
    id: c.city_id ?? c.id,
    name: c.city_name ?? c.name,
    state: c.state,
    popular: c.popular ?? false
  }));
}

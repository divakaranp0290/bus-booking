export function adaptSearchResponse(raw: any) {
  const trips = Array.isArray(raw) ? raw : raw.trips;

  return trips.map((t: any) => ({
    tripId: t.trip_id ?? t.tripId,
    operatorName: t.operator_name ?? t.operatorName,
    busType: t.bus_type ?? t.busType,
    departureTime: t.dep_time ?? t.departureTime,
    arrivalTime: t.arr_time ?? t.arrivalTime,
    durationMins: t.duration ?? t.durationMins,
    fare: (t.fare ?? 0) + 20,
    seatsLeft: t.seats_available ?? t.seatsLeft
  }));
}

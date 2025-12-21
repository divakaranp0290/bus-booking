export interface CanonicalBusResult {
  searchId: string;

  tripId: string;
  operatorName: string;
  busType: string;

  departureTime: string;
  arrivalTime: string;
  durationMins: number;

  fare: number;
  seatsLeft: number;

  boardingPoints: string[];
  droppingPoints: string[];

  source: 'BITLA';
}

export function mapBitlaTrip(
  trip: any,
  searchId: string
): CanonicalBusResult {
  return {
    searchId,

    tripId: trip.trip_id,
    operatorName: trip.operator_name,
    busType: trip.bus_type,

    departureTime: trip.dep_time,
    arrivalTime: trip.arr_time,
    durationMins: trip.duration,

    fare: trip.fare,
    seatsLeft: trip.seats_available,

    boardingPoints: trip.boarding_points?.map((b: any) => b.name) || [],
    droppingPoints: trip.dropping_points?.map((d: any) => d.name) || [],

    source: 'BITLA'
  };
}

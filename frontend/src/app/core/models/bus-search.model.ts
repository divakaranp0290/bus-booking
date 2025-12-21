export interface BusSearchResult {
  tripId: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  durationMins: number;
  fare: number;
  seatsLeft: number;
}

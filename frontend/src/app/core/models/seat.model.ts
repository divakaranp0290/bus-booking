
export interface Seat {
  id?: string;
  seatNo: string;
  type: 'SEATER' | 'SLEEPER';
  deck: 'U' | 'L';
  row: number;
  column: number;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'LOCKED';
  gender?: 'LADIES';
  fare: number;
}
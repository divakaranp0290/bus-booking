import { Seat } from '../models/seat.model';

export function adaptBitlaSeats(seats: Seat[]) {
  const deckMap: any = { U: {}, L: {} };

  for (const seat of seats) {
    if (!deckMap[seat.deck][seat.row]) {
      deckMap[seat.deck][seat.row] = [];
    }
    deckMap[seat.deck][seat.row].push(seat);
  }

  // sort seats inside each row by column
  for (const deck of ['U', 'L']) {
    for (const row in deckMap[deck]) {
      deckMap[deck][row].sort((a: Seat, b: Seat) => a.column - b.column);
    }
  }

  return deckMap;
}


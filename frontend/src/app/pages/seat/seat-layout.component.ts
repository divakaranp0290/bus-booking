import { Component, Input } from '@angular/core';
import { Seat } from '../../core/models/seat.model';

@Component({
  selector: 'app-seat-layout',
  templateUrl: './seat-layout.component.html',
  styleUrls: ['./seat-layout.component.scss']
})
export class SeatLayoutComponent {

  /* ================= INPUTS ================= */
  @Input() seats: Seat[] = [];
  @Input() maxSelectableSeats = 6;

  /* ================= STATE ================= */
  selectedSeats: Seat[] = [];
  selectedBoarding: any = null;
  selectedDropping: any = null;

  hoverSeat: Seat | null = null;
  fareFilters = [489, 569, 599, 799, 839];

  /* TEMP — later from auth / passenger screen */
  userGender: 'MALE' | 'FEMALE' = 'MALE';

  /* ================= MOCK BP / DP ================= */
  boardingPoints = [
    {
      id: 1,
      time: '21:10',
      name: 'Siruseri',
      desc: 'Infront of HDFC ATM, Opp A2B Adyar Ananda Bhavan (Chennai)'
    },
    {
      id: 2,
      time: '21:15',
      name: 'Navalur',
      desc: 'Infront of HP Petrol Bunk, After Navalur Toll (Chennai)'
    },
    {
      id: 3,
      time: '21:20',
      name: 'Semmancherry',
      desc: 'Infront of Sathyabama University Arch (Chennai)'
    }
  ];

  droppingPoints = [
    {
      id: 11,
      time: '05:35',
      name: 'Hosur',
      desc: 'Opp Tanishq Jewellery, After Bridge (Bangalore)'
    },
    {
      id: 12,
      time: '05:45',
      name: 'Attibele',
      desc: 'After Attibele Toll Gate (Bangalore)'
    },
    {
      id: 13,
      time: '05:55',
      name: 'Bommasandra',
      desc: 'Infront of Adyar Ananda Bhavan (Bangalore)'
    }
  ];

  /* ================= ROW GROUPING (FIXED & OPTIMIZED) ================= */

  get upperRows(): Seat[][] {
    return this.buildRows('U');
  }

  get lowerRows(): Seat[][] {
    return this.buildRows('L');
  }

  private seatKey(seat: Seat): string {
    return `${seat.deck}-${seat.row}-${seat.column}`;
  }


  private buildRows(deck: 'U' | 'L'): Seat[][] {
    if (!Array.isArray(this.seats)) {
      // seats already grouped → flatten
      return Object.values(this.seats[deck] || {}).map((r: any) => r);
    }

    const rowsMap = new Map<number, Seat[]>();

    this.seats
      .filter(seat => seat.deck === deck)
      .forEach(seat => {
        if (!rowsMap.has(seat.row)) {
          rowsMap.set(seat.row, []);
        }
        rowsMap.get(seat.row)!.push(seat);
      });

    return Array.from(rowsMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, rowSeats]) =>
        rowSeats.sort((a, b) => a.column - b.column)
      );
  }


  /* ================= BP / DP ================= */

  selectBoarding(bp: any): void {
    this.selectedBoarding = bp;
  }

  selectDropping(dp: any): void {
    this.selectedDropping = dp;
  }

  get isStep1Complete(): boolean {
    return !!this.selectedBoarding && !!this.selectedDropping;
  }

  /* ================= SEAT STATES ================= */

  isSeatDisabled(seat: Seat): boolean {
    return seat.status !== 'AVAILABLE';
  }


  isSeatSelected(seat: Seat): boolean {
    return this.selectedSeats.some(
      s => this.seatKey(s) === this.seatKey(seat)
    );
  }

  /* ================= SELECTION GUARD ================= */

  private canSelectSeat(seat: Seat): boolean {
    if (!this.isStep1Complete) {
      this.showSeatError('Select boarding and dropping point first');
      return false;
    }

    if (this.isSeatDisabled(seat)) return false;

    if (seat.gender === 'LADIES' && this.userGender === 'MALE') {
      this.showSeatError('This seat is reserved for ladies');
      return false;
    }

    if (
      !this.isSeatSelected(seat) &&
      this.selectedSeats.length >= this.maxSelectableSeats
    ) {
      this.showSeatError(`You can select only ${this.maxSelectableSeats} seats`);
      return false;
    }

    return true;
  }

  /* ================= TOGGLE SEAT ================= */

  toggleSeat(seat: Seat): void {
    if (!this.canSelectSeat(seat)) return;

    const index = this.selectedSeats.findIndex(
      s => this.seatKey(s) === this.seatKey(seat)
    );

    if (index >= 0) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  /* ================= HELPERS ================= */

  get isSeaterOnly(): boolean {
    return this.seats.length > 0 && this.seats.every(s => s.type === 'SEATER');
  }

  get totalFare(): number {
    return this.selectedSeats.reduce((t, s) => t + s.fare, 0);
  }

  private showSeatError(message: string): void {
    console.warn('[Seat Selection]', message);
  }
}

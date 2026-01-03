import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import { adaptBitlaSeats } from '../../core/adapters/bitla-seat.adapter';
import { Seat } from '../../core/models/seat.model';


@Component({
  selector: 'app-results',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {


  @ViewChild('fromInput') fromInput!: ElementRef;
  @ViewChild('toInput') toInput!: ElementRef;
  @ViewChild('dateInput') dateInput!: ElementRef;

  loading = false;

  from = '';
  to = '';
  date = '';

  bid = '';

  allResults: any[] = [];
  filteredResults: any[] = [];

  /* ===== FILTER STATE ===== */
  selectedBusTypes: string[] = [];
  selectedBoardingPoints: string[] = [];
  selectedDroppingPoints: string[] = [];
  selectedOperators: string[] = [];


  selectedDepartureSlots = new Set<string>();
  selectedArrivalSlots = new Set<string>();


  /* ===== FILTER OPTIONS (DYNAMIC) ===== */
  availableBoardingPoints: string[] = [];
  availableDroppingPoints: string[] = [];
  availableOperators: string[] = [];

  /* ===== FILTER STATES ===== */

  selectedDepartureTimes: string[] = [];
  selectedArrivalTimes: string[] = [];

  showSeats = false;
  selectedSeats: Seat[] = [];


  seats = adaptBitlaSeats([
    /* ================= UPPER DECK ================= */

    // Row 1 (Left side)
    { seatNo: 'U1', row: 1, column: 1, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U2', row: 1, column: 2, deck: 'U', type: 'SLEEPER', status: 'BOOKED', fare: 1200 },

    // Row 1 (Right side — aisle gap between col 2 → 4)
    { seatNo: 'U3', row: 1, column: 3, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U4', row: 1, column: 4, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U5', row: 1, column: 5, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U6', row: 1, column: 6, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },

    // Row 2
    { seatNo: 'U1', row: 2, column: 1, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U2', row: 2, column: 2, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },

    { seatNo: 'U3', row: 2, column: 3, deck: 'U', type: 'SLEEPER', status: 'BOOKED', fare: 1200 },
    { seatNo: 'U4', row: 2, column: 4, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },
    { seatNo: 'U5', row: 2, column: 5, deck: 'U', type: 'SLEEPER', status: 'BOOKED', fare: 1200 },
    { seatNo: 'U6', row: 2, column: 6, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },


    // Row 3 (gap above this row for stairs / passage)
    { seatNo: 'U1', row: 3, column: 2, deck: 'U', type: 'SLEEPER', status: 'BOOKED', fare: 1200 },
    { seatNo: 'U2', row: 3, column: 3, deck: 'U', type: 'SLEEPER', status: 'AVAILABLE', fare: 1200 },

    /* ================= LOWER DECK ================= */

    // Row 1 (Seaters)
    { seatNo: 'L1', row: 1, column: 1, deck: 'L', type: 'SEATER', status: 'AVAILABLE', fare: 1100 },
    { seatNo: 'L2', row: 1, column: 2, deck: 'L', type: 'SEATER', status: 'AVAILABLE', fare: 1100 },

    // Aisle
    { seatNo: 'L3', row: 1, column: 3, deck: 'L', type: 'SEATER', status: 'BOOKED', fare: 1100 },
    { seatNo: 'L4', row: 1, column: 4, deck: 'L', type: 'SEATER', status: 'AVAILABLE', fare: 1100 }
  ]);


  constructor(
    private route: ActivatedRoute,
    private busService: SearchService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.from = params['from'];
      this.to = params['to'];
      this.date = params['date'];

      if (this.from && this.to && this.date) {
        this.fetchResults();
      }
    });
  }

  /* ===== GENERIC TOGGLE ===== */
  private toggleItem(list: string[], value: string) {
    const index = list.indexOf(value);
    if (index > -1) {
      list.splice(index, 1); // disable
    } else {
      list.push(value); // enable
    }
  }

  /* ===== PILLS ===== */
  toggleBusType(type: string) {
    this.toggleItem(this.selectedBusTypes, type);
    this.applyFilters();
  }

  toggleDeparture(time: string) {
    this.toggleItem(this.selectedDepartureTimes, time);
    this.applyFilters();
  }

  toggleArrival(time: string) {
    this.toggleItem(this.selectedArrivalTimes, time);
    this.applyFilters();
  }

  /* ===== CHECKBOXES ===== */
  toggleBoarding(point: string) {
    this.toggleItem(this.selectedBoardingPoints, point);
    this.applyFilters();
  }

  toggleDropping(point: string) {
    this.toggleItem(this.selectedDroppingPoints, point);
    this.applyFilters();
  }

  toggleOperator(operator: string) {
    this.toggleItem(this.selectedOperators, operator);
    this.applyFilters();
  }

  /* Convert HH:mm to minutes since midnight */
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  /* Check if a time falls inside a slot (railway-safe) */
  private isTimeInSlot(time: string, slot: string): boolean {
    const minutes = this.timeToMinutes(time);

    const slotMap: Record<string, [number, number]> = {
      '12am-6am': [0, 360],
      '6am-12pm': [360, 720],
      '12pm-6pm': [720, 1080],
      '6pm-12am': [1080, 1440] // ✅ crosses midnight handled
    };

    const [start, end] = slotMap[slot];

    // Normal range
    if (start < end) {
      return minutes >= start && minutes < end;
    }

    // Cross-midnight (railway logic)
    return minutes >= start || minutes < end;
  }


  /* ===== FILTER LOGIC ===== */
  applyFilters() {
    this.filteredResults = this.allResults.filter(bus => {

      /* BUS TYPE */
      if (
        this.selectedBusTypes.length &&
        !this.selectedBusTypes.some(t => bus.busType.includes(t))
      ) return false;

      /* DEPARTURE TIME (FIXED) */
      if (this.selectedDepartureTimes.length) {
        const depTime = bus.departureTime; // e.g. "22:30"
        const match = this.selectedDepartureTimes.some(slot =>
          this.isTimeInSlot(depTime, slot)
        );
        if (!match) return false;
      }

      /* ARRIVAL TIME (FIXED) */
      if (this.selectedArrivalTimes.length) {
        const arrTime = bus.arrivalTime; // e.g. "06:00"
        const match = this.selectedArrivalTimes.some(slot =>
          this.isTimeInSlot(arrTime, slot)
        );
        if (!match) return false;
      }

      /* BOARDING */
      if (
        this.selectedBoardingPoints.length &&
        !this.selectedBoardingPoints.includes(bus.boardingPoint)
      ) return false;

      /* DROPPING */
      if (
        this.selectedDroppingPoints.length &&
        !this.selectedDroppingPoints.includes(bus.droppingPoint)
      ) return false;

      /* OPERATOR */
      if (
        this.selectedOperators.length &&
        !this.selectedOperators.includes(bus.operatorName)
      ) return false;

      return true;
    });
  }




  swapCities() {
    [this.from, this.to] = [this.to, this.from];
  }

  updateSearch() {
    if (!this.from || !this.to || !this.date) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        from: this.from,
        to: this.to,
        date: this.date
      },
      queryParamsHandling: 'merge'
    });
  }


  focusFrom() {
    this.fromInput.nativeElement.focus();
  }

  focusTo() {
    this.toInput.nativeElement.focus();
  }

  openDatePicker() {
    this.dateInput.nativeElement.showPicker?.();
  }

  fetchResults(): void {
    this.loading = true;

    const payload = {
      from: this.from,
      to: this.to,
      date: this.date
    };

    this.busService.search(payload).subscribe({
      next: (res: any) => {
        this.allResults = res.results || [];
        this.filteredResults = [...this.allResults];
        this.bid = res.searchId || '';

        this.availableBoardingPoints = this.extractUnique('boardingPoints');
        this.availableDroppingPoints = this.extractUnique('droppingPoints');
        this.availableOperators = this.extractUnique('operatorName');

        this.loading = false;
      },
      error: () => {
        this.allResults = [];
        this.filteredResults = [];
        this.loading = false;
      }
    });
  }

  /* ===== FILTER HELPERS ===== */

  extractUnique(field: string): string[] {
    const set = new Set<string>();

    this.allResults.forEach(bus => {
      const value = bus[field];
      if (Array.isArray(value)) {
        value.forEach((v: string) => set.add(v));
      } else if (typeof value === 'string') {
        set.add(value);
      }
    });

    return Array.from(set).sort();
  }

  toggleSet(set: Set<string>, value: string): void {
    set.has(value) ? set.delete(value) : set.add(value);
    this.applyFilters();
  }


  matchBusType(bus: any): boolean {
    if (!this.selectedBusTypes) return true;
    return [...this.selectedBusTypes].some(v =>
      bus.busType?.toLowerCase().includes(v.toLowerCase())
    );
  }

  matchDepartureTime(bus: any): boolean {
    return this.matchTimeSlot(bus.departureTime, this.selectedDepartureSlots);
  }

  matchArrivalTime(bus: any): boolean {
    return this.matchTimeSlot(bus.arrivalTime, this.selectedArrivalSlots);
  }

  matchTimeSlot(time: string, slots: Set<string>): boolean {
    if (!slots.size) return true;
    const hour = Number(time?.split(':')[0]);

    return [...slots].some(slot => {
      switch (slot) {
        case '12am-6am': return hour < 6;
        case '6am-12pm': return hour >= 6 && hour < 12;
        case '12pm-6pm': return hour >= 12 && hour < 18;
        case '6pm-12am': return hour >= 18;
        default: return true;
      }
    });
  }

  matchBoardingPoint(bus: any): boolean {
    if (!this.selectedBoardingPoints) return true;
    return bus.boardingPoints?.some((p: string) =>
      this.selectedBoardingPoints.includes(p)
    );
  }

  matchDroppingPoint(bus: any): boolean {
    if (!this.selectedDroppingPoints) return true;
    return bus.droppingPoints?.some((p: string) =>
      this.selectedDroppingPoints.includes(p)
    );
  }

  matchOperator(bus: any): boolean {
    if (!this.selectedOperators) return true;
    return this.selectedOperators.includes(bus.operatorName);
  }

  toggleSeats() {
    this.showSeats = !this.showSeats;
  }

  onSeatChange(seats: Seat[]) {
    this.selectedSeats = seats;
  }
}

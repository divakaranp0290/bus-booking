import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../core/services/search.service';


@Component({
  selector: 'app-results',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  loading = false;

  from = '';
  to = '';
  date = '';

  bid = '';

  allResults: any[] = [];
  filteredResults: any[] = [];

  /* ===== FILTER STATE ===== */
  selectedBusTypes = new Set<string>();
  selectedDepartureSlots = new Set<string>();
  selectedArrivalSlots = new Set<string>();
  selectedBoardingPoints = new Set<string>();
  selectedDroppingPoints = new Set<string>();
  selectedOperators = new Set<string>();

  /* ===== FILTER OPTIONS (DYNAMIC) ===== */
  availableBoardingPoints: string[] = [];
  availableDroppingPoints: string[] = [];
  availableOperators: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private busService: SearchService
  ) {}

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

  toggleBusType(v: string) { this.toggleSet(this.selectedBusTypes, v); }
  toggleDeparture(v: string) { this.toggleSet(this.selectedDepartureSlots, v); }
  toggleArrival(v: string) { this.toggleSet(this.selectedArrivalSlots, v); }
  toggleBoarding(v: string) { this.toggleSet(this.selectedBoardingPoints, v); }
  toggleDropping(v: string) { this.toggleSet(this.selectedDroppingPoints, v); }
  toggleOperator(v: string) { this.toggleSet(this.selectedOperators, v); }

  applyFilters(): void {
    this.filteredResults = this.allResults.filter(bus =>
      this.matchBusType(bus) &&
      this.matchDepartureTime(bus) &&
      this.matchArrivalTime(bus) &&
      this.matchBoardingPoint(bus) &&
      this.matchDroppingPoint(bus) &&
      this.matchOperator(bus)
    );
  }

  matchBusType(bus: any): boolean {
    if (!this.selectedBusTypes.size) return true;
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
    if (!this.selectedBoardingPoints.size) return true;
    return bus.boardingPoints?.some((p: string) =>
      this.selectedBoardingPoints.has(p)
    );
  }

  matchDroppingPoint(bus: any): boolean {
    if (!this.selectedDroppingPoints.size) return true;
    return bus.droppingPoints?.some((p: string) =>
      this.selectedDroppingPoints.has(p)
    );
  }

  matchOperator(bus: any): boolean {
    if (!this.selectedOperators.size) return true;
    return this.selectedOperators.has(bus.operatorName);
  }
}

import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { City } from '../../core/models/city.model';
import { LocationService } from '../../core/services/location.service';
import flatpickr from 'flatpickr';
import gsap from 'gsap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;
  // ================= DEFAULT VALUES =================
  readonly DEFAULT_FROM = 'Chennai';
  readonly DEFAULT_TO = 'Bangalore';

  fromText = this.DEFAULT_FROM;
  toText = this.DEFAULT_TO;

  fromCity!: City;
  toCity!: City;
  journeyDate: Date = new Date();


  // ================= DATA =================
  allCities: City[] = [];

  recentFrom: City[] = [];
  recentTo: City[] = [];

  filteredFrom: City[] = [];
  filteredTo: City[] = [];

  // ================= UI STATE =================
  fromFocused = false;
  toFocused = false;

  showFromDropdown = false;
  showToDropdown = false;

  // ================= DATE =================
  date = this.formatDate(new Date());
  fpInstance!: flatpickr.Instance;

  selectedDate: 'today' | 'tomorrow' | null = null;

  constructor(
    private locationService: LocationService,
    private router: Router,
    private http: HttpClient
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    this.loadCities();
    this.loadRecents();
    this.selectToday();
  }

  ngAfterViewInit() {
    this.initBusAnimation();
    this.flightSmoothness();
    // Desktop only
    if (window.innerWidth >= 768) {
      this.fpInstance = flatpickr(this.dateInput.nativeElement, {
        dateFormat: 'd M Y',
        defaultDate: this.journeyDate,
        minDate: 'today',
        disableMobile: true,
        onChange: ([selectedDate]) => {
          this.updateDate(selectedDate);
        }
      });
    } else {
      // Mobile fallback
      this.dateInput.nativeElement.type = 'date';
    }

    this.updateInputValue();
  }

  updateDate(date: Date) {
    this.journeyDate = date;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.selectedDate = this.isSameDay(date, today) ? 'today' : (this.isSameDay(date, tomorrow) ? 'tomorrow' : null);

    this.updateInputValue();
  }

  updateInputValue() {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    if (this.dateInput && this.dateInput.nativeElement) {
      this.dateInput.nativeElement.value =
        this.journeyDate.toLocaleDateString('en-GB', options);
    }
  }

  initBusAnimation() {
    gsap.timeline({ repeat: -1, delay: 1 })
      .fromTo('.bus',
        { x: 0, y: 0, scale: 0.98, opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
      .to('.bus', {
        x: '-40vw',
        duration: 5,
        ease: 'none'
      })
      .to('.bus', {
        x: '-80vw',
        y: -2,
        duration: 4,
        ease: 'none'
      })
      .to('.bus', {
        x: '-120vw',
        opacity: 0,
        duration: 2,
        ease: 'none'
      });
  }



  flightSmoothness() {

    gsap.timeline({ repeat: -1 })
      .fromTo('.flight',
        { x: -200, y: 0, rotate: 0, scale: 0.85, opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
      .to('.flight', {
        x: '45vw',
        duration: 3,
        ease: 'none'
      })
      .to('.flight', {
        x: '65vw',
        y: -10,
        rotate: -10,
        duration: 1.5,
        ease: 'power1.out'
      })
      .to('.flight', {
        x: '120vw',
        y: -260,
        rotate: -22,
        scale: 1.05,
        opacity: 0,
        duration: 3,
        ease: 'power1.in'
      });

  }


  // ================= LOAD CITIES =================
  loadCities(): void {
    this.locationService.getCities().subscribe(res => {
      this.allCities = res.data;

      const from = this.allCities.find(c => c.name === this.DEFAULT_FROM);
      const to = this.allCities.find(c => c.name === this.DEFAULT_TO);

      if (from) this.fromCity = from;
      if (to) this.toCity = to;
    });
  }

  // ================= RECENTS =================
  loadRecents(): void {
    this.recentFrom = JSON.parse(localStorage.getItem('recentFrom') || '[]');
    this.recentTo = JSON.parse(localStorage.getItem('recentTo') || '[]');
  }

  saveRecent(type: 'from' | 'to', city: City): void {
    const key = type === 'from' ? 'recentFrom' : 'recentTo';
    const list = type === 'from' ? this.recentFrom : this.recentTo;

    const updated = [city, ...list.filter(c => c.id !== city.id)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));

    if (type === 'from') this.recentFrom = updated;
    else this.recentTo = updated;
  }

  // ================= FROM =================
  onFromFocus(): void {
    this.fromFocused = true;
    this.toFocused = false;

    this.showFromDropdown = false;
    this.showToDropdown = false;
  }

  onFromInput(value: string): void {
    this.fromText = value;

    this.showFromDropdown = true;
    this.showToDropdown = false;

    const recentMatches = this.recentFrom.filter(c =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );

    const otherMatches = this.allCities.filter(
      c =>
        c.name.toLowerCase().includes(value.toLowerCase()) &&
        !recentMatches.some(r => r.id === c.id)
    );

    this.filteredFrom = [...recentMatches, ...otherMatches];
  }

  selectFrom(city: City): void {
    this.fromCity = city;
    this.fromText = city.name;
    this.showFromDropdown = false;
    this.saveRecent('from', city);
  }

  clearFrom(): void {
    this.fromText = '';
    this.fromCity = undefined as any;
  }

  // ================= TO =================
  onToFocus(): void {
    this.toFocused = true;
    this.fromFocused = false;

    this.showToDropdown = false;
    this.showFromDropdown = false;
  }

  onToInput(value: string): void {
    this.toText = value;

    this.showToDropdown = true;
    this.showFromDropdown = false;

    const recentMatches = this.recentTo.filter(c =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );

    const otherMatches = this.allCities.filter(
      c =>
        c.name.toLowerCase().includes(value.toLowerCase()) &&
        !recentMatches.some(r => r.id === c.id)
    );

    this.filteredTo = [...recentMatches, ...otherMatches];
  }

  selectTo(city: City): void {
    this.toCity = city;
    this.toText = city.name;
    this.showToDropdown = false;
    this.saveRecent('to', city);
  }

  clearTo(): void {
    this.toText = '';
    this.toCity = undefined as any;
  }

  // ================= CLICK OUTSIDE =================
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;

    if (!el.closest('.field')) {
      this.showFromDropdown = false;
      this.showToDropdown = false;
      this.fromFocused = false;
      this.toFocused = false;

      if (!this.fromText) this.fromText = this.DEFAULT_FROM;
      if (!this.toText) this.toText = this.DEFAULT_TO;
    }
  }

  // ================= DATE =================
  selectToday() {
    const today = new Date();
    this.setDate(today);
  }

  selectTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.setDate(tomorrow);
  }

  setDate(date: Date) {
    this.journeyDate = date;

    if (this.fpInstance) {
      this.fpInstance.setDate(date, true);
    }

    this.updateDate(date);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  // ================= SEARCH =================
search(): void {
    this.router.navigate(['/search'], {
      queryParams: {
        from: this.fromText,
        to: this.toText,
        date: this.date
      }
    });
  }


  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  private buildSearchId(): string {
  const date = this.date.replace(/-/g, '');

  return [
    'bus',
    this.fromCity.name,
    this.toCity.name,
    date,
    '0', '0', '0', '0',   // placeholders (Goibibo-style flags)
    'GICC1159',           // source code (mock now)
    'GILC2781'            // destination code (mock now)
  ].join('-');
}

}

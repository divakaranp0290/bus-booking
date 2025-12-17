import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import flatpickr from 'flatpickr';
import gsap from 'gsap';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

    @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;
    from = '';
    to = '';
    date = '';
    journeyDate: Date = new Date();
    fpInstance!: flatpickr.Instance;

    selectedDate: 'today' | 'tomorrow' | null = null;

    ngOnInit() {
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

    search() {
        // Sprint-0: just log
        console.log({
            from: this.from,
            to: this.to,
            date: this.date
        });
    }

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

        this.dateInput.nativeElement.value =
            this.journeyDate.toLocaleDateString('en-GB', options);
    }

    isSameDay(a: Date, b: Date): boolean {
        return (
            a.getDate() === b.getDate() &&
            a.getMonth() === b.getMonth() &&
            a.getFullYear() === b.getFullYear()
        );
    }
}

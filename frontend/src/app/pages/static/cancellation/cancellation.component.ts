import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.component.html'
})
export class CancellationComponent implements OnInit {

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Cancellation & Refund Policy | Viaa');
    this.meta.updateTag({
      name: 'description',
      content: 'Understand Viaa’s cancellation and refund policy for bus ticket bookings.'
    });
  }
}

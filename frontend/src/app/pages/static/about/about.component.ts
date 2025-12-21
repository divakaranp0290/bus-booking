import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('About Viaa | Online Bus Ticket Booking Platform');
    this.meta.updateTag({
      name: 'description',
      content: 'Learn about Viaa, an online bus ticket booking platform focused on simple, secure and reliable travel across India.'
    });
  }
}

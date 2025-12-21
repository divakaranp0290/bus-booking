import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html'
})
export class TermsComponent implements OnInit {

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Terms and Conditions | Viaa');
    this.meta.updateTag({
      name: 'description',
      content: 'Read the terms and conditions governing the use of Viaa’s bus ticket booking platform.'
    });
  }
}

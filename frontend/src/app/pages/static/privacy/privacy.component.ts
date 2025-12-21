import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit {

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Privacy Policy | Viaa');
    this.meta.updateTag({
      name: 'description',
      content: 'Read Viaa’s privacy policy to understand how we collect, use and protect your personal information.'
    });
  }
}

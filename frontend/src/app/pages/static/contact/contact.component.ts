import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  successMsg = '';
  errorMsg = '';
  sending = false;

  sendMessage() {
    // Validate inputs
    if (!this.name || !this.email || !this.message) {
      this.errorMsg = '⚠️ Please fill all fields';
      this.successMsg = '';
      return;
    }

    this.sending = true; // optional: disable button while sending

    const templateParams = {
      from_name: this.name,
      from_email: this.email,
      message: this.message
    };

    // ✅ Replace YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY with your EmailJS credentials
    emailjs.send(
      'service_ji8ir7q',
      'template_9wskyca',
      templateParams,
      'OOGUZ_dJmGwynOc87'
    )
    .then(() => {
      this.successMsg = '✅ Message sent successfully!';
      this.errorMsg = '';
      this.name = this.email = this.message = '';
      this.sending = false;
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      this.errorMsg = '❌ Something went wrong. Please try again later.';
      this.successMsg = '';
      this.sending = false;
    });
  }
}
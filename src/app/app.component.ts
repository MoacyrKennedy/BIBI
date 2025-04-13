import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  calendarOutline,
  timeOutline,
  peopleOutline,
  carOutline,
  cashOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ]
})
export class AppComponent {
  constructor() {
    addIcons({
      'location-outline': locationOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'people-outline': peopleOutline,
      'car-outline': carOutline,
      'cash-outline': cashOutline,
      'information-circle-outline': informationCircleOutline
    });
  }
}

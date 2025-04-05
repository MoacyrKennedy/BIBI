import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, personOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.page.html',
  styleUrls: ['./choice.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonButtons
  ],
})
export class ChoicePage {
  constructor(private router: Router) {
    addIcons({
      carOutline,
      personOutline,
      logOutOutline
    });
  }

  offerRide() {
    this.router.navigate(['/create-ride']);
  }

  findRide() {
    console.log('Navegando para pegar-carona');
    this.router.navigate(['/pegar-carona']);
  }

  logout() {
    // Remove os dados do usuário do localStorage
    localStorage.removeItem('user');
    // Redireciona para a página de login
    this.router.navigate(['/login']);
  }
}

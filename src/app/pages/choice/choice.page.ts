import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { carOutline, personOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';

interface User {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  rating: number;
  totalRatings: number;
  userType: 'passageiro' | 'motorista';
  cnh?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleYear?: string;
}

@Component({
  selector: 'app-choice',
  templateUrl: './choice.page.html',
  styleUrls: ['./choice.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class ChoicePage implements OnInit {
  photoUrl: string = 'assets/images/default/avatar-placeholder.png';

  constructor(private router: Router) {
    addIcons({
      carOutline,
      personOutline,
      logOutOutline,
      personCircleOutline
    });
  }

  ngOnInit() {
    // Carrega os dados do usuário do localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user: User = JSON.parse(savedUser);
      if (user.photoUrl) {
        this.photoUrl = user.photoUrl;
      }
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
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

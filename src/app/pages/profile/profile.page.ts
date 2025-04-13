import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonAvatar, IonItem, IonLabel, IonList, IonBackButton, IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonActionSheet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, settingsOutline, logOutOutline, starOutline, cameraOutline, carOutline, imagesOutline, closeOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonButtons,
    IonAvatar,
    IonItem,
    IonLabel,
    IonList,
    IonBackButton,
    IonModal,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonActionSheet
  ],
})
export class ProfilePage implements OnInit {
  isModalOpen = false;
  isActionSheetOpen = false;
  actionSheetButtons = [
    {
      text: 'Tirar Foto',
      icon: 'camera-outline',
      handler: () => {
        this.takePhoto();
        this.isActionSheetOpen = false;
      }
    },
    {
      text: 'Escolher da Galeria',
      icon: 'images-outline',
      handler: () => {
        this.chooseFromGallery();
        this.isActionSheetOpen = false;
      }
    },
    {
      text: 'Cancelar',
      icon: 'close-outline',
      role: 'cancel',
      handler: () => {
        this.isActionSheetOpen = false;
      }
    }
  ];
  user: User = {
    name: 'Usuário Teste',
    email: 'usuario@teste.com',
    phone: '(11) 99999-9999',
    photoUrl: 'assets/images/default/avatar-placeholder.png',
    rating: 4.5,
    totalRatings: 12,
    userType: 'motorista',
    cnh: '123456789',
    vehicleModel: 'Toyota Corolla',
    vehiclePlate: 'ABC-1234',
    vehicleYear: '2020'
  };

  constructor(private router: Router) {
    addIcons({
      personCircleOutline,
      settingsOutline,
      logOutOutline,
      starOutline,
      cameraOutline,
      carOutline,
      imagesOutline,
      closeOutline
    });
  }

  ngOnInit() {
    // Carrega os dados do usuário do localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      console.log('Dados do usuário carregados:', this.user);
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  async changePhoto() {
    this.isActionSheetOpen = true;
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        this.user.photoUrl = image.dataUrl;
        this.saveUserData();
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
    }
  }

  async chooseFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        this.user.photoUrl = image.dataUrl;
        this.saveUserData();
      }
    } catch (error) {
      console.error('Erro ao escolher foto:', error);
    }
  }

  saveUserData() {
    // Salva os dados do usuário no localStorage
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}

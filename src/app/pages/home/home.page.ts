import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonRange,
  IonList,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, cashOutline, locationOutline, searchOutline, chevronBackOutline, calendarOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonRange,
    IonList,
    IonButtons,
    IonBackButton
  ],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement!: ElementRef;
  map: any;
  searchForm: FormGroup;
  maxPrice: number = 100;
  mockRides = [
    {
      origin: 'São Paulo, SP',
      destination: 'Rio de Janeiro, RJ',
      date: '2024-04-10',
      price: 80,
      driver: 'João Silva',
      seats: 3
    },
    {
      origin: 'São Paulo, SP',
      destination: 'Curitiba, PR',
      date: '2024-04-12',
      price: 60,
      driver: 'Maria Oliveira',
      seats: 2
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    addIcons({
      carOutline,
      cashOutline,
      locationOutline,
      searchOutline,
      chevronBackOutline,
      calendarOutline,
      peopleOutline,
      personOutline
    });
    this.searchForm = this.formBuilder.group({
      destination: ['', Validators.required],
      maxPrice: [50, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    if (!this.mapElement?.nativeElement) return;

    const mapOptions = {
      center: { lat: -23.5505, lng: -46.6333 },
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Adiciona o autocomplete para o campo de destino
    const input = document.getElementById('destination-input');
    const autocomplete = new google.maps.places.Autocomplete(input as HTMLInputElement);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(15);

        new google.maps.Marker({
          position: place.geometry.location,
          map: this.map,
          title: place.name
        });
      }
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      console.log('Buscando caronas...', this.searchForm.value);
    }
  }

  formatPrice(value: number): string {
    return `R$ ${value.toFixed(2)}`;
  }

  voltar() {
    this.router.navigate(['/choice']);
  }
}

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonNote,
  IonSpinner,
  IonList,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonTextarea,
  IonText,
  ModalController,
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  locationOutline,
  timeOutline,
  peopleOutline,
  carOutline,
  informationCircleOutline,
  calendarOutline, navigateOutline, checkmarkCircleOutline, airplaneOutline } from 'ionicons/icons';
import { LoadingController, ToastController } from '@ionic/angular';
import { RideService } from '../../services/ride.service';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

declare const L: any;

export interface RideBasicInfo {
  origem: string;
  destino: string;
  data: string;
  hora: string;
  distancia: number;
}

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.page.html',
  styleUrls: ['./create-ride.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonNote,
    IonSpinner,
    IonList,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonTextarea,
    IonText,
    IonDatetimeButton,
    IonModal
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateRidePage implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  @ViewChild('origemInput') origemInput!: ElementRef;
  @ViewChild('destinoInput') destinoInput!: ElementRef;

  map: any = null;
  origemMarker: any = null;
  destinoMarker: any = null;
  geocoder: any = null;
  routeControl: any = null;
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  selectedInput: 'origem' | 'destino' | null = null;
  distancia = 0;

  private rideService = inject(RideService);
  private vehicleService = inject(VehicleService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);

  rideForm: FormGroup;
  veiculos: Vehicle[] = [];
  isSubmitting = false;
  minDate = new Date().toISOString();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
  precoTotal = 0;
  precoMinimo = 0.50;
  precoMaximo = 5.0;
  vagasDisponiveis = [1, 2, 3, 4];
  isLoading = false;

  constructor() {
    addIcons({locationOutline,airplaneOutline,calendarOutline,timeOutline,navigateOutline});

    this.rideForm = this.formBuilder.group({
      origem: ['', [Validators.required, Validators.minLength(3)]],
      destino: ['', [Validators.required, Validators.minLength(3)]],
      data: ['', [Validators.required]],
      hora: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.rideForm.get('data')?.setValidators([
      Validators.required,
      (control) => {
        const selectedDate = new Date(control.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? { dataInvalida: true } : null;
      }
    ]);
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit chamado');
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  initMap() {
    console.log('Iniciando mapa...');

    if (!this.mapElement?.nativeElement) {
      console.error('Elemento do mapa não encontrado');
      return;
    }

    try {
      // Inicializa o mapa
      this.map = L.map(this.mapElement.nativeElement).setView([-15.77972, -47.92972], 4);

      // Adiciona o tile layer do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Inicializa o geocoder
      this.geocoder = new L.Control.Geocoder.Nominatim();

      // Inicializa o controlador de rotas
      if (this.map) {
        this.routeControl = L.Routing.control({
          waypoints: [],
          routeWhileDragging: true,
          lineOptions: {
            styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
          },
          show: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false
        }).addTo(this.map);
      }

      console.log('Mapa criado com sucesso');

      // Força o redimensionamento do mapa
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  onInputChange(event: any, type: 'origem' | 'destino') {
    const value = event.target.value;
    if (value && value.length >= 3) {
      this.searchSuggestions(value);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  async searchSuggestions(query: string) {
    if (!query || query.length < 3) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    try {
      console.log('Buscando sugestões para:', query);

      // Primeiro tenta buscar por CEP
      if (query.replace(/\D/g, '').length >= 8) {
        const cep = query.replace(/\D/g, '');
        const url = `https://viacep.com.br/ws/${cep}/json/`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          if (!data.erro) {
            this.suggestions = [{
              displayName: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
              fullAddress: `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`,
              cep: data.cep,
              lat: null,
              lng: null
            }];
            this.showSuggestions = true;
            return;
          }
        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
          // Continua para a busca por endereço
        }
      }

      // Se não encontrou CEP, busca por endereço usando Mapbox
      const accessToken = 'pk.eyJ1IjoibW9hY3lyIiwiYSI6ImNsd3R5d2R0ZzBkZ2EyaW1xZ2R5d2R0ZzAifQ.1234567890'; // Substitua pelo seu token
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=br&language=pt&access_token=${accessToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error('Resposta inválida da API');
      }

      this.suggestions = data.features.map((feature: any) => {
        const address = feature.place_name_pt;
        const [place, ...rest] = address.split(', ');
        const city = rest.find((part: string) => part.includes('Estado'))?.split(' ')[0] || '';
        const state = rest.find((part: string) => part.includes('Estado'))?.split(' ')[1] || '';

        return {
          displayName: `${place}, ${city} - ${state}`,
          fullAddress: address,
          lat: feature.center[1],
          lng: feature.center[0]
        };
      });

      this.showSuggestions = true;
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: any, type: 'origem' | 'destino') {
    if (type === 'origem') {
      this.rideForm.patchValue({ origem: suggestion.displayName });
      if (suggestion.lat && suggestion.lng) {
        this.updateMarker('origem', { lat: suggestion.lat, lng: suggestion.lng });
      } else {
        // Se não tem coordenadas, busca usando o endereço completo
        this.searchLocation('origem', suggestion.fullAddress);
      }
    } else {
      this.rideForm.patchValue({ destino: suggestion.displayName });
      if (suggestion.lat && suggestion.lng) {
        this.updateMarker('destino', { lat: suggestion.lat, lng: suggestion.lng });
      } else {
        // Se não tem coordenadas, busca usando o endereço completo
        this.searchLocation('destino', suggestion.fullAddress);
      }
    }

    this.suggestions = [];
    this.showSuggestions = false;
  }

  async searchLocation(type: 'origem' | 'destino', query: string) {
    if (!query) return;

    try {
      const accessToken = 'pk.eyJ1IjoibW9hY3lyIiwiYSI6ImNsd3R5d2R0ZzBkZ2EyaW1xZ2R5d2R0ZzAifQ.1234567890'; // Substitua pelo seu token
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=br&limit=1&access_token=${accessToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        this.updateMarker(type, { lat: location.center[1], lng: location.center[0] });
        this.updateRoute();
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
    }
  }

  updateMarker(type: 'origem' | 'destino', location: any) {
    if (!this.map) return;

    console.log(`Atualizando marcador ${type} para:`, location);

    // Remove o marcador existente se houver
    if (type === 'origem' && this.origemMarker) {
      this.map.removeLayer(this.origemMarker);
    } else if (type === 'destino' && this.destinoMarker) {
      this.map.removeLayer(this.destinoMarker);
    }

    // Cria um novo marcador
    const marker = L.marker([location.lat, location.lng], {
      title: type === 'origem' ? 'Origem' : 'Destino'
    }).addTo(this.map);

    // Adiciona popup com o endereço
    marker.bindPopup(type === 'origem' ? this.rideForm.get('origem')?.value : this.rideForm.get('destino')?.value).openPopup();

    // Atualiza a referência do marcador
    if (type === 'origem') {
      this.origemMarker = marker;
    } else {
      this.destinoMarker = marker;
    }

    // Centraliza o mapa no novo marcador
    this.map.setView([location.lat, location.lng], 12);
  }

  updateRoute() {
    if (!this.map || !this.origemMarker || !this.destinoMarker || !this.routeControl) return;

    // Atualiza os waypoints da rota
    this.routeControl.setWaypoints([
      this.origemMarker.getLatLng(),
      this.destinoMarker.getLatLng()
    ]);

    // Ajusta o zoom para mostrar toda a rota
    const bounds = L.latLngBounds([
      this.origemMarker.getLatLng(),
      this.destinoMarker.getLatLng()
    ]);
    this.map.fitBounds(bounds);

    // Calcula a distância entre os pontos
    this.routeControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        this.distancia = routes[0].summary.totalDistance / 1000; // Converte para km
      }
    });
  }

  onInputBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  private calcularPrecoTotal() {
    const precoKm = this.rideForm.get('precoKm')?.value || 0;
    this.precoTotal = this.distancia * precoKm;
  }

  async carregarVeiculos() {
    try {
      const response = await this.vehicleService.getUserVehicles();
      this.veiculos = response as Vehicle[];
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      await this.mostrarMensagem('Erro ao carregar veículos. Tente novamente.', 'danger');
    }
  }

  private async mostrarMensagem(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor
    });
    await toast.present();
  }

  async onSubmit() {
    if (this.rideForm.invalid) {
      return;
    }

    const formValue = this.rideForm.value;
    const rideInfo: RideBasicInfo = {
      ...formValue,
      data: new Date(formValue.data).toISOString(),
      distancia: this.distancia
    };

    // Navegar para a próxima página com os dados básicos
    this.router.navigate(['/ride-details'], {
      state: { rideInfo }
    });
  }

  async abrirSeletorData() {
    const modal = await this.modalCtrl.create({
      component: IonDatetime,
      componentProps: {
        presentation: 'date',
        min: this.minDate,
        max: this.maxDate,
        locale: 'pt-BR',
        firstDayOfWeek: 0,
        value: this.rideForm.get('data')?.value || this.minDate,
        color: 'dark',
        cssClass: 'datetime-modal'
      },
      cssClass: 'datetime-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.value) {
      this.rideForm.patchValue({ data: data.value });
    }
  }

  async abrirSeletorHora() {
    const modal = await this.modalCtrl.create({
      component: IonDatetime,
      componentProps: {
        presentation: 'time',
        locale: 'pt-BR',
        minuteValues: '0,15,30,45',
        value: this.rideForm.get('hora')?.value || new Date().toISOString(),
        color: 'dark',
        cssClass: 'datetime-modal'
      },
      cssClass: 'datetime-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.value) {
      this.rideForm.patchValue({ hora: data.value });
    }
  }
}

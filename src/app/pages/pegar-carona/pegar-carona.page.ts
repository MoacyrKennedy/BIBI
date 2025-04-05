import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

declare const L: any;

@Component({
  selector: 'app-pegar-carona',
  templateUrl: './pegar-carona.page.html',
  styleUrls: ['./pegar-carona.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonBackButton,
    IonButtons
  ]
})
export class PegarCaronaPage implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  @ViewChild('origemInput') origemInput!: ElementRef;
  @ViewChild('destinoInput') destinoInput!: ElementRef;

  map: any = null;
  origem: string = '';
  destino: string = '';
  data: string = '';
  hora: string = '';
  origemMarker: any = null;
  destinoMarker: any = null;
  geocoder: any = null;
  routeControl: any = null;
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  selectedInput: 'origem' | 'destino' | null = null;

  constructor(@Inject(Router) private router: Router) {
    console.log('PegarCaronaPage construída');
  }

  ngOnInit() {
    console.log('PegarCaronaPage inicializada');
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
      this.origem = suggestion.displayName;
      if (suggestion.lat && suggestion.lng) {
        this.updateMarker('origem', { lat: suggestion.lat, lng: suggestion.lng });
      } else {
        // Se não tem coordenadas, busca usando o endereço completo
        this.searchLocation('origem', suggestion.fullAddress);
      }
    } else {
      this.destino = suggestion.displayName;
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
    marker.bindPopup(type === 'origem' ? this.origem : this.destino).openPopup();

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
  }

  buscarCaronas() {
    if (this.origem && this.destino && this.data && this.hora) {
      console.log('Buscando caronas...');
      console.log('Origem:', this.origem);
      console.log('Destino:', this.destino);
      console.log('Data:', this.data);
      console.log('Hora:', this.hora);
    } else {
      console.log('Por favor, preencha todos os campos');
    }
  }

  voltar() {
    this.router.navigate(['/choice']);
  }

  onInputBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}

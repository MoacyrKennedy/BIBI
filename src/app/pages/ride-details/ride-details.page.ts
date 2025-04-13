import { Component, OnInit, inject } from '@angular/core';
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
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  peopleOutline,
  carOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { RideService } from '../../services/ride.service';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { RideBasicInfo } from '../create-ride/create-ride.page';

interface RideDetails {
  vagas: number;
  precoKm: number;
  veiculo: string;
  observacoes?: string;
}

@Component({
  selector: 'app-ride-details',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/create-ride"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalhes da Carona</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <form [formGroup]="detailsForm" (ngSubmit)="onSubmit()">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Número de Vagas</ion-label>
            <ion-input
              formControlName="vagas"
              type="number"
              required
              placeholder="Número de vagas"
              min="1"
              max="4"
            >
              <ion-icon name="people-outline" slot="start"></ion-icon>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Preço por KM</ion-label>
            <ion-input
              formControlName="precoKm"
              type="number"
              required
              placeholder="Preço por KM (R$)"
              min="0.5"
              max="5.0"
            >
              <ion-icon name="cash-outline" slot="start"></ion-icon>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Veículo</ion-label>
            <ion-select
              formControlName="veiculo"
              interface="action-sheet"
              placeholder="Selecione o veículo"
              required
            >
              <ion-select-option *ngFor="let veiculo of veiculos" [value]="veiculo.id">
                {{veiculo.modelo}} - {{veiculo.placa}}
              </ion-select-option>
            </ion-select>
            <ion-icon name="car-outline" slot="start"></ion-icon>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Observações</ion-label>
            <ion-textarea
              formControlName="observacoes"
              placeholder="Observações (opcional)"
              rows="3"
            >
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
            </ion-textarea>
          </ion-item>
        </ion-list>

        <div class="price-summary" *ngIf="precoTotal > 0">
          <p>Distância total: {{distancia?.toFixed(2)}} km</p>
          <p>Preço total estimado: R$ {{precoTotal?.toFixed(2)}}</p>
        </div>

        <ion-button expand="block" type="submit" [disabled]="!detailsForm.valid || isSubmitting">
          CONFIRMAR CARONA
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    .price-summary {
      margin: 20px;
      padding: 15px;
      background: #f8f8f8;
      border-radius: 10px;
      text-align: center;

      p {
        margin: 5px 0;
        color: #333;
        font-size: 1.1em;
      }
    }

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 16px;
    }

    ion-button {
      margin: 20px;
    }
  `],
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
    IonList,
    IonSelect,
    IonSelectOption,
    IonTextarea
  ]
})
export class RideDetailsPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private rideService = inject(RideService);
  private vehicleService = inject(VehicleService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  detailsForm: FormGroup;
  veiculos: Vehicle[] = [];
  isSubmitting = false;
  rideInfo?: RideBasicInfo;
  precoTotal = 0;
  distancia = 0;

  constructor() {
    addIcons({ cashOutline, peopleOutline, carOutline, informationCircleOutline });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.rideInfo = navigation.extras.state['rideInfo'];
      this.distancia = this.rideInfo?.distancia || 0;
    }

    this.detailsForm = this.formBuilder.group({
      vagas: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      precoKm: [0.50, [Validators.required, Validators.min(0.5), Validators.max(5.0)]],
      veiculo: ['', Validators.required],
      observacoes: ['']
    });

    this.detailsForm.get('precoKm')?.valueChanges.subscribe(value => {
      this.calcularPrecoTotal(value);
    });
  }

  async ngOnInit() {
    if (!this.rideInfo) {
      this.router.navigate(['/create-ride']);
      return;
    }

    await this.carregarVeiculos();
    this.calcularPrecoTotal(this.detailsForm.get('precoKm')?.value);
  }

  private calcularPrecoTotal(precoKm: number) {
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
    if (this.detailsForm.invalid || !this.rideInfo) {
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Criando carona...'
    });
    await loading.present();

    try {
      const formValue = this.detailsForm.value;
      const dadosCarona = {
        ...this.rideInfo,
        ...formValue,
        precoTotal: this.precoTotal
      };

      await this.rideService.createRide(dadosCarona);
      await this.mostrarMensagem('Carona criada com sucesso!', 'success');
      this.router.navigate(['/tabs/rides']);
    } catch (error) {
      console.error('Erro ao criar carona:', error);
      await this.mostrarMensagem('Erro ao criar carona. Tente novamente.', 'danger');
    } finally {
      this.isSubmitting = false;
      await loading.dismiss();
    }
  }
}

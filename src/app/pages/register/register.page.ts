import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isDriver = false;
  isLoading = false;
  photoUrl: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['passenger', [Validators.required]],
      // Campos opcionais para motorista
      cnh: [''],
      vehicleModel: [''],
      vehiclePlate: [''],
      vehicleYear: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Adiciona validadores condicionais para campos de motorista
    this.registerForm.get('userType')?.valueChanges.subscribe(type => {
      this.isDriver = type === 'driver';
      const driverControls = ['cnh', 'vehicleModel', 'vehiclePlate', 'vehicleYear'];

      if (this.isDriver) {
        driverControls.forEach(control => {
          this.registerForm.get(control)?.setValidators([Validators.required]);
        });
      } else {
        driverControls.forEach(control => {
          this.registerForm.get(control)?.clearValidators();
        });
      }

      driverControls.forEach(control => {
        this.registerForm.get(control)?.updateValueAndValidity();
      });
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  async selectPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      this.photoUrl = image.dataUrl;
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      this.showToast('Erro ao selecionar foto. Tente novamente.');
    }
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      try {
        const loading = await this.loadingCtrl.create({
          message: 'Registrando...'
        });
        await loading.present();

        // TODO: Implementar lógica de registro com o backend
        const formData = {
          ...this.registerForm.value,
          photo: this.photoUrl
        };

        console.log('Dados do formulário:', formData);

        // Simular delay do backend
        await new Promise(resolve => setTimeout(resolve, 2000));

        await loading.dismiss();
        await this.showToast('Registro realizado com sucesso!');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Erro no registro:', error);
        this.showToast('Erro ao realizar registro. Tente novamente.');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.showToast('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  onUserTypeChange(event: any) {
    this.isDriver = event.detail.value === 'driver';
  }

  // Funções para formatação de campos
  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
    }
    event.target.value = value;
  }

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    }
    event.target.value = value;
  }

  formatPlate(event: any) {
    let value = event.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    if (value.length > 7) value = value.slice(0, 7);
    if (value.length > 3) {
      value = value.replace(/^([A-Z]{3})(\d{4}).*/, '$1-$2');
    }
    event.target.value = value;
  }
}

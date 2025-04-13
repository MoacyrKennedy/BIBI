import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { camera, personCircle, personOutline, carOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ camera, personCircle, personOutline, carOutline });
    this.createForm();
  }

  registerForm: FormGroup;
  userType: 'passenger' | 'driver' = 'passenger';
  photo: string | null = null;
  isLoading = false;
  photoUrl = 'assets/images/profile-placeholder.png';
  currentYear = new Date().getFullYear();

  validationMessages = {
    name: {
      required: 'Nome é obrigatório',
      minlength: 'Nome deve ter no mínimo 3 caracteres'
    },
    cpf: {
      required: 'CPF é obrigatório',
      pattern: 'CPF inválido'
    },
    email: {
      required: 'E-mail é obrigatório',
      email: 'E-mail inválido'
    },
    phone: {
      required: 'Telefone é obrigatório',
      pattern: 'Telefone inválido'
    },
    password: {
      required: 'Senha é obrigatória',
      minlength: 'Senha deve ter no mínimo 6 caracteres'
    },
    confirmPassword: {
      required: 'Confirmação de senha é obrigatória',
      passwordMismatch: 'As senhas não conferem'
    },
    cnh: {
      required: 'CNH é obrigatória',
      pattern: 'CNH inválida'
    },
    vehicleModel: {
      required: 'Modelo do veículo é obrigatório'
    },
    vehiclePlate: {
      required: 'Placa do veículo é obrigatória',
      pattern: 'Placa inválida'
    },
    vehicleYear: {
      required: 'Ano do veículo é obrigatório',
      min: 'Ano inválido',
      max: 'Ano inválido'
    }
  };

  ngOnInit() {}

  createForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      vehicleModel: [''],
      vehiclePlate: [''],
      vehicleColor: [''],
      vehicleYear: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      this.photo = image.dataUrl;
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
    }
  }

  async register() {
    if (this.registerForm.valid) {
      try {
        const formData = {
          ...this.registerForm.value,
          userType: this.userType,
          photo: this.photo
        };

        await this.authService.register(formData);
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Erro no registro:', error);
      }
    }
  }

  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    this.registerForm.patchValue({ cpf: value });
  }

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    this.registerForm.patchValue({ phone: value });
  }

  formatPlate(event: any) {
    let value = event.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    if (value.length > 7) {
      value = value.substring(0, 7);
    }
    if (value.length > 3) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    }
    this.registerForm.patchValue({ vehiclePlate: value });
  }

  onUserTypeChange(event: any) {
    this.userType = event.detail.value;
    if (this.userType === 'passenger') {
      this.registerForm.get('vehiclePlate')?.clearValidators();
      this.registerForm.get('vehicleModel')?.clearValidators();
      this.registerForm.get('vehicleColor')?.clearValidators();
    } else {
      this.registerForm.get('vehiclePlate')?.setValidators([Validators.required]);
      this.registerForm.get('vehicleModel')?.setValidators([Validators.required]);
      this.registerForm.get('vehicleColor')?.setValidators([Validators.required]);
    }
    this.registerForm.get('vehiclePlate')?.updateValueAndValidity();
    this.registerForm.get('vehicleModel')?.updateValueAndValidity();
    this.registerForm.get('vehicleColor')?.updateValueAndValidity();
  }

  async selectPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      this.photo = image.dataUrl;
      this.photoUrl = image.dataUrl;
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao selecionar foto. Tente novamente.',
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      try {
        const formData = {
          ...this.registerForm.value,
          userType: this.userType,
          photo: this.photo
        };

        await this.authService.register(formData);
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Erro no registro:', error);
        const toast = await this.toastCtrl.create({
          message: 'Erro ao realizar cadastro. Tente novamente.',
          duration: 3000,
          position: 'bottom'
        });
        await toast.present();
      } finally {
        this.isLoading = false;
      }
    }
  }
}

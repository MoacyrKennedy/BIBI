import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  playHornSound() {
    // Implementação do som da buzina
    console.log('Buzina tocada!');
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...'
    });
    await loading.present();

    const { email, senha } = this.loginForm.value;

    this.authService.login(email, senha).subscribe({
      next: async (user) => {
        await this.mostrarMensagem('Login realizado com sucesso!', 'success');
        this.router.navigate(['/choice']);
      },
      error: async (error) => {
        console.error('Erro durante o login:', error);
        await this.mostrarMensagem('Email ou senha inválidos', 'danger');
      },
      complete: () => {
        this.isSubmitting = false;
        loading.dismiss();
      }
    });
  }

  private async mostrarMensagem(mensagem: string, cor: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor
    });
    await toast.present();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

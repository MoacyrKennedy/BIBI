import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonSpinner,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  audioContext: AudioContext | null = null;
  isPlaying: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Inicializa o contexto de áudio e toca o som
    this.initAudio().then(() => {
      setTimeout(() => {
        this.playBibi();
      }, 500);
    }).catch(error => {
      console.error('Erro ao inicializar áudio:', error);
    });
  }

  async initAudio() {
    try {
      // Verifica se o navegador suporta Web Audio API
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('Web Audio API não suportada neste navegador');
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Tenta resumir o contexto se estiver suspenso
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
    }
  }

  async playBibi() {
    if (!this.audioContext) {
      await this.initAudio();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (!this.audioContext || this.isPlaying) return;

    try {
      this.isPlaying = true;

      // Criar osciladores para o som "bi-bi"
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configurar os osciladores para um som mais agudo e "amigável"
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 880; // Lá5 (A5)
      osc2.frequency.value = 987.77; // Si5 (B5)
      gainNode.gain.value = 0;

      // Conectar os nós
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Programar o envelope do som
      const now = this.audioContext.currentTime;
      const duration = 0.15; // Duração mais curta para cada "bi"
      const gap = 0.1; // Espaço entre os "bis"

      // Primeiro "bi"
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Segundo "bi"
      gainNode.gain.setValueAtTime(0, now + duration + gap);
      gainNode.gain.linearRampToValueAtTime(0.2, now + duration + gap + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + (duration * 2) + gap);

      // Iniciar os osciladores
      osc1.start(now);
      osc2.start(now);

      // Parar os osciladores
      const stopTime = now + (duration * 2) + gap;
      osc1.stop(stopTime);
      osc2.stop(stopTime);

      // Limpar flag de reprodução
      setTimeout(() => {
        this.isPlaying = false;
      }, (duration * 2 + gap) * 1000);

    } catch (error) {
      console.error('Erro ao tocar som:', error);
      this.isPlaying = false;
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Simulação de autenticação
      setTimeout(() => {
        try {
          const { email, password } = this.loginForm.value;

          if (email === 'teste@bibi.com' && password === '123456') {
            // Armazena dados do usuário de forma segura
            const userData = {
              email,
              name: 'Usuário Teste',
              lastLogin: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(userData));
            this.router.navigate(['/choice']);
          } else {
            this.errorMessage = 'Email ou senha inválidos';
            this.isLoading = false;
          }
        } catch (error) {
          console.error('Erro durante o login:', error);
          this.errorMessage = 'Ocorreu um erro durante o login. Tente novamente.';
          this.isLoading = false;
        }
      }, 1500);
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

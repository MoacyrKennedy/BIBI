import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@teste.com',
      telefone: '(11) 99999-9999'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@teste.com',
      telefone: '(11) 98888-8888'
    },
    {
      id: '3',
      nome: 'Usuário Teste',
      email: 'teste@bibi.com',
      telefone: '(11) 97777-7777'
    }
  ];

  constructor() {
    // Verifica se existe um usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, senha: string): Observable<User> {
    return new Observable(subscriber => {
      // Simula um delay de 1 segundo
      setTimeout(() => {
        // Aceita qualquer email e senha
        const user = {
          id: '1',
          nome: 'Usuário Teste',
          email: email,
          telefone: '(11) 99999-9999'
        };

        // Salva o usuário no localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);

        subscriber.next(user);
        subscriber.complete();
      }, 1000);
    });
  }

  register(userData: any): Observable<User> {
    return new Observable(subscriber => {
      setTimeout(() => {
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          nome: userData.nome,
          email: userData.email,
          telefone: userData.telefone
        };

        this.mockUsers.push(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);

        subscriber.next(newUser);
        subscriber.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

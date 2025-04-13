import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  async getUserProfile() {
    return this.http.get(`${this.apiUrl}/profile`).toPromise();
  }

  async updateUserProfile(profileData: any) {
    return this.http.put(`${this.apiUrl}/profile`, profileData).toPromise();
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = `${environment.apiUrl}/rides`;
  private http = inject(HttpClient);

  async createRide(rideData: any) {
    return this.http.post(this.apiUrl, rideData).toPromise();
  }

  async getUserRides() {
    return this.http.get(`${this.apiUrl}/user`).toPromise();
  }

  async getAvailableRides() {
    return this.http.get(`${this.apiUrl}/available`).toPromise();
  }
}

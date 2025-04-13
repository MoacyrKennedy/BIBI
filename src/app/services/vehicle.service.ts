import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) { }

  async getUserVehicles(): Promise<Vehicle[]> {
    // Dados mockados temporariamente
    return [
      {
        id: '1',
        modelo: 'Gol',
        placa: 'ABC-1234',
        cor: 'Prata',
        ano: 2020,
        userId: '1'
      },
      {
        id: '2',
        modelo: 'Uno',
        placa: 'DEF-5678',
        cor: 'Preto',
        ano: 2019,
        userId: '1'
      }
    ];
  }

  async createVehicle(vehicleData: any) {
    return this.http.post(this.apiUrl, vehicleData).toPromise();
  }
}

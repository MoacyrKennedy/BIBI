export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  userType: 'passageiro' | 'motorista';
  photo?: string;
  cnh?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleYear?: number;
  rating?: number;
  totalRatings?: number;
  lastLogin?: string;
}

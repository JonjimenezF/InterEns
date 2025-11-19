import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://54.210.35.66:4000/api';

  async enviarConfirmacionIntercambio(datos: {
    correoComprador: string;
    correoVendedor: string;
    nombreComprador: string;
    nombreVendedor: string;
    productoNombre: string;
    valorPuntos: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/confirmar-intercambio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error enviando correos:', error);
      throw error;
    }
  }
}
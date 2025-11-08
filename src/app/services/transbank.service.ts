// import { Injectable } from '@angular/core';
// import { Browser } from '@capacitor/browser';
// import { App } from '@capacitor/app';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class TransbankService {
//   private readonly API_URL = 'http://localhost:4000/api/transbank';

//   constructor(private router: Router) {
//     this.setupAppUrlListener();
//   }

//   async crearTransaccion(usuarioId: string, puntos: number, monto: number) {
//     if (!usuarioId || puntos <= 0 || monto <= 0) {
//       throw new Error('Parámetros inválidos');
//     }

//     try {
//       const response = await fetch(`${this.API_URL}/crear-transaccion`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ usuario_id: usuarioId, puntos, monto })
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Error creando transacción');
//       }

//       if (!result.success) {
//         throw new Error(result.error || 'Transacción no exitosa');
//       }

//       return result;
//     } catch (error: any) {
//       console.error('Error en crearTransaccion:', error);
//       throw new Error(error.message || 'Error de conexión');
//     }
//   }

//   async abrirWebpay(url: string, token: string) {
//     try {
//       const webpayUrl = url.includes('simulate=true') 
//         ? `${this.API_URL}/simular-pago/${token}?return_url=${encodeURIComponent('interens://transbank-return')}`
//         : `${url}?token_ws=${token}`;

//       console.log('Abriendo Webpay:', webpayUrl);

//       await Browser.open({
//         url: webpayUrl,
//         windowName: '_system'
//       });
//     } catch (error) {
//       console.error('Error abriendo Webpay:', error);
//       throw new Error('No se pudo abrir Webpay');
//     }
//   }

//   async consultarEstado(token: string) {
//     if (!token) {
//       throw new Error('Token requerido');
//     }

//     try {
//       const response = await fetch(`${this.API_URL}/estado/${token}`);
//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Error consultando estado');
//       }

//       return result;
//     } catch (error: any) {
//       console.error('Error consultando estado:', error);
//       throw new Error(error.message || 'Error de conexión');
//     }
//   }

//   private setupAppUrlListener() {
//     App.addListener('appUrlOpen', (event) => {
//       const url = new URL(event.url);
//       if (url.pathname.includes('transbank-return')) {
//         this.handleTransbankReturn(url.searchParams);
//       }
//     });
//   }

//   private handleTransbankReturn(params: URLSearchParams) {
//     const token = params.get('token') || params.get('token_ws');
//     const success = params.get('success');
//     const puntos = params.get('puntos');
//     const error = params.get('error');

//     console.log('Retorno de Transbank:', { token, success, puntos, error });

//     // Navegar a la página de compra con parámetros
//     this.router.navigate(['/comprar-puntos'], {
//       queryParams: { token, success, puntos, error }
//     });
//   }
// }
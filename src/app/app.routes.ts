import { Routes } from '@angular/router';
<<<<<<< HEAD

=======
>>>>>>> c9cb36395b102f49e4900f4d3c3ac1ef8768ecd7

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'portada',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },

  {
    path: 'portada',
    loadComponent: () => import('./portada/portada.page').then( m => m.PortadaPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'producto',
    loadComponent: () => import('./producto/producto.page').then( m => m.ProductoPage)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./recuperar/recuperar.page').then( m => m.RecuperarPage)
  },
  {
    path: 'verificarcontra',
    loadComponent: () => import('./verificarcontra/verificarcontra.page').then( m => m.VerificarcontraPage)
  },

  {
    path: 'mostar',
    loadComponent: () => import('./mostar/mostar.page').then( m => m.MostarPage)
  },
  {
    path: 'sfoto',
    loadComponent: () => import('./sfoto/sfoto.page').then( m => m.SfotoPage)
  },
  {
    path: 'registrar',
    loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage)
  }

  {
    path: 'registrar',
    loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage)
  },


 

  


];

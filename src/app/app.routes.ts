// <<<<<<< HEAD
// import { Routes } from '@angular/router';
// import { NgModule } from '@angular/core';
// import { RouterModule } from '@angular/router';

// ///import { RecuperarPage } from './recuperar/recuperar.page';

// export const routes: Routes = [
//   {
//     path: 'home',
//     loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    
//   },
 
//   {    
//     path: '',
//     redirectTo: 'portada',
//     pathMatch: 'full',
//   },
//   {
//     path: 'login',
//     loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
//   },

//   {
//     path: 'portada',
//     loadComponent: () => import('./portada/portada.page').then( m => m.PortadaPage)
//   },
//   {
//     path: 'perfil',
//     loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
//   },
//   {
//     path: 'producto',
//     loadComponent: () => import('./producto/producto.page').then( m => m.ProductoPage)
//   },
//   {
//     path: 'recuperar',
//     loadComponent: () => import('./recuperar/recuperar.page').then( m => m.RecuperarPage)
//   },
//   {
//     path: 'verificarcontra',
//     loadComponent: () => import('./verificarcontra/verificarcontra.page').then( m => m.VerificarcontraPage)
//   },
//   {
//     path: 'sfoto',
//     loadComponent: () => import('./sfoto/sfoto.page').then( m => m.SfotoPage)
//   },
//   {
//     path: 'registrar',
//     loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage)
//   },
//   {
//     path: 'detalle-producto',
//     loadComponent: () => import('./detalle-producto/detalle-producto.page').then( m => m.DetalleProductoPage)
//   },
//   {
//     path: 'sproducto',
//     loadComponent: () => import('./sproducto/sproducto.page').then( m => m.SproductoPage)
//   },
//   {
//     path: 'carrito',
//     loadComponent: () => import('./carrito/carrito.page').then( m => m.CarritoPage)
//   },
  
//   {
//     path: 'preguntas',
//     loadComponent: () => import('./preguntas/preguntas.page').then( m => m.PreguntasPage)
//   },
//   {
//     path: 'contacto',
//     loadComponent: () => import('./contacto/contacto.page').then( m => m.ContactoPage)
//   },
//   {
//     path: 'mis-productos',
//     loadComponent: () => import('./mis-productos/mis-productos.page').then( m => m.MisProductosPage)
//   },
//   {
//     path: 'puntos',
//     loadComponent: () => import('./puntos/puntos.page').then( m => m.PuntosPage)
//   },
//   {
//     path: 'canjear-puntos',
//     loadComponent: () => import('./canjear-puntos/canjear-puntos.page').then( m => m.CanjearPuntosPage)
//   },
//   {
//     path: 'historial-puntos',
//     loadComponent: () => import('./historial-puntos/historial-puntos.page').then( m => m.HistorialPuntosPage)
//   }

 
// ];
// =======
import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthCallbackPage } from './auth-callback/auth-callback.page';


///import { RecuperarPage } from './recuperar/recuperar.page';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    
  },

  { path: 'auth/callback', component: AuthCallbackPage },

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
  
  //   path: 'sfoto',
  //   loadComponent: () => import('./sfoto/sfoto.page').then( m => m.SfotoPage)
  // },
  {
    path: 'registrar',
    loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage)
  },
  {
   path: 'detalle-producto',
   loadComponent: () => import('./detalle-producto/detalle-producto.page').then( m => m.DetalleProductoPage)
   },
  {
    path: 'sproducto',
    loadComponent: () => import('./sproducto/sproducto.page').then( m => m.SproductoPage)
  },
  // {
  //   path: 'carrito',
  //   loadComponent: () => import('./carrito/carrito.page').then( m => m.CarritoPage)
  // },
  //{
  //   path: 'categoria',
  //   loadComponent: () => import('./categoria/categoria.page').then( m => m.CategoriaPage)
  // },
  {
    path: 'preguntas',
    loadComponent: () => import('./preguntas/preguntas.page').then( m => m.PreguntasPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./contacto/contacto.page').then( m => m.ContactoPage)
  },
  // {
  //   path: 'mis-productos',
  //   loadComponent: () => import('./mis-productos/mis-productos.page').then( m => m.MisProductosPage)
  // },
  {
  path: 'puntos',
  loadComponent: () => import('./puntos/puntos.page').then(m => m.PuntosPage)
},
{
  path: 'canjear-puntos',
  loadComponent: () => import('./canjear-puntos/canjear-puntos.page').then(m => m.CanjearPuntosPage)
},
{
  path: 'historial-puntos',
  loadComponent: () => import('./historial-puntos/historial-puntos.page').then(m => m.HistorialPuntosPage)
},
  {
    path: 'edit-perfil',
    loadComponent: () => import('./edit-perfil/edit-perfil.page').then( m => m.EditPerfilPage)
  },

  // {
  //   path: 'que-es',
  //   loadComponent: () => import('./que-es/que-es.page').then( m => m.QueEsPage)
  // },
  // {
  //   path: 'reciclaje',
  //   loadComponent: () => import('./reciclaje/reciclaje.page').then( m => m.ReciclajePage)
  // },
];


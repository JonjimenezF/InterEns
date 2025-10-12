

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {

  selectedTab: string = 'productos'; // 👈 inicializamos en "productos"

  constructor(private router: Router) { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const products = document.querySelectorAll('.product');

      products.forEach(product => {
        product.addEventListener('click', () => {
          alert(`Producto seleccionado: ${product.querySelector('h2')?.textContent}`);
        });
      });
    });
  }

  goProducto(): void {
    this.router.navigate(['/producto']);
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  perfil(): void {
    this.router.navigate(['/perfil']);
  }

  salir(): void {
    // Acción al salir
  }

  puntoLimpio(): void {
    // Acción al ir a punto limpio
  }

  
}

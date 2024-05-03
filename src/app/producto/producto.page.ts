import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductoPage implements OnInit {
 
  constructor(private router: Router,public actionSheetController: ActionSheetController) {}

  producto={
    descripcion: "",
    precio: "",
    foto: "",
  }
  ngOnInit() {
  }

  async openFilterMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtro de Búsqueda',
      backdropDismiss: false,
      cssClass: 'color',
      buttons: [
        {
          text: 'Orden',
          role: 'button',
          
        },
        {
          text: 'Puntuación',
          role: 'button',
          
        },
        {
          text: 'Categoría',
          role: 'button',

        },
        {
          text: 'Cerrar',
          role: 'cancel',
          
        }
      ]
    });
    await actionSheet.present();
  }
  


  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProducto(){
    this.router.navigate(['/producto']);
  }

  home(){
    this.router.navigate(['/home']);
  }

  perfil(){
    this.router.navigate(['/perfil']);
  }

  salir(){

  }
  puntoLimpio(){

  }

}

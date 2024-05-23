import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss']
})
export class CategoriaPage implements OnInit {
  categorias: { id: string, nombre: string }[] = [
    { id: "1", nombre: "Tecnologia" },
    { id: "2", nombre: "Decoracion" },
    { id: "3", nombre: "Cocina y Baño" },
    { id: "4", nombre: "Muebles y Organizacion" },
    { id: "5", nombre: "Herramientas y Maquinaria" },
    { id: "6", nombre: "Dormitorio" },
    { id: "7", nombre: "Electrohogar" },
  ];

  constructor() {
 
}

  ngOnInit() {

  }

}

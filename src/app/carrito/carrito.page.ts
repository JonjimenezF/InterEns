import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CarritoPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
  }





  goBack() {
    this.navCtrl.back();
  }

  
  goProducto(){
    this.router.navigate(['/producto'])
  }

}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { UsuarioService } from '../servicios/usuario.service';
import { producto } from '../models/producto';

@Component({
  selector: 'app-sproducto',
  templateUrl: './sproducto.page.html',
  styleUrls: ['./sproducto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SproductoPage implements OnInit {

  nombreFoto: string | undefined;
  userInfo?: any;
  selectedFile: File | null = null;

  produc = {
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_usuario:" ",
  }

  constructor(
              private http: HttpClient,
              private router: Router,
              private activateRoute: ActivatedRoute,
              public toastController: ToastController,
              private productService: ProductoService,
              private navCtrl: NavController,
              private UsuarioService: UsuarioService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
   }


  
  ngOnInit() {
    if (this.userInfo) {
      console.log(this.userInfo);
    } else {
      console.log('El objeto userInfo es null o undefined');
    }
    console.log(this.getCategoria())
    
  }

  onSubmit(product: producto) {
    this.produc.id_usuario = this.userInfo.id_usuario;
    this.productService.addProduct(product).subscribe({
      next: (response: any) => {
        // Mostrar mensaje de éxito
        console.log(response)
        this.presentToast('Registro exitoso.', 3000);

        // Redirigir a la página de inicio después de mostrar el mensaje
        setTimeout(() => {
          console.log("exito")
          this.router.navigate(['/sfoto'], { state: { creadoProducto: response.id_producto}})
        }, 3200); // Esperar un poco más que la duración del toast para garantizar que el usuario vea el mensaje
      },
      error: (error: any) => {
        console.error('Error al registrar el producto:', error);
        this.presentToast('Error al registrar el producto. Inténtalo de nuevo.');
      }
    });

  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  eliminarFoto(nombreFoto: string) {
    this.http.delete<any>(`http://localhost:5000/eliminar_foto/${nombreFoto}`).subscribe(
      (response) => {
        console.log(response);
        alert('Foto eliminada correctamente');
        this.nombreFoto = '';
      },
      (error) => {
        console.error(error);
        alert('Error al eliminar la foto');
      }
    );
  }

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  goBack() {
    this.navCtrl.back();
  }

  categorias: any[] = [];
  getCategoria() {
    this.UsuarioService.getTodasCategoria().subscribe(
      (data) => {
        this.categorias = data;
        console.log('Categorias:', this.categorias);
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }
}

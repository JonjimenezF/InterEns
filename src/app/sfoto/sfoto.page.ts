import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { producto } from '../models/producto';
import { categoria} from '../models/categoria';
import { CategoriaService } from '../servicios/categoria.service'; 



@Component({
  selector: 'app-sfoto',
  templateUrl: './sfoto.page.html',
  styleUrls: ['./sfoto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
  
})
export class SfotoPage implements OnInit {

  categorias: any[] = [];
 

  produc = {
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagp: " ",
    id_usuario: "",
    id_categoria: ""
  }

  selectedFile: File | null = null;
  nombreFoto: string | undefined;

  userInfo?: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public toastController: ToastController,
    private productService: ProductoService,
    private navCtrl: NavController,
    private categoriaService: CategoriaService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  async ngOnInit() {
    if (this.userInfo) {
      console.log(this.userInfo.id_usuario);
    } else {
      console.log('El objeto userInfo es null o undefined');
    }

    this.categoriaService.getCategorias().subscribe(
      (categorias: any[]) => {
        this.categorias = categorias;
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(pro: any) {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('foto', this.selectedFile);
      this.http.post<any>('http://localhost:5000/upload', formData).subscribe(
        (response) => {
          console.log(response);
          this.presentToast('Imagen subida con éxito');
          this.nombreFoto = response.nombre_foto;
          this.produc.imagp = response.nombre_foto;
          this.produc.id_usuario = this.userInfo.id_usuario;
          console.log(this.produc);
          // Agregar el producto
          this.productService.addProduct(pro).subscribe(
            (response) => {
              this.presentToast('producto subido con éxito');
              this.navCtrl.navigateRoot('/home');
          },
          (error) => {
            console.error(error);
            alert('Error al subir la Producto');
          }
          );
        },
        (error) => {
          console.error(error);
          alert('Error al subir la imagen');
        }
      );
    }
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

  
  obtenerCategorias() {
    this.categoriaService.getCategorias().subscribe(
      (categorias: any[]) => {
        this.categorias = categorias;
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
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

  goBack() {
    this.navCtrl.back();
  }
}

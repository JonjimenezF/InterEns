import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { UsuarioService } from '../servicios/usuario.service';
import { producto } from '../models/producto';
import { CategoriaService } from '../servicios/categoria.service';


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
  isDonation: boolean = false;
  camposInvalidos: Set<string> = new Set(); // Conjunto para almacenar los nombres de los campos inválidos

  produc = {
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_usuario: "",
    id_categoria: "" // Esta propiedad almacenará el ID de la categoría seleccionada
  }

  nombreCat = {
    nombre_categoria: ""
  }

  categorias: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private activateRoute: ActivatedRoute,
    public toastController: ToastController,
    private productService: ProductoService,
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private categoriaService: CategoriaService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  ngOnInit() {
    if (this.userInfo) {
      console.log(this.userInfo.id);
    } else {
      console.log('El objeto userInfo es null o undefined');
    }
    this.getCategorias(); // Llamar al método para obtener las categorías
  }

  onSubmit(product: producto) {
    // Verificar que los campos requeridos no estén vacíos
    if (!this.camposValidos(product)) {
      this.presentToast('Por favor completa todos los campos.');
      return;
    }
  
    this.produc.id_usuario = this.userInfo.id;
  
    this.productService.addProduct(product).subscribe({
      next: (response: any) => {
        // Mostrar mensaje de éxito
        console.log(response);
        this.presentToast('Registro exitoso.', 3000);
  
        // Redirigir a la página de inicio después de mostrar el mensaje
        setTimeout(() => {
          console.log("exito");
          this.router.navigate(['/sfoto'], { state: { creadoProducto: response.id_producto } });
        }, 3200); // Esperar un poco más que la duración del toast para garantizar que el usuario vea el mensaje
      },
      error: (error: any) => {
        console.error('Error al registrar el producto:', error);
        this.presentToast('Error al registrar el producto. Inténtalo de nuevo.');
      }
    });
  }
  
  // Función para verificar si los campos del producto son válidos
  camposValidos(product: producto): boolean {
    this.camposInvalidos.clear(); // Limpiar el conjunto de campos inválidos
    console.log(product)
    if (!product.nombre || product.nombre.trim() === '') {
      this.camposInvalidos.add('nombre');
    }
    if (!product.descripcion || product.descripcion.trim() === '') {
      this.camposInvalidos.add('descripcion');
    }
    if (!product.precio || product.precio.trim() === '') {
      this.camposInvalidos.add('precio');
    } else {
      let precioStr = product.precio.trim();
      
      // Eliminar el símbolo de moneda si está presente
      if (precioStr.startsWith('$')) {
        precioStr = precioStr.substring(1); // Elimina el primer caracter ('$')
      }
    
      // Validar y formatear el precio
      const precio = parseFloat(precioStr.replace(',', '.')); // Reemplaza comas por puntos si es necesario
    
      if (isNaN(precio)) {
        this.camposInvalidos.add('precio'); // Agrega como inválido si no es un número válido
      } else {
        // Formatea el precio sin decimales si es un número entero
        if (Number.isInteger(precio)) {
          this.produc.precio = '$' + precio.toLocaleString('es-CL'); // Formato de moneda chilena sin decimales
        } else {
          this.produc.precio = '$' + precio.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); // Formato de moneda con separador de miles y dos decimales
        }
      }
    }
    if (!product.stock || product.stock.trim() === '' || isNaN(parseInt(product.stock))) {
      this.camposInvalidos.add('stock');
    }
    if (!product.id_categoria) {
      this.camposInvalidos.add('id_categoria');
    }
  
    // Devolver verdadero si no hay campos inválidos
    return this.camposInvalidos.size === 0;
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

  getCategorias() {
    this.categoriaService.getTodasCategorias().subscribe(
      (data) => {
        this.categorias = data;
        console.log('Categorias:', this.categorias);
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  toggleDonation() {
    this.isDonation = !this.isDonation;
    if (this.isDonation) {
      this.produc.precio = "$0";
    } else {
      this.produc.precio = "";
    }
  }

  actualizarNombreCategoria() {
    const categoriaSeleccionada = this.categorias.find(cat => cat.id_categoria === this.produc.id_categoria);
    this.nombreCat.nombre_categoria = categoriaSeleccionada ? categoriaSeleccionada.nombre : '';
  }

  esCampoInvalido(campo: string): boolean {
    return this.camposInvalidos.has(campo);
  }

}

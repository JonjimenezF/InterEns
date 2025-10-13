import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { UsuarioService } from '../servicios/usuario.service';
import { producto } from '../models/producto';
import { CategoriaService } from '../servicios/categoria.service';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-sproducto',
  templateUrl: './sproducto.page.html',
  styleUrls: ['./sproducto.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    CommonModule,
    FormsModule,
    IonFooter,
    FooterInterensComponent
  ]
})
export class SproductoPage implements OnInit {
  nombreFoto: string | undefined;
  userInfo?: any;
  selectedFile: File | null = null;
  isDonation: boolean = false;
  camposInvalidos: Set<string> = new Set();
  selectedBodega: any = '';

  produc = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_usuario: '',
    id_categoria: ''
  };

  nombreCat = {
    nombre_categoria: ''
  };

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
      console.log('🧩 Usuario:', this.userInfo.id);
    } else {
      console.log('⚠️ El objeto userInfo es null o undefined');
    }

    this.getCategorias();
  }

  /** ✅ Obtener categorías desde Supabase */
  async getCategorias() {
    try {
      this.categorias = await this.categoriaService.getTodasCategorias();
      console.log('✅ Categorías cargadas:', this.categorias);
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      this.presentToast('Error al cargar categorías desde Supabase.');
    }
  }

  /** ✅ Enviar formulario */
  onSubmit(productForm: NgForm) {
    const product = productForm.value;
    this.produc.id_usuario = this.userInfo?.id;

    if (!this.camposValidos(product)) {
      this.presentToast('Por favor completa todos los campos.');
      return;
    }

    this.produc.id_usuario = this.userInfo?.id;

    this.productService.addProduct(this.produc).subscribe({
      next: (response: any) => {
        console.log('✅ Producto registrado:', response);
        this.presentToast('Registro exitoso.', 3000);

        setTimeout(() => {
          this.router.navigate(['/sfoto'], {
            state: { creadoProducto: response.id_producto }
          });
        }, 3200);
      },
      error: (error: any) => {
        console.error('❌ Error al registrar el producto:', error);
        this.presentToast('Error al registrar el producto. Inténtalo de nuevo.');
      }
    });
  }

  /** 🧩 Validar campos antes de enviar */
  camposValidos(product: producto): boolean {
    this.camposInvalidos.clear();
    console.log('📦 Datos del formulario:', product);

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
      if (precioStr.startsWith('$')) {
        precioStr = precioStr.substring(1);
      }
      const precio = parseFloat(precioStr.replace('.', '').replace(',', '.'));
      if (isNaN(precio)) {
        this.camposInvalidos.add('precio');
      } else {
        this.produc.precio = '$' + precio.toLocaleString('es-CL');
      }
    }
    if (!product.stock || product.stock.trim() === '' || isNaN(parseInt(product.stock))) {
      this.camposInvalidos.add('stock');
    }
    if (!product.id_categoria) {
      this.camposInvalidos.add('id_categoria');
    }

    return this.camposInvalidos.size === 0;
  }

  /** 📁 Seleccionar imagen */
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /** 🗑️ Eliminar imagen */
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

  /** 🔔 Mostrar mensajes */
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  /** 🔙 Volver atrás */
  goBack() {
    this.navCtrl.back();
  }

  /** 🎁 Cambiar modo de donación */
  toggleDonation() {
    this.isDonation = !this.isDonation;
    if (this.isDonation) {
      this.produc.precio = '$0';
    } else {
      this.produc.precio = '';
    }
  }

  /** 🔄 Actualizar nombre de la categoría seleccionada */
  actualizarNombreCategoria() {
    const categoriaSeleccionada = this.categorias.find(
      cat => cat.id === this.produc.id_categoria
    );
    this.nombreCat.nombre_categoria = categoriaSeleccionada
      ? categoriaSeleccionada.nombre
      : '';
  }

  /** ⚠️ Resalta campos inválidos en el formulario */
  esCampoInvalido(campo: string): boolean {
    return this.camposInvalidos.has(campo);
  }

  /** 📦 Cambiar bodega */
  onBodegaChange(event: any) {
    this.selectedBodega = event.detail.value;
  }
}

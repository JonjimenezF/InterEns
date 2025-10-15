// ✅ Componente para crear un nuevo "enser" (producto) y subir múltiples imágenes a Supabase Storage

import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

// 🧩 Servicios propios
import { supabase } from '../services/supabase.client';
import { EnserService } from '../services/enser.service';
import { CategoriaService } from '../servicios/categoria.service';
import { ProductosBackendService } from '../servicios/productos-backend.service'; // 👈 nuevo servicio

// 🧱 Importaciones de Ionic (standalone)
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonTitle
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';

// 🔗 Librerías externas
import { v4 as uuidv4 } from 'uuid';

// 🧩 Componente de footer personalizado
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-sproducto',
  templateUrl: './sproducto.page.html',
  styleUrls: ['./sproducto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFooter,
    IonTitle,
    FooterInterensComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SproductoPage implements OnInit {
  // 👤 Usuario autenticado
  userInfo?: any;

  // 📦 Datos del enser
  enser = {
    propietario_id: '' as string,
    titulo: '' as string,
    descripcion: '' as string,
    categoria_id: null as number | null,
    condicion: 'bueno' as string,
    estado: '' as string,
    valor_puntos: 0 as number,
    ciudad: '' as string,
    region: '' as string,
    latitud: null as number | null,
    longitud: null as number | null,
    imagen_url: null as string | null,
    imagenes_extra: [] as string[]
  };

  // 📂 Manejo de imágenes
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  // 📚 Categorías
  categorias: { id: number; nombre: string }[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private enserService: EnserService,
    private categoriaService: CategoriaService,
    private productosBackend: ProductosBackendService // 👈 conexión con backend
  ) {
    // 🔍 Recuperar datos del estado (si viene del Home)
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  // 🚀 Inicialización
  async ngOnInit() {
    try {
      // 🔐 Obtener sesión actual
      const { data: sessionData, error: sErr } = await supabase.auth.getSession();
      if (sErr) throw sErr;

      const user = sessionData?.session?.user;
      if (!user) {
        this.presentToast('Inicia sesión antes de subir un producto.');
        this.router.navigate(['/portada']);
        return;
      }

      this.userInfo = user;
      this.enser.propietario_id = user.id;

      // 🔽 Cargar categorías dinámicas desde Supabase
      const { data: categorias, error: catErr } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('id', { ascending: true });

      if (catErr) throw catErr;
      this.categorias = categorias || [];
    } catch (error) {
      console.error('[SPRODUCTO] Error en ngOnInit:', error);
      this.presentToast('❌ Error al cargar datos iniciales.');
    }
  }

  // 📸 Seleccionar y previsualizar múltiples imágenes
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    this.selectedFiles.push(...files);

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.previewUrls.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // 🚀 Subir todas las imágenes al bucket de Supabase
  async uploadAllImages(): Promise<string[]> {
    const urls: string[] = [];

    for (let file of this.selectedFiles) {
      const fileName = `${uuidv4()}-${file.name}`;
      const { error } = await supabase.storage.from('enseres').upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage.from('enseres').getPublicUrl(fileName);
      urls.push(publicData.publicUrl);
    }

    return urls;
  }

  // 💾 Guardar el enser junto a las imágenes y actualizar puntos
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('Completa todos los campos.');
      return;
    }

    if (!this.userInfo?.id) {
      this.presentToast('Debes iniciar sesión antes de subir un producto.');
      return;
    }

    this.enser.propietario_id = this.userInfo.id;

    try {
      this.presentToast('Subiendo imágenes...', 2000);
      const imageUrls = await this.uploadAllImages();

      this.enser.imagen_url = imageUrls[0] || null;
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];

      // 🧹 Eliminar campos vacíos
      const enserToSave = { ...this.enser };
      Object.keys(enserToSave).forEach((key) => {
        const value = enserToSave[key as keyof typeof enserToSave];
        if (value === '' || value === null) {
          delete enserToSave[key as keyof typeof enserToSave];
        }
      });

      // ✅ Enviar al backend para guardar producto y actualizar puntos
      const response = await this.productosBackend.uploadProduct(enserToSave).toPromise();

      console.log('✅ Producto y puntos actualizados:', response);
      this.presentToast('✅ Producto subido con éxito. ¡Puntos actualizados!');
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('[SPRODUCTO] Error al guardar:', err);
      this.presentToast('❌ Error al subir el enser o actualizar puntos.');
    }
  }

  // 🔙 Volver atrás
  goBack() {
    this.navCtrl.back();
  }

  // 🔔 Mostrar mensajes
  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    await toast.present();
  }
}

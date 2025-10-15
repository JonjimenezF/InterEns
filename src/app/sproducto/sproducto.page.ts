import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../services/supabase.client';
import { EnserService } from '../services/enser.service';

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
  IonButton
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

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
    IonButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SproductoPage implements OnInit {

  userInfo?: any;

  enser = {
    propietario_id: '',
    titulo: '',
    descripcion: '',
    categoria_id: null as number | null,
    condicion: '',
    estado: '',
    valor_puntos: 0,
    ciudad: '',
    region: '',
    latitud: null as number | null,
    longitud: null as number | null,
    imagen_url: null as string | null,
    imagenes_extra: [] as string[]
  };

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  categorias: { id: number; nombre: string }[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private enserService: EnserService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) this.userInfo = state['userInfo'];
  }

  // 🔐 Inicialización y carga de categorías
  async ngOnInit() {
    try {
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

      const { data: categorias, error: catErr } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('id', { ascending: true });

      if (catErr) throw catErr;
      this.categorias = categorias || [];

    } catch (error) {
      console.error('[SPRODUCTO] Error en ngOnInit:', error);
    }
  }

  // 📸 Manejo de selección de archivos
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    for (const file of files) {
      // ✅ Validación del tipo y tamaño
      if (!file.type.startsWith('image/')) {
        this.presentToast('Solo puedes subir imágenes.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.presentToast('El tamaño máximo por imagen es de 5 MB.');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.previewUrls.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // ❌ Eliminar imagen de previsualización
  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  // 🧼 Limpia nombres de archivo para evitar errores de Supabase
  sanitizeFileName(name: string): string {
    return name
      .normalize('NFD') // elimina tildes
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_') // reemplaza caracteres no válidos por "_"
      .toLowerCase();
  }

  // ☁️ Subida de todas las imágenes con validación
  async uploadAllImages(): Promise<string[]> {
    const urls: string[] = [];

    for (let file of this.selectedFiles) {
      const cleanName = this.sanitizeFileName(file.name);
      const fileName = `${uuidv4()}-${cleanName}`;

      const { error } = await supabase.storage.from('enseres').upload(fileName, file);
      if (error) throw error;

      const { data: publicData } = supabase.storage.from('enseres').getPublicUrl(fileName);
      urls.push(publicData.publicUrl);
    }

    return urls;
  }

  // 💾 Guardar o publicar producto
  async onSubmit(form: NgForm, modo: 'borrador' | 'publicado') {
    if (form.invalid) {
      this.presentToast('Completa todos los campos obligatorios.');
      return;
    }

    if (!this.userInfo?.id) {
      this.presentToast('Debes iniciar sesión antes de subir un producto.');
      return;
    }

    this.enser.propietario_id = this.userInfo.id;

    try {
      this.presentToast('Subiendo imágenes...', 1500);
      const imageUrls = await this.uploadAllImages();

      // 📷 Imagen principal = primera imagen
      this.enser.imagen_url = imageUrls[0] || null;
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];

      // 🟢 Define estado según el modo
      this.enser.estado = modo === 'borrador' ? 'borrador' : 'publicado';

      const { data, error } = await this.enserService.addEnser(this.enser);
      if (error) throw error;

      if (modo === 'borrador') {
        this.presentToast('📝 Borrador guardado. Puedes editarlo más tarde.');
      } else {
        this.presentToast('✅ Producto publicado correctamente.');
      }

      this.router.navigate(['/home']);
    } catch (err: any) {
  console.error('[SPRODUCTO] Error al guardar:', err);

  // 🧠 Algunos errores de Supabase llegan como "error.message" o "error.error"
  const errorMsg = err?.error || err?.message || '';

  if (errorMsg.includes('InvalidKey')) {
    this.presentToast('⚠️ Nombre de archivo no válido. Intenta renombrar las imágenes.');
  } else {
    this.presentToast('❌ Error al guardar el producto.');
  }
}

  }

  // 🔔 Toast reutilizable
  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  // ⬅️ Volver atrás
  goBack() {
    this.navCtrl.back();
  }
}

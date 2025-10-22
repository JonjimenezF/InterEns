import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

// Servicios
import { supabase } from '../services/supabase.client';

// Componentes
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

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
  IonTitle,
} from '@ionic/angular/standalone';

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
    FooterInterensComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SproductoPage implements OnInit {
  userInfo?: any;
  categorias: { id: number; nombre: string }[] = [];

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
    imagen_url: null as string | null,
  };

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private toastController: ToastController
  ) {}

  // Inicialización y carga de categorías
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
      this.presentToast('❌ Error al cargar datos iniciales.');
    }
  }

  // Manejo de selección de archivos
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.presentToast('Solo puedes subir imágenes.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.presentToast('El tamaño máximo por imagen es 5MB.');
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

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  sanitizeFileName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .toLowerCase();
  }

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

  // Guardar producto (usa el backend)
  async onSubmit(form: NgForm, modo: 'borrador' | 'publicado') {
    if (form.invalid) {
      this.presentToast('Completa todos los campos obligatorios.');
      return;
    }

    if (!this.userInfo?.id) {
      this.presentToast('Debes iniciar sesión antes de subir un producto.');
      return;
    }

    try {
      this.presentToast('Subiendo imágenes...', 1500);
      const imageUrls = await this.uploadAllImages();

      this.enser.imagen_url = imageUrls[0] || null;
      this.enser.estado = modo; // 🟢 guarda como borrador o publicado

      // Enviar los datos al backend Fastify
      const response = await fetch('http://localhost:4000/api/uploadProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.enser),
      });

      const result = await response.json();

      if (result.success) {
        const msg = modo === 'borrador'
          ? '📝 Producto guardado como borrador.'
          : '✅ Producto publicado correctamente.';
        this.presentToast(msg);
        this.router.navigate(['/home']);
      } else {
        throw new Error(result.error || 'Error desconocido.');
      }
    } catch (err: any) {
      console.error('[SPRODUCTO] Error al guardar:', err);
      const errorMsg = err?.error || err?.message || '';
      if (errorMsg.includes('InvalidKey')) {
        this.presentToast('⚠️ Nombre de archivo no válido. Intenta renombrar las imágenes.');
      } else {
        this.presentToast('❌ Error al guardar el producto.');
      }
    }
  }


  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
    });
    toast.present();
  }

  goBack() {
    this.navCtrl.back();
  }
}

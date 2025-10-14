// ✅ Componente para crear un nuevo "enser" (producto) y subir múltiples imágenes a Supabase Storage

// 🧩 Importaciones base de Angular
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../services/supabase.client';
import { EnserService } from '../services/enser.service';

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
  IonButton
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';

// 🔗 Librerías externas
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

  // 👤 Usuario autenticado
  userInfo?: any;

  // 📦 Campos principales del enser
  enser = {
    propietario_id: '' as string,
    titulo: '' as string,
    descripcion: '' as string,
    categoria_id: null as number | null,
    condicion: '' as string,
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

  // 📚 Categorías dinámicas desde Supabase
  categorias: { id: number; nombre: string }[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private enserService: EnserService
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

      console.log('[SPRODUCTO] Usuario autenticado:', user);
      this.userInfo = user;
      this.enser.propietario_id = user.id;

      // 🔽 Cargar categorías dinámicas
      const { data: categorias, error: catErr } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('id', { ascending: true });
      if (catErr) throw catErr;
      this.categorias = categorias || [];
      console.log('[SPRODUCTO] Categorías cargadas:', this.categorias);

    } catch (error) {
      console.error('[SPRODUCTO] Error en ngOnInit:', error);
    }
  }

  // 📸 Seleccionar y previsualizar múltiples imágenes
  // 📸 Seleccionar y previsualizar múltiples imágenes
onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  // ✅ Convierte el FileList en un array tipado correctamente
  const files: File[] = Array.from(input.files);
  this.selectedFiles.push(...files); // acumula archivos nuevos

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.previewUrls.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file); // ✅ ahora TS lo reconoce como Blob/File válido
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

  // 💾 Guardar el enser junto a las imágenes
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('Completa todos los campos.');
      return;
    }

    // ✅ Verificar que el usuario esté logueado
    if (!this.userInfo?.id) {
      this.presentToast('Debes iniciar sesión antes de subir un producto.');
      return;
    }

    // ✅ Forzar asignación del propietario_id
    this.enser.propietario_id = this.userInfo.id;

    try {
      this.presentToast('Subiendo imágenes...', 2000);
      const imageUrls = await this.uploadAllImages();

      // ✅ Imagen principal = primera imagen
      this.enser.imagen_url = imageUrls[0] || null;

      // ✅ Agregar nuevas imágenes al array existente (para no reemplazar)
      this.enser.imagenes_extra = [
        ...(this.enser.imagenes_extra || []),
        ...imageUrls
      ];

      // ✅ Guardar en la tabla "enseres"
      const { data, error } = await this.enserService.addEnser(this.enser);
      if (error) throw error;

      this.presentToast('✅ Enser registrado con éxito.');
      this.router.navigate(['/home']);
    } catch (err) {
      console.error('[SPRODUCTO] Error al guardar:', err);
      this.presentToast('❌ Error al subir el enser o las imágenes.');
    }
  }

  // 🧾 Mostrar mensajes flotantes
  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  // 🔙 Volver atrás
  goBack() {
    this.navCtrl.back();
  }
}

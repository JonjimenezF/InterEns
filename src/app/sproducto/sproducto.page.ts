// ✅ Componente para crear o editar un "enser" (producto) y subir múltiples imágenes a Supabase Storage
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

// 🧩 Servicios
import { supabase } from '../services/supabase.client';
import { EnserService } from '../services/enser.service';
import { CategoriaService } from '../servicios/categoria.service';
import { ProductosBackendService } from '../servicios/productos-backend.service';

// 🧩 Ionic standalone imports
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

// 🧩 Componentes personalizados
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
    FooterInterensComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SproductoPage implements OnInit {
  userInfo?: any;
  categorias: { id: number; nombre: string }[] = [];

  enser: any = {
    propietario_id: '',
    titulo: '',
    descripcion: '',
    categoria_id: null,
    condicion: 'bueno',
    estado: 'publicado',
    valor_puntos: 0,
    ciudad: '',
    region: '',
    imagen_url: null,
    imagenes_extra: [],
  };

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  editandoBorrador = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private enserService: EnserService,
    private categoriaService: CategoriaService,
    private productosBackend: ProductosBackendService
  ) {}

  async ngOnInit() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        this.presentToast('Inicia sesión antes de subir un producto.');
        this.router.navigate(['/portada']);
        return;
      }

      this.userInfo = user;
      this.enser.propietario_id = user.id;

      // ✅ Si viene desde Perfil con un borrador para editar
      const state = this.router.getCurrentNavigation()?.extras?.state;
      if (state && state['borrador']) {
        this.enser = { ...state['borrador'] };
        this.editandoBorrador = true;
        console.log('📝 Editando borrador existente:', this.enser);
      }

      // ✅ Cargar categorías desde Supabase
      const { data: categorias } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('id', { ascending: true });

      this.categorias = categorias || [];
    } catch (error) {
      console.error('[SPRODUCTO] Error en ngOnInit:', error);
      this.presentToast('❌ Error al cargar datos iniciales.');
    }
  }

  // 📸 Manejar imágenes seleccionadas
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    this.selectedFiles.push(...files);

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) this.previewUrls.push(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

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

  // 💾 Publicar o actualizar producto (borrador → publicado o nuevo)
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('Completa todos los campos obligatorios.');
      return;
    }

    try {
      const imageUrls = await this.uploadAllImages();
      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url;
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'publicado';

      const enserToSave = { ...this.enser };
      Object.keys(enserToSave).forEach((key) => {
        const value = enserToSave[key as keyof typeof enserToSave];
        if (value === '' || value === null) delete enserToSave[key as keyof typeof enserToSave];
      });

      // ✅ Si es un borrador existente → publicar con endpoint especial
      if (this.editandoBorrador && this.enser.id) {
        const response = await fetch(`http://localhost:4000/api/publishDraft/${this.enser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor_puntos: this.enser.valor_puntos,
            propietario_id: this.enser.propietario_id,
            titulo: this.enser.titulo,
          }),
        });

        if (!response.ok) throw new Error('Error al publicar borrador');

        await this.presentToast(`✅ El borrador "${this.enser.titulo}" fue publicado y movido a Mis Productos.`);

        // 🔁 Navegar al perfil y eliminar borrador localmente
        this.router.navigateByUrl('/perfil', {
          state: {
            openTab: 'productos',
            refresh: true,
            removeDraftId: this.enser.id,
            publishedTitle: this.enser.titulo,
          },
        });
        return;
      }

      // 🟩 Si es un nuevo producto → subir normalmente
      await this.productosBackend.uploadProduct(enserToSave).toPromise();

      this.presentToast('✅ Producto publicado correctamente.');
      this.router.navigateByUrl('/perfil', {
        state: { openTab: 'productos', refresh: true },
      });
    } catch (err: any) {
      console.error('❌ Error al publicar:', err);
      this.presentToast('Error al subir el producto.');
    }
  }

  // 💾 Guardar como borrador o actualizarlo
  async guardarBorrador(form: NgForm) {
    try {
      const imageUrls = await this.uploadAllImages();
      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url;
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'borrador';

      if (this.editandoBorrador && this.enser.id) {
        await fetch(`http://localhost:4000/api/updateDraft/${this.enser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.enser),
        });
      } else {
        await this.productosBackend.uploadProduct(this.enser).toPromise();
      }

      this.presentToast('📝 Borrador guardado correctamente.');
      this.router.navigateByUrl('/perfil', {
        state: { openTab: 'borradores', refresh: true },
      });
    } catch (error) {
      console.error('❌ Error al guardar borrador:', error);
      this.presentToast('Error al guardar el borrador.');
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  async presentToast(message: string, duration = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }
}

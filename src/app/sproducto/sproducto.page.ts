import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

// 🧩 Servicios
import { supabase } from '../services/supabase.client';
import { CategoriaService } from '../servicios/categoria.service';

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
    private route: ActivatedRoute,
    private toastController: ToastController,
    private http: HttpClient,
    private categoriaService: CategoriaService
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

      // 🧩 Intentar cargar borrador desde navegación o localStorage
      const nav = this.router.getCurrentNavigation();
      let borrador = nav?.extras?.state?.['borrador'];

      if (!borrador) {
        const guardado = localStorage.getItem('borrador_en_edicion');
        if (guardado) borrador = JSON.parse(guardado);
      }

      if (borrador) {
        this.enser = { ...borrador };
        this.editandoBorrador = true;
        console.log('📝 Editando borrador:', this.enser);
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

  // 📸 Subir imágenes a Supabase Storage
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

  // 🟢 Publicar producto (nuevo o desde borrador)
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('Completa todos los campos obligatorios.');
      return;
    }

    try {
      const imageUrls = await this.uploadAllImages();

      // ✅ Si el usuario no seleccionó ninguna imagen → asignar una por defecto
      const imagenPorDefecto = 'assets/img/default.png';
      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || imagenPorDefecto;

      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'publicado';

      let result: any;

      if (this.editandoBorrador && this.enser.id) {
        // 🔁 Publicar borrador existente
        result = await this.http
          .put(`http://localhost:4000/api/publishDraft/${this.enser.id}`, {
            valor_puntos: this.enser.valor_puntos,
            propietario_id: this.enser.propietario_id,
            titulo: this.enser.titulo,
          })
          .toPromise();
      } else {
        // 🆕 Nuevo producto publicado
        result = await this.http
          .post(`http://localhost:4000/api/uploadProduct`, this.enser)
          .toPromise();
      }

      if (result?.success) {
        this.presentToast(result.message || '✅ Producto publicado correctamente.');

        if (result.total_points) {
          window.dispatchEvent(
            new CustomEvent('puntosActualizados', {
              detail: { total_points: Number(result.total_points), valor_puntos: Number(this.enser.valor_puntos) },
            })
          );
        }

        localStorage.removeItem('borrador_en_edicion');
        this.router.navigateByUrl('/perfil', {
          state: { openTab: 'productos', refresh: true },
        });
      } else {
        this.presentToast('⚠️ Ocurrió un error al publicar.');
      }
    } catch (err: any) {
      console.error('❌ Error al publicar:', err);
      this.presentToast('Error al subir el producto.');
    }
  }

  // 📝 Guardar o actualizar borrador
  async guardarBorrador(form: NgForm) {
    try {
      const imageUrls = await this.uploadAllImages();

      // ✅ También usa imagen por defecto si no hay
      const imagenPorDefecto = 'https://your-supabase-url/storage/v1/object/public/interens/default.png';
      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || imagenPorDefecto;

      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'borrador';

      const result = await this.http
        .post(`http://localhost:4000/api/uploadProduct`, this.enser)
        .toPromise();

      if (result) {
        localStorage.setItem('borrador_en_edicion', JSON.stringify(this.enser));
        this.editandoBorrador = true;
        this.presentToast('📝 Borrador guardado correctamente.');

        this.router.navigateByUrl('/perfil', {
          state: { openTab: 'borradores', refresh: true },
        });
      }
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

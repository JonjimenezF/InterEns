import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

// Servicios
import { supabase } from '../services/supabase.client';
import { CategoriaService } from '../servicios/categoria.service';

// Componentes
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

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
  IonSpinner,
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
    IonSpinner,
    FooterInterensComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SproductoPage implements OnInit {
  userInfo?: any;
  categorias: { id: number; nombre: string }[] = [];
  editandoBorrador = false;

  enser: any = {
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
  isLoading = false;
  isUploadingImages = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private http: HttpClient,
    private categoriaService: CategoriaService
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

  // 📸 Subir imágenes a Supabase Storage con sanitización de nombres
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

  // Manejo de selección de archivos
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    
    // Validar límite total de imágenes
    if (this.selectedFiles.length + files.length > 5) {
      this.presentToast('Máximo 5 imágenes permitidas.');
      return;
    }

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

  // 🟢 Publicar producto (nuevo o desde borrador)
  async onSubmit(form: NgForm) {
    // Validaciones mejoradas
    if (form.invalid) {
      this.presentToast('❌ Completa todos los campos obligatorios.');
      return;
    }

    if (!this.enser.titulo?.trim()) {
      this.presentToast('❌ El título es obligatorio.');
      return;
    }

    if (!this.enser.descripcion?.trim()) {
      this.presentToast('❌ La descripción es obligatoria.');
      return;
    }

    if (!this.enser.valor_puntos || this.enser.valor_puntos <= 0) {
      this.presentToast('❌ El valor de puntos debe ser mayor a 0.');
      return;
    }

    if (!this.enser.categoria_id) {
      this.presentToast('❌ Selecciona una categoría.');
      return;
    }

    if (!this.userInfo?.id) {
      this.presentToast('❌ Debes iniciar sesión antes de subir un producto.');
      return;
    }

    this.isLoading = true;
    this.isUploadingImages = true;

    try {
      this.presentToast('📤 Subiendo imágenes...', 1500);
      const imageUrls = await this.uploadAllImages();
      this.isUploadingImages = false;

      // ✅ Manejo correcto de múltiples imágenes
      if (imageUrls.length > 0) {
        this.enser.imagen_url = imageUrls[0]; // Primera imagen como principal
        this.enser.imagenes_extra = imageUrls.slice(1); // Resto como extras
      } else {
        // Solo usar imagen por defecto si no hay ninguna imagen existente
        this.enser.imagen_url = this.enser.imagen_url || 'assets/img/default.png';
      }
      
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
        this.presentToast('✅ ' + (result.message || 'Producto publicado correctamente.'));

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
      console.error('[SPRODUCTO] Error al guardar:', err);
      const errorMsg = err?.error || err?.message || '';
      if (errorMsg.includes('InvalidKey')) {
        this.presentToast('⚠️ Nombre de archivo no válido. Intenta renombrar las imágenes.');
      } else {
        this.presentToast('❌ Error al guardar el producto.');
      }
    } finally {
      this.isLoading = false;
      this.isUploadingImages = false;
    }
  }

  // 📝 Guardar o actualizar borrador
  async guardarBorrador(form: NgForm) {
    // Validación mínima para borradores
    if (!this.enser.titulo?.trim()) {
      this.presentToast('❌ El título es obligatorio para guardar.');
      return;
    }

    this.isLoading = true;
    this.isUploadingImages = true;

    try {
      this.presentToast('💾 Guardando borrador...', 1000);
      const imageUrls = await this.uploadAllImages();
      this.isUploadingImages = false;

      // ✅ Manejo correcto de múltiples imágenes para borradores
      if (imageUrls.length > 0) {
        this.enser.imagen_url = imageUrls[0]; // Primera imagen como principal
        this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls.slice(1)]; // Agregar extras
      } else if (!this.enser.imagen_url) {
        this.enser.imagen_url = 'assets/img/default.png';
      }
      
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
      this.presentToast('❌ Error al guardar el borrador.');
    } finally {
      this.isLoading = false;
      this.isUploadingImages = false;
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  async presentToast(message: string, duration: number = 2500) {
    const color = message.includes('❌') ? 'danger' : 
                 message.includes('⚠️') ? 'warning' : 'success';
    
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color,
    });
    toast.present();
  }
}
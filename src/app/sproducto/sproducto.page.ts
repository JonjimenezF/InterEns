
// import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, NgForm } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NavController, ToastController } from '@ionic/angular';
// import { v4 as uuidv4 } from 'uuid';
// import { supabase } from '../services/supabase.client';

// // 🧩 Servicios
// import { CategoriaService } from '../servicios/categoria.service';
// import { UbicacionService } from '../servicios/ubicacion.service';

// // 🧩 Ionic standalone imports
// import {
//   IonHeader,
//   IonToolbar,
//   IonButtons,
//   IonBackButton,
//   IonContent,
//   IonItem,
//   IonLabel,
//   IonInput,
//   IonTextarea,
//   IonSelect,
//   IonSelectOption,
//   IonButton,
//   IonFooter,
//   IonTitle,
//   IonSpinner,
// } from '@ionic/angular/standalone';

// @Component({
//   selector: 'app-sproducto',
//   templateUrl: './sproducto.page.html',
//   styleUrls: ['./sproducto.page.scss'],
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     HttpClientModule,
//     IonHeader,
//     IonToolbar,
//     IonButtons,
//     IonBackButton,
//     IonContent,
//     IonItem,
//     IonLabel,
//     IonInput,
//     IonTextarea,
//     IonSelect,
//     IonSelectOption,
//     IonButton,
//     IonFooter,
//     IonTitle,
//     IonSpinner,
//     FooterInterensComponent,
//   ],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class SproductoPage implements OnInit {
//   userInfo?: any;
//   categorias: any[] = [];
//   regiones: any[] = [];
//   comunas: any[] = [];
//   cargandoRegiones = true;

//   enser: any = {
//     propietario_id: '',
//     titulo: '',
//     descripcion: '',
//     categoria_id: null as number | null,
//     condicion: '',
//     estado: '',
//     valor_puntos: 0,
//     region_id: null,
//     comuna_id: null,
//     imagen_url: null,
//     imagenes_extra: [],
//   };

//   selectedFiles: File[] = [];
//   previewUrls: string[] = [];
//   isLoading = false;
//   isUploadingImages = false;

//   constructor(
//     private navCtrl: NavController,
//     private router: Router,
//     private route: ActivatedRoute,
//     private toastController: ToastController,
//     private http: HttpClient,
//     private categoriaService: CategoriaService,
//     private ubicacionService: UbicacionService
//   ) {}

//   // Inicialización y carga de categorías
//   async ngOnInit() {
//     try {
//       const { data: sessionData, error: sErr } = await supabase.auth.getSession();
//       if (sErr) throw sErr;

//       const user = sessionData?.session?.user;

//       if (!user) {
//         this.presentToast('Inicia sesión antes de subir un producto.');
//         this.router.navigate(['/portada']);
//         return;
//       }

//       this.userInfo = user;
//       this.enser.propietario_id = user.id;

//       const nav = this.router.getCurrentNavigation();
//       let borrador = nav?.extras?.state?.['borrador'];
//       if (!borrador) {
//         const guardado = localStorage.getItem('borrador_en_edicion');
//         if (guardado) borrador = JSON.parse(guardado);
//       }

//       if (borrador) {
//         this.enser = { ...borrador };
//         this.editandoBorrador = true;
//       }

//       const { data: categorias } = await supabase
//         .from('categorias')
//         .select('id, nombre')
//         .order('id', { ascending: true });

//       if (catErr) throw catErr;
//       this.categorias = categorias || [];
//       await this.cargarRegiones();
//     } catch (error) {
//       console.error('[SPRODUCTO] Error en ngOnInit:', error);
//       this.presentToast('❌ Error al cargar datos iniciales.');
//     }
//   }

//   async cargarRegiones() {
//     this.cargandoRegiones = true;
//     try {
//       this.regiones = await this.ubicacionService.getRegiones();
//       console.log('🌎 Regiones cargadas:', this.regiones);
//     } catch (err) {
//       console.error('❌ Error al cargar regiones:', err);
//     } finally {
//       this.cargandoRegiones = false;
//     }
//   }

//   async onRegionChange(regionId: number) {
//     if (!regionId) {
//       this.comunas = [];
//       return;
//     }
//     console.log('🗺️ Región seleccionada:', regionId);
//     this.comunas = await this.ubicacionService.getComunasPorRegion(regionId);
//     console.log('🏙️ Comunas cargadas:', this.comunas);
//   }

//   // === Subida de imágenes ===
//   async uploadAllImages(): Promise<string[]> {
//     const urls: string[] = [];
//     for (let file of this.selectedFiles) {
//       const cleanName = this.sanitizeFileName(file.name);
//       const fileName = `${uuidv4()}-${cleanName}`;
//       const { error } = await supabase.storage.from('enseres').upload(fileName, file);
//       if (error) throw error;
//       const { data: publicData } = supabase.storage.from('enseres').getPublicUrl(fileName);
//       urls.push(publicData.publicUrl);
//     }
//     return urls;
//   }

//   // Manejo de selección de archivos
//   onFilesSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (!input.files) return;
//     const files: File[] = Array.from(input.files);
    
//     // Validar límite total de imágenes
//     if (this.selectedFiles.length + files.length > 5) {
//       this.presentToast('Máximo 5 imágenes permitidas.');
//       return;
//     }

//     this.selectedFiles.push(...files);
//     for (const file of files) {
//       if (!file.type.startsWith('image/')) {
//         this.presentToast('Solo puedes subir imágenes.');
//         continue;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         this.presentToast('El tamaño máximo por imagen es 5MB.');
//         continue;
//       }

//       this.selectedFiles.push(file);

//       const reader = new FileReader();
//       reader.onload = (e: ProgressEvent<FileReader>) => {
//         if (e.target?.result) {
//           this.previewUrls.push(e.target.result as string);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   removeImage(index: number) {
//     this.previewUrls.splice(index, 1);
//     this.selectedFiles.splice(index, 1);
//   }

//   async onSubmit(form: NgForm) {
//     // Validaciones mejoradas
//     if (form.invalid) {
//       this.presentToast('❌ Completa todos los campos obligatorios.');
//       return;
//     }

//     if (!this.enser.titulo?.trim()) {
//       this.presentToast('❌ El título es obligatorio.');
//       return;
//     }

//     if (!this.enser.descripcion?.trim()) {
//       this.presentToast('❌ La descripción es obligatoria.');
//       return;
//     }

//     if (!this.enser.valor_puntos || this.enser.valor_puntos <= 0) {
//       this.presentToast('❌ El valor de puntos debe ser mayor a 0.');
//       return;
//     }

//     if (!this.enser.categoria_id) {
//       this.presentToast('❌ Selecciona una categoría.');
//       return;
//     }

//     if (!this.userInfo?.id) {
//       this.presentToast('❌ Debes iniciar sesión antes de subir un producto.');
//       return;
//     }

//     this.isLoading = true;
//     this.isUploadingImages = true;

//     try {
//       this.presentToast('📤 Subiendo imágenes...', 1500);
//       const imageUrls = await this.uploadAllImages();
//       this.isUploadingImages = false;

//       // ✅ Manejo correcto de múltiples imágenes
//       if (imageUrls.length > 0) {
//         this.enser.imagen_url = imageUrls[0]; // Primera imagen como principal
//         this.enser.imagenes_extra = imageUrls.slice(1); // Resto como extras
//       } else {
//         // Solo usar imagen por defecto si no hay ninguna imagen existente
//         this.enser.imagen_url = this.enser.imagen_url || 'assets/img/default.png';
//       }
      
//       const imagenPorDefecto = 'assets/img/default.png';
//       this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || imagenPorDefecto;
//       this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
//       this.enser.estado = 'publicado';

//       await this.http.post(`http://localhost:4000/api/uploadProduct`, this.enser).toPromise();
//       this.presentToast('✅ Producto publicado correctamente.');
//       localStorage.removeItem('borrador_en_edicion');
//       this.router.navigateByUrl('/perfil', { state: { openTab: 'productos', refresh: true } });
//     } catch (err) {
//       console.error('❌ Error al publicar:', err);
//       this.presentToast('Error al subir el producto.');
//     }
//   }

//   async guardarBorrador(form: NgForm) {
//     // Validación mínima para borradores
//     if (!this.enser.titulo?.trim()) {
//       this.presentToast('❌ El título es obligatorio para guardar.');
//       return;
//     }

//     this.isLoading = true;
//     this.isUploadingImages = true;

//     try {
//       this.presentToast('💾 Guardando borrador...', 1000);
//       const imageUrls = await this.uploadAllImages();
//       const imagenPorDefecto = 'assets/img/default.png';
//       this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || imagenPorDefecto;
//       this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
//       this.enser.estado = 'borrador';

//       await this.http.post(`http://localhost:4000/api/uploadProduct`, this.enser).toPromise();
//       localStorage.setItem('borrador_en_edicion', JSON.stringify(this.enser));
//       this.presentToast('📝 Borrador guardado correctamente.');
//       this.router.navigateByUrl('/perfil', { state: { openTab: 'borradores', refresh: true } });
//     } catch (error) {
//       console.error('❌ Error al guardar borrador:', error);
//       this.presentToast('❌ Error al guardar el borrador.');
//     } finally {
//       this.isLoading = false;
//       this.isUploadingImages = false;
//     }
//   }

//   goBack() {
//     this.navCtrl.back();
//   }

//   async presentToast(message: string, duration: number = 2500) {
//     const color = message.includes('❌') ? 'danger' : 
//                  message.includes('⚠️') ? 'warning' : 'success';
    
//     const toast = await this.toastController.create({
//       message,
//       duration,
//       position: 'bottom',
//       color,
//     });
//     toast.present();
//   }
// }



import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.client';

// 🧩 Servicios
import { CategoriaService } from '../servicios/categoria.service';
import { UbicacionService } from '../servicios/ubicacion.service';

// 🧩 Componentes personalizados
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
    FooterInterensComponent, // ✅ ahora es reconocido correctamente
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SproductoPage implements OnInit {
  userInfo?: any;
  categorias: any[] = [];
  regiones: any[] = [];
  comunas: any[] = [];
  cargandoRegiones = true;

  editandoBorrador: boolean = false; // ✅ agregado

  enser: any = {
    propietario_id: '',
    titulo: '',
    descripcion: '',
    categoria_id: null as number | null,
    condicion: '',
    estado: '',
    valor_puntos: 0,
    region_id: null,
    comuna_id: null,
    imagen_url: null,
    imagenes_extra: [],
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
    private categoriaService: CategoriaService,
    private ubicacionService: UbicacionService
  ) {}

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

      // 📝 Revisar si hay borrador cargado
      const nav = this.router.getCurrentNavigation();
      let borrador = nav?.extras?.state?.['borrador'];
      if (!borrador) {
        const guardado = localStorage.getItem('borrador_en_edicion');
        if (guardado) borrador = JSON.parse(guardado);
      }

      if (borrador) {
        this.enser = { ...borrador };
        this.editandoBorrador = true;
      }

      // ✅ Corregido destructuring de Supabase
      const { data: categorias, error: catErr } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('id', { ascending: true });

      if (catErr) throw catErr;

      this.categorias = categorias || [];
      await this.cargarRegiones();
    } catch (error) {
      console.error('[SPRODUCTO] Error en ngOnInit:', error);
      this.presentToast('❌ Error al cargar datos iniciales.');
    }
  }

  async cargarRegiones() {
    this.cargandoRegiones = true;
    try {
      this.regiones = await this.ubicacionService.getRegiones();
    } catch (err) {
      console.error('❌ Error al cargar regiones:', err);
    } finally {
      this.cargandoRegiones = false;
    }
  }

  async onRegionChange(regionId: number) {
    if (!regionId) {
      this.comunas = [];
      return;
    }
    this.comunas = await this.ubicacionService.getComunasPorRegion(regionId);
  }

  // ✅ Método nuevo: limpia nombres de archivos
  sanitizeFileName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .toLowerCase();
  }

  // === Subida de imágenes ===
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
        if (e.target?.result) this.previewUrls.push(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('❌ Completa todos los campos obligatorios.');
      return;
    }

    this.isLoading = true;
    this.isUploadingImages = true;

    try {
      this.presentToast('📤 Subiendo imágenes...', 1500);
      const imageUrls = await this.uploadAllImages();
      this.isUploadingImages = false;

      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || 'assets/img/default.png';
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'publicado';

      await this.http.post(`http://localhost:4000/api/uploadProduct`, this.enser).toPromise();
      this.presentToast('✅ Producto publicado correctamente.');
      localStorage.removeItem('borrador_en_edicion');
      this.router.navigateByUrl('/perfil', { state: { openTab: 'productos', refresh: true } });
    } catch (err) {
      console.error('❌ Error al publicar:', err);
      this.presentToast('Error al subir el producto.');
    } finally {
      this.isLoading = false;
      this.isUploadingImages = false;
    }
  }

  async guardarBorrador(form: NgForm) {
    if (!this.enser.titulo?.trim()) {
      this.presentToast('❌ El título es obligatorio para guardar.');
      return;
    }

    this.isLoading = true;
    this.isUploadingImages = true;

    try {
      this.presentToast('💾 Guardando borrador...', 1000);
      const imageUrls = await this.uploadAllImages();
      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || 'assets/img/default.png';
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'borrador';

      await this.http.post(`http://localhost:4000/api/uploadProduct`, this.enser).toPromise();
      localStorage.setItem('borrador_en_edicion', JSON.stringify(this.enser));
      this.presentToast('📝 Borrador guardado correctamente.');
      this.router.navigateByUrl('/perfil', { state: { openTab: 'borradores', refresh: true } });
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
    const toast = await this.toastController.create({ message, duration, position: 'bottom', color });
    toast.present();
  }
}

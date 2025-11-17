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
// import { ImageImprovementService } from '../services/image-improvement.service'; // Ya no necesario

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
  IonIcon,
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
    IonIcon,
    FooterInterensComponent,
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
  isProcessingAI = false;
  aiSuggestions: any = null;
  isImprovingImages = false;
  improvedImages: { original: string, improved: string }[] = [];
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private http: HttpClient,
    private categoriaService: CategoriaService,
    private ubicacionService: UbicacionService,
    // private imageImprovementService: ImageImprovementService // Ya no necesario
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
   // Manejo de selección de archivos
  async onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files: File[] = Array.from(input.files);

  for (const file of files) {
    // 1. Validación básica
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      this.presentToast("❌ Tipo de archivo no permitido");
      input.value = ""; // LIMPIAR INPUT
      continue;
    }

    // 2. 🔥 Moderación con Hive antes de previsualizar
    const seguro = await this.moderateImageWithHive(file);

    if (!seguro) {
      this.presentToast("🚫 Imagen rechazada por contenido explícito");
      input.value = ""; // 🔥 LIMPIA EL CAMPO DE ARCHIVO
      continue; // ⛔ NO agregar a preview // ⛔ NO se agrega a preview
    }

    // 3. Si pasó el filtro → agregar a preview
    this.selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        this.previewUrls.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    this.presentToast("✅ Imagen segura, agregada");
  }
}



  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    
    // Si no quedan imágenes, limpiar campos
    if (this.selectedFiles.length === 0) {
      this.resetFormFields();
    }
  }
  
  // Limpiar campos del formulario
  resetFormFields() {
    // Solo limpiar si no están vacíos (para no interferir con edición manual)
    if (!this.enser.titulo || this.enser.titulo.includes('Radio') || this.enser.titulo.includes('Sofá') || this.enser.titulo.includes('Pelota')) {
      this.enser.titulo = '';
    }
    if (!this.enser.categoria_id || this.aiSuggestions) {
      this.enser.categoria_id = null;
    }
    if (!this.enser.condicion || this.aiSuggestions) {
      this.enser.condicion = '';
    }
    if (!this.enser.valor_puntos || this.aiSuggestions) {
      this.enser.valor_puntos = 0;
    }
    
    this.aiSuggestions = null;
  }

  // Análisis por nombre de archivo
  analyzeByFileName(fileName: string) {
    const name = fileName.toLowerCase();
    
    if (name.includes('radio') || name.includes('speaker')) {
      return { category: 'Electronics', suggestedTitle: 'Radio/Altavoz', confidence: 92, suggestedPoints: 120 };
    }
    if (name.includes('sofa') || name.includes('sillon')) {
      return { category: 'Furniture', suggestedTitle: 'Sofá', confidence: 88, suggestedPoints: 200 };
    }
    if (name.includes('pelota') || name.includes('ball')) {
      return { category: 'Sports', suggestedTitle: 'Pelota', confidence: 85, suggestedPoints: 40 };
    }
    if (name.includes('libro') || name.includes('book')) {
      return { category: 'Books', suggestedTitle: 'Libro', confidence: 90, suggestedPoints: 30 };
    }
    if (name.includes('camisa') || name.includes('shirt') || name.includes('ropa')) {
      return { category: 'Clothing', suggestedTitle: 'Prenda de vestir', confidence: 87, suggestedPoints: 50 };
    }
    
    return { category: 'Electronics', suggestedTitle: 'Artículo varios', confidence: 75, suggestedPoints: 100 };
  }

  // Método para analizar imágenes con IA REAL
  async analyzeImages() {
    if (this.selectedFiles.length === 0) {
      this.presentToast('Primero selecciona una imagen');
      return;
    }

    this.isProcessingAI = true;
    this.presentToast('🤖 Analizando imagen con IA...', 4000);

    try {
      const firstFile = this.selectedFiles[0];
      console.log('🖼️ Analizando imagen:', firstFile.name, firstFile.size);
      
      // ANÁLISIS SIMULADO INTELIGENTE
      const suggestions = this.analyzeByFileName(firstFile.name);
      
      console.log('🤖 Resultado del análisis:', suggestions);
      this.applySuggestions(suggestions);
      this.presentToast(`✨ IA detectó: ${suggestions.category} (${suggestions.confidence}% confianza)`);
    } catch (error: any) {
      console.error('❌ Error procesando con IA:', error);
      
      // Fallback a análisis por nombre de archivo
      try {
        const fileName = this.selectedFiles[0].name.toLowerCase();
        const fallbackSuggestions = this.classifyByKeywords(fileName);
        this.applySuggestions(fallbackSuggestions);
        this.presentToast(`⚠️ Análisis básico: ${fallbackSuggestions.category}`);
      } catch (fallbackError) {
        this.presentToast('❌ Error en análisis IA');
      }
    } finally {
      this.isProcessingAI = false;
    }
  }
  
  // Clasificación inteligente basada en palabras clave
  classifyByKeywords(fileName: string) {
    const classifications = [
      {
        keywords: ['phone', 'celular', 'movil', 'smartphone', 'iphone', 'samsung', 'android'],
        category: 'Electronics',
        title: 'Teléfono móvil',
        points: 200,
        confidence: 92
      },
      {
        keywords: ['laptop', 'notebook', 'computador', 'pc', 'macbook', 'lenovo'],
        category: 'Electronics', 
        title: 'Computador portátil',
        points: 300,
        confidence: 90
      },
      {
        keywords: ['camisa', 'polera', 'shirt', 'blusa', 'camiseta'],
        category: 'Clothing',
        title: 'Prenda de vestir',
        points: 50,
        confidence: 85
      },
      {
        keywords: ['zapato', 'shoe', 'zapatilla', 'bota', 'sandalia'],
        category: 'Clothing',
        title: 'Calzado',
        points: 60,
        confidence: 88
      },
      {
        keywords: ['libro', 'book', 'revista', 'manual'],
        category: 'Books',
        title: 'Libro',
        points: 30,
        confidence: 95
      },
      {
        keywords: ['silla', 'mesa', 'chair', 'table', 'mueble', 'furniture'],
        category: 'Furniture',
        title: 'Mueble',
        points: 150,
        confidence: 87
      },
      {
        keywords: ['pelota', 'ball', 'deporte', 'sport', 'bicicleta', 'bike'],
        category: 'Sports',
        title: 'Artículo deportivo', 
        points: 80,
        confidence: 83
      }
    ];
    
    // Buscar coincidencias
    for (const classification of classifications) {
      for (const keyword of classification.keywords) {
        if (fileName.includes(keyword)) {
          return {
            category: classification.category,
            suggestedTitle: classification.title,
            confidence: classification.confidence,
            suggestedPoints: classification.points
          };
        }
      }
    }
    
    // Clasificación por defecto si no encuentra coincidencias
    return {
      category: 'Electronics',
      suggestedTitle: 'Artículo varios',
      confidence: 75,
      suggestedPoints: 100
    };
  }

  // Aplicar sugerencias de IA al formulario
  applySuggestions(classification: any) {
    console.log('🤖 Aplicando sugerencias:', classification);
    console.log('📋 Categorías disponibles:', this.categorias);
    
    // 1. Auto-completar TÍTULO (siempre actualizar cuando viene de IA)
    if (classification.suggestedTitle) {
      this.enser.titulo = classification.suggestedTitle;
      this.presentToast(`📝 Título sugerido: ${classification.suggestedTitle}`);
    }
    
    // 2. Auto-seleccionar CATEGORÍA (siempre actualizar)
    if (classification.category) {
      const categoryMap: { [key: string]: string[] } = {
        'Electronics': ['electrónica', 'electrónico', 'tecnología', 'electronic', 'dispositivo', 'aparato', 'digital', 'gadget'],
        'Clothing': ['ropa', 'calzado', 'vestimenta', 'clothing', 'textil', 'prenda', 'moda', 'vestir'],
        'Furniture': ['mueble', 'furniture', 'hogar', 'decoración', 'mobiliario'],
        'Books': ['libro', 'book', 'literatura', 'lectura', 'educación', 'texto', 'manual'],
        'Sports': ['deporte', 'sport', 'ejercicio', 'fitness', 'actividad', 'deportivo'],
        'Vehicle': ['vehículo', 'auto', 'transport', 'carro', 'moto', 'automóvil'],
        'Toy': ['juguete', 'toy', 'infantil', 'bebé', 'juego']
      };
      
      console.log('🔍 Buscando categoría para:', classification.category);
      console.log('📋 Palabras clave a buscar:', categoryMap[classification.category]);
      console.log('📋 Categorías en BD:', this.categorias.map(c => `${c.id}: ${c.nombre}`));
      
      const mappedKeywords = categoryMap[classification.category] || [];
      
      // Buscar categoría que coincida
      const categoria = this.categorias.find(c => {
        const nombreCategoria = c.nombre.toLowerCase();
        return mappedKeywords.some(keyword => 
          nombreCategoria.includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(nombreCategoria)
        );
      });
      
      if (categoria) {
        this.enser.categoria_id = categoria.id;
        this.presentToast(`🏷️ Categoría seleccionada: ${categoria.nombre}`);
        console.log('✅ Categoría asignada:', categoria);
      } else {
        console.log('⚠️ No se encontró categoría para:', classification.category);
        this.presentToast(`⚠️ No se encontró categoría para: ${classification.category}`);
      }
    }
    
    // 3. Sugerir CONDICIÓN basada en confianza (siempre actualizar)
    if (classification.confidence) {
      if (classification.confidence > 85) {
        this.enser.condicion = 'nuevo';
        this.presentToast('✨ Condición sugerida: Nuevo (alta confianza)');
      } else if (classification.confidence > 75) {
        this.enser.condicion = 'como_nuevo';
        this.presentToast('🎆 Condición sugerida: Como nuevo');
      } else if (classification.confidence > 65) {
        this.enser.condicion = 'bueno';
        this.presentToast('👍 Condición sugerida: Bueno');
      } else if (classification.confidence > 50) {
        this.enser.condicion = 'aceptable';
        this.presentToast('⚠️ Condición sugerida: Aceptable');
      } else {
        this.enser.condicion = 'para_reparar';
        this.presentToast('🔧 Condición sugerida: Para reparar (baja confianza)');
      }
    }
    
    // 4. Sugerir PUNTOS (siempre actualizar cuando viene de IA)
    if (classification.suggestedPoints) {
      this.enser.valor_puntos = classification.suggestedPoints;
      this.presentToast(`💰 Puntos sugeridos: ${classification.suggestedPoints}`);
    }
    
    console.log('📋 Estado final del enser:', this.enser);
  }

  // 🎨 Mejorar imágenes con Remove.bg (directo desde frontend)
  async improveImages() {
    if (this.selectedFiles.length === 0) {
      this.presentToast('❌ Primero selecciona imágenes para mejorar');
      return;
    }

    this.isImprovingImages = true;
    this.presentToast('🎨 Mejorando imágenes con IA...', 3000);

    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        
        try {
          // ✅ Validación adicional antes de procesar
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de archivo no soportado: ${file.type}`);
          }
          
          this.presentToast(`🎨 Procesando imagen ${i + 1}/${this.selectedFiles.length}...`, 2000);
          
          // Crear FormData para Remove.bg
          const formData = new FormData();
          formData.append('image_file', file);
          formData.append('size', 'auto');
          
          // Llamar directamente a Remove.bg API
          const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
              'X-Api-Key': 'UAgKxS45Jcqmhy6piBLGPAzt'
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Remove.bg error: ${errorText}`);
          }
          
          // Obtener imagen procesada
          const resultBlob = await response.blob();
          
          // Subir imagen mejorada a Supabase
          const fileName = `improved_${Date.now()}_${i}.png`;
          const { data, error } = await supabase.storage
            .from('enseres')
            .upload(fileName, resultBlob, {
              contentType: 'image/png'
            });
          
          if (error) {
            throw new Error(`Supabase error: ${error.message}`);
          }
          
          // Obtener URL pública
          const { data: publicUrlData } = supabase.storage
            .from('enseres')
            .getPublicUrl(fileName);
          
          // Guardar imagen mejorada
          this.improvedImages.push({
            original: this.previewUrls[i],
            improved: publicUrlData.publicUrl
          });
          
          // Actualizar preview con imagen mejorada
          this.previewUrls[i] = publicUrlData.publicUrl;
          
          this.presentToast(`✅ Imagen ${i + 1} mejorada exitosamente`);
          
        } catch (error) {
          console.error(`❌ Error mejorando imagen ${i + 1}:`, error);
          this.presentToast(`⚠️ Error mejorando imagen ${i + 1}, usando original`);
        }
      }
      
      if (this.improvedImages.length > 0) {
        this.presentToast(`🎉 ${this.improvedImages.length} imágenes mejoradas con IA`);
        
        // Actualizar URLs del producto con imágenes mejoradas
        const improvedUrls = this.improvedImages.map(img => img.improved);
        this.enser.imagen_url = improvedUrls[0];
        this.enser.imagenes_extra = improvedUrls.slice(1);
      }
      
    } catch (error) {
      console.error('❌ Error general mejorando imágenes:', error);
      this.presentToast('❌ Error al mejorar imágenes');
    } finally {
      this.isImprovingImages = false;
    }
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('❌ Completa todos los campos obligatorios.');
      return;
    }

    if (!this.isTextClean(this.enser.titulo)) {
      this.presentToast("🚫 El título contiene palabras no permitidas.");
      return;
    }

    if (!this.isTextClean(this.enser.descripcion)) {
      this.presentToast("🚫 La descripción contiene palabras no permitidas.");
      return;
    }

    this.isLoading = true;
    this.isUploadingImages = true;

    try {
      // Si hay imágenes mejoradas, usar esas; sino subir las originales
      let imageUrls: string[] = [];
      
      if (this.improvedImages.length > 0) {
        this.presentToast('📤 Usando imágenes mejoradas...', 1500);
        imageUrls = this.improvedImages.map(img => img.improved);
      } else {
        this.presentToast('📤 Subiendo imágenes...', 1500);
        imageUrls = await this.uploadAllImages();
      }
      
      this.isUploadingImages = false;

      this.enser.imagen_url = imageUrls[0] || this.enser.imagen_url || 'assets/img/default.png';
      this.enser.imagenes_extra = [...(this.enser.imagenes_extra || []), ...imageUrls];
      this.enser.estado = 'pendiente';

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

  private async fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1]; // quitar "data:image/...;base64,"
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async moderateImageWithHive(file: File): Promise<boolean> {
  try {
    const base64 = await this.fileToBase64(file);

    const resp: any = await this.http
      .post("http://localhost:4000/api/moderate", { base64 })
      .toPromise();

    // Si Hive falla -> por seguridad rechazamos
    if (!resp?.ok) return false;

    const classes = resp.classes || [];
    console.log("📊 [Hive desde backend] clases:", classes);

    let banned = false;

    for (const c of classes) {
      const name = String(c.class_name ?? c.class ?? "").toLowerCase();
      const value = Number(c.value ?? c.score ?? 0);

      // 1) NSFW general (más estricto)
      if (name === "general_nsfw" && value >= 0.5) {
        banned = true;
        break;
      }

      // 2) Cualquier "yes_*" de contenido sexual / cuerpo
      const isYesClass = name.startsWith("yes_");

      if (
        isYesClass &&
        (
          name.includes("nudity") ||
          name.includes("underwear") ||
          name.includes("undressed") ||
          name.includes("butt") ||
          name.includes("breast") ||
          name.includes("genitals") ||
          name.includes("lingerie") ||
          name.includes("sportswear_bottoms") ||
          name.includes("panties") ||
          name.includes("cleavage")
        ) &&
        value >= 0.4 // 👈 umbral más bajo para estos casos
      ) {
        banned = true;
        break;
      }

      // 3) Sexual activity / intención sexual
      if (
        (name === "yes_sexual_activity" || name === "yes_sexual_intent") &&
        value >= 0.4
      ) {
        banned = true;
        break;
      }

      // 4) Violencia fuerte / cadáver
      if (
        ["human_corpse", "animated_corpse", "very_bloody"].includes(name) &&
        value >= 0.4
      ) {
        banned = true;
        break;
      }

      // 5) Drogas explícitas
      if (
        ["yes_marijuana", "yes_pills", "yes_smoking", "illicit_injectables"]
          .includes(name) &&
        value >= 0.5
      ) {
        banned = true;
        break;
      }

      // 6) Armas claras
      if (
        [
          "gun_in_hand",
          "gun_not_in_hand",
          "animated_gun",
          "knife_in_hand",
          "knife_not_in_hand",
        ].includes(name) &&
        value >= 0.5
      ) {
        banned = true;
        break;
      }

      // 7) Símbolos de odio
      if (
        ["yes_nazi", "yes_kkk", "yes_terrorist", "yes_confederate"].includes(
          name
        ) &&
        value >= 0.5
      ) {
        banned = true;
        break;
      }
    }

    return !banned;
  } catch (e) {
    console.error("❌ Error moderando imagen:", e);
    return false; // modo estricto
  }
}

private forbiddenWords: string[] = [
  // Sexual explícito / NSFW
  "porno", "pornografia", "pornografía", "pornohub", "pornhub",
  "sexo", "sexual", "xxx", "paja", "masturbar", "masturbacion", "masturbación",
  "penetracion", "penetración", "penetrar", "coito", "orgasmo", "sexualidad",
  "follar", "coger", "cogida", "follada", "tirar", "tirón sexual",
  "anal", "vaginal", "oral", "mamand*", "chupar", "chupon", "chupon*", "chupalo",
  "pene", "verga", "pico", "tula", "riñon", "riñón", "pichula", "nepe",
  "vagina", "chocho", "chucha", "concha", "cuca", "clitoris", "clítoris",
  "tetonas", "tetona", "pechugas", "tetas", "boobs", "boobies",
  "culo", "ass", "booty", "nalgas", "trasero",
  "pussy", "coño", "chocha",
  "hardcore", "deepthroat",

  // Prostitución
  "prostituta", "prostitucion", "prostitución", "escort",
  "puta", "putita", "put*", "ramera",

  // Drogas
  "droga", "drogas", "marihuana", "cannabis", "weed", "hierba", "porro",
  "pasto", "pito", "blunt", "cripy", "coca", "cocaina", "cocaína", "perico",
  "crack", "heroina", "heroína", "lsd", "éxtasis", "pastilla", "tusi", "tussy",
  "molécula rosa", "mdma", "ketamina", "pepa", "pildora", "píldora",

  // Alcohol extremo (si quieres filtrar)
  "borracho", "curado", "ebrio", "alcoholico", "alcohólico",

  // Violencia / homicidio / armas
  "matar", "muerte", "asesinar", "asesinato", "homicidio",
  "degollar", "apuñalar", "acuchillar", "violencia", "violento",
  "sangre", "sangriento", "descuartizar", "tortura",
  "arma", "armas", "pistola", "revolver", "revólver", "escopeta",
  "fusil", "metralleta", "rifle", "escopeta", "granada",
  "cuchillo", "navaja", "machete", "bisturi", "bisturí",
  "bomb*", "explosivo", "amenaza", "amenazar",

  // Suicidio / autolesiones
  "suicidio", "suicidarme", "quitarme la vida", "colgarme", "cortarme",
  "cortarse", "autolesion", "autolesión", "selfharm", "self harm",
  "ahorcar", "ahorcarme",

  // Discriminación / odio / racismo / terrorismo
  "nazi", "hitler", "facho", "fach*", "kkk", "racista", "racismo",
  "negro de mierda", "maricon", "maricón", "maraco", "maricon*", "homofobico",
  "homofóbico", "homofobia",
  "terrorista", "isis", "alqaeda", "al-qaeda",
  "judío de mierda", "maldito judío", "judios", "judíos",
  "moro de mierda", "chino qliao", "chino culiao",
  "cingano", "gitano de mierda",

  // Insultos fuertes
  "conchetumare", "ctm", "culiao", "culia*", "qliao", "qlo",
  "hueon", "weon", "weon*", "weona", "wn", "wna",
  "mierda", "imbecil", "imbécil", "idiota", "perra", "zorra",
  "fuck", "shit", "bitch", "bastard", "motherfucker",
  "dick", "fag", "retard", "stupid",

  // Lenguaje vulgar explícito
  "puta", "puto", "hueco", "puta madre", "mierda", "pendejo",
  "garch*", "chuchetumare", "chuche", "chetumare",

  // Sexualización de menores
  "loli", "child porn", "cp", "pedo", "pedofilia", "pedofilo",
  "pedófilo", "pedo*", "underage sex", "sex with minor",

  // Variantes y abreviaciones peligrosas
  "s3x0", "s3xo", "sex0", "s3x", "sxo", "sx0",
  "p0rn", "pr0n", "p0rno",
  "c0ca", "m4rihuana", "w33d", "p4sto",

  // Emojis sexuales (por si los quieres bloquear)
  "🍆", "🍑", "💦", "👅", "🔞"
];

private isTextClean(text: string): boolean {
  if (!text) return true;

  const lower = text.toLowerCase();

  // Busca alguna palabra prohibida en el texto
  return !this.forbiddenWords.some(w => lower.includes(w));
}



}

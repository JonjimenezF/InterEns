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

  // ❌ Eliminar imagen de previsualización
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

      const { data, error } = await this.enserService.addEnser(this.enser);
      if (error) throw error;

      this.presentToast('✅ Enser registrado con éxito.');
      this.router.navigate(['/home']);
    } catch (err) {
      console.error('[SPRODUCTO] Error al guardar:', err);
      this.presentToast('❌ Error al subir el enser o las imágenes.');
    }
  }

  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  goBack() {
    this.navCtrl.back();
  }
}

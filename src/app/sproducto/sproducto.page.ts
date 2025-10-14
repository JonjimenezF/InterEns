// ✅ Este componente permite crear un nuevo "enser" (producto) y subir una imagen a Supabase Storage.

// Importaciones base de Angular
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from '../services/supabase.client';
import { EnserService } from '../services/enser.service';

// Importaciones de Ionic (standalone)
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

// Librerías externas
import { v4 as uuidv4 } from 'uuid';



@Component({
  selector: 'app-sproducto',
  templateUrl: './sproducto.page.html',
  styleUrls: ['./sproducto.page.scss'],
  standalone: true,

  // ✅ Aquí agregamos todos los módulos y componentes que el HTML necesita
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
    IonLabel,       // 👈 Imprescindible para evitar el error NG8001
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SproductoPage implements OnInit {

  // 📁 Imagen seleccionada por el usuario antes de subir
  selectedFile: File | null = null;

  // 👤 Información del usuario autenticado que sube el producto
  userInfo?: any;

  // 🧱 Campos principales del enser (producto)
  enser = {
    propietario_id: '',
    titulo: '',
    descripcion: '',
    categoria_id: null,
    valor_puntos: 0,
    ciudad: '',
    region: ''
  };

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private enserService: EnserService
  ) {
    // 🔍 Recuperamos el estado enviado desde la página anterior (Home)
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  ngOnInit() {
    // ⚙️ Asignamos el id del usuario autenticado al campo propietario del enser
    if (this.userInfo) {
      this.enser.propietario_id = this.userInfo.id;
    }
  }

  // 📂 Captura el archivo seleccionado desde el input <input type="file">
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // 🚀 Sube el archivo seleccionado a Supabase Storage
  async uploadToSupabaseStorage(file: File): Promise<string> {
    const fileName = `${uuidv4()}-${file.name}`; // Generamos un nombre único
    const { data, error } = await supabase.storage.from('enseres').upload(fileName, file);

    if (error) throw error;

    // 🔗 Obtenemos la URL pública para mostrar la imagen luego en la app
    const { data: publicUrlData } = supabase.storage.from('enseres').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  }

  // 💾 Registra el enser y su imagen en la base de datos
  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.presentToast('Completa todos los campos.');
      return;
    }

    try {
      // 1️⃣ Subimos la imagen a Supabase Storage (si el usuario seleccionó una)
      let imagenUrl: string | null = null;
      if (this.selectedFile) {
        this.presentToast('Subiendo imagen...', 2000);
        imagenUrl = await this.uploadToSupabaseStorage(this.selectedFile);
      }

      // 2️⃣ Insertamos el enser en la tabla "enseres"
      const { data: enser, error } = await this.enserService.addEnser(this.enser);
      if (error) throw error;

      // 3️⃣ Asociamos la URL de la imagen con el enser recién creado
      if (imagenUrl) {
        await this.enserService.addImagen(enser.id, imagenUrl, true);
      }

      this.presentToast('Enser registrado con éxito.');
      this.router.navigate(['/home']); // Volver al inicio
    } catch (err) {
      console.error(err);
      this.presentToast('Error al subir el enser o la imagen.');
    }
  }

  // 🧾 Muestra mensajes en la parte inferior de la pantalla
  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  // 🔙 Volver a la pantalla anterior
  goBack() {
    this.navCtrl.back();
  }
}

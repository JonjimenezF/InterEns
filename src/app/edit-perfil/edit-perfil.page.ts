// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { supabase } from 'src/shared/supabase/supabase.client';
// import { ViewChild, ElementRef } from '@angular/core';

// type Direccion = {
//   alias?: string | null;
//   linea_direccion?: string | null;
//   ciudad?: string | null;
//   region?: string | null;
//   codigo_postal?: string | null;
//   latitud?: number | null;
//   longitud?: number | null;
//   es_predeterminada?: boolean | null;
// };

// @Component({
//   selector: 'app-edit-perfil',
//   templateUrl: './edit-perfil.page.html',
//   styleUrls: ['./edit-perfil.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
  
  
// })




// export class EditPerfilPage implements OnInit {
//   nombre: string | null = null;
//   email: string | null = null;
//   avatarUrl: string | null = null;

//   formNombre = '';
//   formTelefono = '';
//   formNombreUsuario = '';

//   dir: Direccion = {
//   alias: '',
//   linea_direccion: '',
//   ciudad: '',
//   region: '',
//   codigo_postal: '',
//   latitud: null,
//   longitud: null,
//   es_predeterminada: false, 
//   };  
//   loading = true;
//   uploading = false;
//   saving = false;

//   userId: string | undefined;
//   userInfo?: any;

//   @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

//   constructor(private router: Router, private toast: ToastController) {}

//   async ngOnInit() {
//     await this.cargarTodo();

//   }

//   private async getToken() {
//     const { data: { session } } = await supabase.auth.getSession();
//     return session?.access_token ?? null;
//   }

//   private async cargarTodo() {
//     this.loading = true;
//     try {
//       await Promise.all([this.cargarPerfil(), this.cargarDireccion()]);
//     } finally {
//       this.loading = false;
//     }
//   }

//   private async cargarPerfil() {
//     const token = await this.getToken(); if (!token) return;
//     const r = await fetch('http://127.0.0.1:4000/profile/me', { headers: { Authorization: `Bearer ${token}` }});
//     const p = await r.json();
//     this.nombre = p?.nombre_completo ?? null;
//     this.email = p?.email ?? null;
//     this.avatarUrl = p?.avatar_url ?? null;
//     this.formNombre = this.nombre ?? '';
//     this.formTelefono = p?.telefono ?? '';
//     this.formNombreUsuario = p?.nombre_usuario ?? '';
//   }

//   private async cargarDireccion() {
//     const token = await this.getToken(); if (!token) return;
//     const r = await fetch('http://127.0.0.1:4000/profile/address', { headers: { Authorization: `Bearer ${token}` }});
//     const d = await r.json();
//     this.dir = {
//       alias: d?.alias ?? '',
//       linea_direccion: d?.linea_direccion ?? '',
//       ciudad: d?.ciudad ?? '',
//       region: d?.region ?? '',
//       codigo_postal: d?.codigo_postal ?? '',
//       latitud: d?.latitud ?? null,
//       longitud: d?.longitud ?? null,
//       es_predeterminada: !!d?.es_predeterminada,
//     };
//   }

//   abrirSelectorFoto() {
//     if (!this.uploading && !this.saving) this.fileInput?.nativeElement.click();
//   }

//   async onFileSelected(e: Event) {
//     const input = e.target as HTMLInputElement;
//     const file = input.files?.[0];
//     if (!file) return;
//     const token = await this.getToken(); if (!token) return;

//     try {
//       this.uploading = true;
//       const fd = new FormData();
//       fd.append('file', file);

//       const res = await fetch('http://127.0.0.1:4000/profile/avatar', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       this.avatarUrl = json?.avatar_url ?? this.avatarUrl;
//       await this.showToast('Foto actualizada ✅', 'success');
//     } catch (err) {
//       console.error(err);
//       await this.showToast('Error al subir la foto', 'danger');
//     } finally {
//       this.uploading = false;
//       if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
//     }
//   }

//   async guardar() {
//     if (this.saving || this.loading) return;

//     const token = await this.getToken(); if (!token) return;
//     const nombre = (this.formNombre || '').trim();

//     if (!nombre) {
//       await this.showToast('El nombre no puede estar vacío', 'warning');
//       return;
//     }

//     this.saving = true;
//     try {
//       // 1) Perfil
//       const r1 = await fetch('http://127.0.0.1:4000/profile/editperfil', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({
//           nombre_completo: nombre,
//           telefono: this.formTelefono || undefined,
//           nombre_usuario: this.formNombreUsuario || undefined
//         })
//       });
//       if (!r1.ok) throw new Error(`Perfil HTTP ${r1.status}`);

//       // 2) Dirección
//       const r2 = await fetch('http://127.0.0.1:4000/profile/address', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(this.dir)
//       });
//       if (!r2.ok) throw new Error(`Dirección HTTP ${r2.status}`);

//       await this.cargarTodo();
//       await this.showToast('Cambios guardados ✅', 'success');
//       // this.router.navigate(['/perfil']);
//     } catch (e) {
//       console.error(e);
//       await this.showToast('No se pudieron guardar los cambios', 'danger');
//     } finally {
//       this.saving = false;
//     }
//   }

//   private async showToast(message: string, color: 'success'|'danger'|'warning'|'medium' = 'medium') {
//     const t = await this.toast.create({ message, color, duration: 1800, position: 'bottom' });
//     await t.present();
//   }
// }

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from 'src/shared/supabase/supabase.client';

type Direccion = {
  linea_direccion?: string | null;
  region_id?: number | null;
  comuna_id?: number | null;
  latitud?: number | null;
  longitud?: number | null;
};

@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.page.html',
  styleUrls: ['./edit-perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class EditPerfilPage implements OnInit {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;

  formNombre = '';
  formTelefono = '';
  formNombreUsuario = '';

  dir: Direccion = {
    linea_direccion: '',
    region_id: null,
    comuna_id: null,
  };

  regiones: any[] = [];
  comunas: any[] = [];

  loading = true;
  uploading = false;
  saving = false;
  userId: string | undefined;
  userInfo?: any;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private toast: ToastController) {}

  async ngOnInit() {
    await this.cargarTodo();
  }

  private async getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async cargarTodo() {
    this.loading = true;
    try {
      await Promise.all([this.cargarRegiones(), this.cargarPerfil(), this.cargarDireccion()]);
    } finally {
      this.loading = false;
    }
  }

  // 🔹 Cargar perfil de usuario
  private async cargarPerfil() {
    const token = await this.getToken();
    if (!token) return;

    const r = await fetch('http://127.0.0.1:4000/profile/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const p = await r.json();
    this.nombre = p?.nombre_completo ?? null;
    this.email = p?.email ?? null;
    this.avatarUrl = p?.avatar_url ?? null;
    this.formNombre = this.nombre ?? '';
    this.formTelefono = p?.telefono ?? '';
    this.formNombreUsuario = p?.nombre_usuario ?? '';
  }

  // 🔹 Cargar dirección actual
  private async cargarDireccion() {
    const token = await this.getToken();
    if (!token) return;

    const r = await fetch('http://127.0.0.1:4000/profile/address', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json();

    this.dir = {
      linea_direccion: d?.linea_direccion ?? '',
      region_id: null,
      comuna_id: null,
      latitud: d?.latitud ?? null,
      longitud: d?.longitud ?? null,
    };

    // 🧭 intentar preseleccionar región y comuna por nombre
    const regionEncontrada = this.regiones.find((r) => r.nombre === d?.region);
    if (regionEncontrada) {
      this.dir.region_id = regionEncontrada.id;
      await this.cargarComunas();
      const comunaEncontrada = this.comunas.find((c) => c.nombre === d?.ciudad);
      if (comunaEncontrada) this.dir.comuna_id = comunaEncontrada.id;
    }
  }

  // 🌎 Cargar regiones desde Supabase
  private async cargarRegiones() {
    const { data, error } = await supabase
      .from('regiones')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    if (error) console.error('❌ Error al cargar regiones:', error.message);
    else this.regiones = data || [];
  }

  // 🏙️ Cargar comunas según la región seleccionada
  async cargarComunas() {
    if (!this.dir.region_id) return;
    const { data, error } = await supabase
      .from('comunas')
      .select('id, nombre')
      .eq('region_id', this.dir.region_id)
      .order('nombre', { ascending: true });

    if (error) console.error('❌ Error al cargar comunas:', error.message);
    else this.comunas = data || [];
  }

  // 🧍‍♀️ Avatar
  abrirSelectorFoto() {
    if (!this.uploading && !this.saving) this.fileInput?.nativeElement.click();
  }

  async onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const token = await this.getToken();
    if (!token) return;

    try {
      this.uploading = true;
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('http://127.0.0.1:4000/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      this.avatarUrl = json?.avatar_url ?? this.avatarUrl;
      await this.showToast('Foto actualizada ✅', 'success');
    } catch (err) {
      console.error(err);
      await this.showToast('Error al subir la foto', 'danger');
    } finally {
      this.uploading = false;
      if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    }
  }

  // 💾 Guardar cambios
  async guardar() {
    if (this.saving || this.loading) return;
    const token = await this.getToken();
    if (!token) return;
    const nombre = (this.formNombre || '').trim();

    if (!nombre) {
      await this.showToast('El nombre no puede estar vacío', 'warning');
      return;
    }

    this.saving = true;
    try {
      // 1️⃣ Actualizar perfil
      const r1 = await fetch('http://127.0.0.1:4000/profile/editperfil', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo: nombre,
          telefono: this.formTelefono || undefined,
          nombre_usuario: this.formNombreUsuario || undefined,
        }),
      });
      if (!r1.ok) throw new Error(`Perfil HTTP ${r1.status}`);

      // 2️⃣ Actualizar dirección — convierte IDs a nombres antes de enviar
      const regionSeleccionada = this.regiones.find(r => r.id === this.dir.region_id);
      const comunaSeleccionada = this.comunas.find(c => c.id === this.dir.comuna_id);

      const direccionPayload = {
        linea_direccion: this.dir.linea_direccion,
        region: regionSeleccionada?.nombre || null,
        ciudad: comunaSeleccionada?.nombre || null,
        latitud: this.dir.latitud,
        longitud: this.dir.longitud,
      };

      console.log('📦 Enviando dirección:', direccionPayload);

      const r2 = await fetch('http://127.0.0.1:4000/profile/address', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(direccionPayload),
      });
      if (!r2.ok) throw new Error(`Dirección HTTP ${r2.status}`);

      await this.cargarTodo();
      await this.showToast('Cambios guardados ✅', 'success');
    } catch (e) {
      console.error('❌ Error al guardar:', e);
      await this.showToast('No se pudieron guardar los cambios', 'danger');
    } finally {
      this.saving = false;
    }
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'medium' = 'medium'
  ) {
    const t = await this.toast.create({
      message,
      color,
      duration: 1800,
      position: 'bottom',
    });
    await t.present();
  }
}

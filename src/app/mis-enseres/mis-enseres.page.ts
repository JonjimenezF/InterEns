import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from '../services/supabase.client';

@Component({
  selector: 'app-mis-enseres',
  templateUrl: './mis-enseres.page.html',
  styleUrls: ['./mis-enseres.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MisEnseresPage implements OnInit {
  userInfo: any = null;
  enseres: any[] = [];
  loading = true;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarEnseres();
  }

  // 🔐 Cargar los enseres del usuario autenticado
  async cargarEnseres() {
    try {
      const { data: sessionData, error: sErr } = await supabase.auth.getSession();
      if (sErr) throw sErr;

      const user = sessionData?.session?.user;
      if (!user) {
        this.presentToast('Debes iniciar sesión para ver tus enseres.');
        this.router.navigate(['/portada']);
        return;
      }

      this.userInfo = user;

      const { data, error } = await supabase
        .from('enseres')
        .select('*')
        .eq('propietario_id', user.id)
        ;

      if (error) throw error;

      this.enseres = data || [];
    } catch (err) {
      console.error('[MIS-ENSERES] Error al cargar enseres:', err);
      this.presentToast('❌ Error al cargar tus enseres.');
    } finally {
      this.loading = false;
    }
  }

  // 🔙 Volver atrás
  goBack() {
    this.navCtrl.back();
  }

  async presentToast(message: string, duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }
}

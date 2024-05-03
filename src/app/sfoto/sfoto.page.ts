import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';



@Component({
  selector: 'app-sfoto',
  templateUrl: './sfoto.page.html',
  styleUrls: ['./sfoto.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SfotoPage implements OnInit {


  selectedFile: File | null = null;
  nombreFoto: string | undefined;

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('foto', this.selectedFile);
  
      this.http.post<any>('http://localhost:5000/upload', formData).subscribe(
        (response) => {
          console.log(response);
          alert('Imagen subida con éxito');
          this.nombreFoto = response.nombre_foto; // Asignar el nombre de la foto
        },
        (error) => {
          console.error(error);
          alert('Error al subir la imagen');
        }
      );
    }
  }

  eliminarFoto(nombreFoto: string) {
    this.http.delete<any>(`http://localhost:5000/eliminar_foto/${nombreFoto}`).subscribe(
      (response) => {
        console.log(response);
        alert('Foto eliminada correctamente');
      },
      (error) => {
        console.error(error);
        alert('Error al eliminar la foto');
      }
    );
  }

  // producto={
  //   descripcion: "",
  //   precio: "",
  //   foto: "",
  // }

  
  
  // selectedFile: File | null = null;

  // constructor(private http: HttpClient, private router: Router, public toastController: ToastController, private navCtrl: NavController) { }

  // onFileSelected(event: any) {
  //    this.selectedFile = event.target.files[0];
  // }

  // onSubmit() {
  //   if (this.selectedFile) {
  //     const formData = new FormData();
  //     formData.append('file', this.selectedFile);

  //     this.http.post<any>('http://localhost:5000/upload', formData).subscribe(
  //       (response) => {
  //         console.log(response);
  //         alert('Imagen subida con éxito');
  //       },
  //       (error) => {
  //         console.error(error);
  //         alert('Error al subir la imagen');
  //       }
  //     );
  //   }
  // }


  // submitForm() {
  //   // Aquí puedes envi el formulario o hacer lo que necesites con los datos del producto
  //   console.log(this.producto);
  //   // Reiniciar el formulario después de enviar los datos
  //   this.producto = {
  //     descripcion: '',
  //     precio: '',
  //     foto: '',
  //   };
    
  // }




  ngOnInit() {
   }

  // goSubirfoto() {
  //   // Aquí puedes agregar la lógica para navegar a la página de subir foto
  //   // Por ejemplo:
  //   this.router.navigate(['/sfoto']);
  // }

  

}

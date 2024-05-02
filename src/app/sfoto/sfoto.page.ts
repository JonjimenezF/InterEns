import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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

  constructor(private http: HttpClient, private router: Router) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://localhost:5000/upload', formData).subscribe(
        (response) => {
          console.log(response);
          alert('Imagen subida con éxito');
        },
        (error) => {
          console.error(error);
          alert('Error al subir la imagen');
        }
      );
    }
  }





  ngOnInit() {
  }

  goSubirfoto() {
    // Aquí puedes agregar la lógica para navegar a la página de subir foto
    // Por ejemplo:
    this.router.navigate(['/sfoto']);
  }

}

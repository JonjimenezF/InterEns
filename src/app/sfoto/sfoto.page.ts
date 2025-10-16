// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton, IonContent } from '@ionic/angular/standalone';
// import { NavController, ToastController } from '@ionic/angular';
// import { HttpClient } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ProductoService } from '../servicios/producto.service';
// import { CategoriaService } from '../servicios/categoria.service'; 



// @Component({
//   selector: 'app-sfoto',
//   templateUrl: './sfoto.page.html',
//   styleUrls: ['./sfoto.page.scss'],
//   standalone: true,
//   imports: [
//     IonHeader, 
//     IonToolbar,
//     IonButtons,
//     IonBackButton,
//     IonTitle,
//     IonButton,
//     IonContent,
//     CommonModule, 
//     FormsModule
//   ]
  
// })
// export class SfotoPage implements OnInit {

//   categorias: any[] = [];
 

//   fotos: string[] = [];
//   selectedFiles: File[] = [];
//   nombreFoto: string = '';

//   creadoProducto?: any;
//   imagePreviews: string[] = [];
//   idProducto: number = 0;
//   orden: number = 0;

  
//   imagen = {
//     id_producto: 1,
//     url_imagen: '',
//     orden: 1,
//   }

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private activateRoute: ActivatedRoute,
//     public toastController: ToastController,
//     private productService: ProductoService,
//     private navCtrl: NavController,
//     private categoriaService: CategoriaService
//   ) {
//     const state = this.router.getCurrentNavigation()?.extras.state;
//     if (state && state['creadoProducto']) {
//       this.creadoProducto = state['creadoProducto'];
//     }
//   }

//   async ngOnInit() {
//     if (this.creadoProducto) {
//       console.log(this.creadoProducto);
//     } else {
//       console.log('El objeto userInfo es null o undefined');
//     }
//   }

//   triggerFileInput() {
//     const fileInput = document.getElementById('fileInput') as HTMLElement;
//     fileInput.click();
//   }

//   onFileSelected(event: any) {

//     const file: File = event.target.files[0];
//     this.selectedFiles.push(file);
//     console.log(file)

//     // Mostrar previsualización de la imagen
//     const reader = new FileReader();
    
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       this.imagePreviews.push(reader.result as string);
//       console.log(this.imagePreviews)
//     };
//   }

//   onSubmit() {
//     if (this.selectedFiles.length === 0) {
//       alert('Por favor, seleccione al menos una imagen para subir');
//       return; // Salir de la función si no hay archivos seleccionados
//     }

//     for (let index = 0; index < this.selectedFiles.length; index++) {
//       console.log(index)
//       const file = this.selectedFiles[index];
//       const formData = new FormData();
//       formData.append('foto', file);
//       formData.append('id_producto', this.creadoProducto.toString());
//       formData.append('orden', (this.orden + index).toString());
    
//       console.log('Index:', index);
//       console.log(formData);
    
//       this.http.post<any>('https://pystore-interens-7.onrender.com/upload', formData).subscribe(
//         (response) => {
//           console.log(response);
//           this.presentToast('Imagen subida con éxito');
          
//           // Guardar la información de la imagen en la base de datos
//           const imagen = {
//             id_producto: this.creadoProducto,
//             url_imagen: response.nombre_foto, // Ajusta esto según la respuesta del servidor
//             orden: this.orden + index // Ajusta esto según tu lógica
//           };
    
//           this.guardarImagenEnBaseDeDatos(imagen);
//         },
//         (error) => {
//           console.error(error);
//           alert('Imagen subida con éxito');
//         }
//       );
//     }
//     console.log(this.selectedFiles);
//     // Limpiar la lista de imágenes seleccionadas
//     this.selectedFiles = [];
//     this.imagePreviews = [];

//   }

//   guardarImagenEnBaseDeDatos(imagen: any) {
//     this.productService.addImagenProduct(imagen).subscribe(
//       (response) => {
//         this.router.navigate(['/home'])
//         console.log('Imagen guardada en la base de datos', response);
//       },
//       (err) => {
//         console.error('Error al guardar la imagen en la base de datos', err);
//       }
//     );
//   }

//   eliminarFotos() {
//     // Eliminar la última imagen seleccionada
//     this.selectedFiles.pop();
//     this.imagePreviews.pop();
//   }

//   async presentToast(message: string, duration: number = 2000) {
//     const toast = await this.toastController.create({
//       message,
//       duration,
//       position: 'bottom'
//     });
//     toast.present();
//   }
  


  


//   goProducto(){
//     this.router.navigate(['/producto']);
//   }

//   home(){
//     this.router.navigate(['/home']);
//   }

//   perfil(){
//     this.router.navigate(['/perfil']);
//   }

//   salir(){

//   }
//   puntoLimpio(){

//   }

//   goBack() {
//     this.navCtrl.back();
//   }
// }

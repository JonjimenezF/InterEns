import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.page.html',
  styleUrls: ['./preguntas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonicModule]
})
export class PreguntasPage implements OnInit {

  constructor() { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const questions = document.querySelectorAll('.question');

      questions.forEach((question, index) => {
        question.addEventListener('click', () => {
          const answer = document.getElementById(`answer${index + 1}`);
          if (answer) {
            answer.style.display = (answer.style.display === 'none' || !answer.style.display) ? 'block' : 'none';
          }
        });
      });
    });
  }


}

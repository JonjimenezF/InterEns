import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageImprovementService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  improveImage(imageUrl: string): Observable<{ improvedUrl: string }> {
    return this.http.post<{ improvedUrl: string }>(`${this.apiUrl}/improve-image`, {
      imageUrl
    });
  }
}
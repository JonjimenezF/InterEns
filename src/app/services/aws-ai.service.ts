import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../../environments/aws-config';

@Injectable({
  providedIn: 'root'
})
export class AwsAiService {
  private rekognition: AWS.Rekognition;

  constructor() {
    console.log('🔧 Configurando AWS con:', { ...awsConfig, secretAccessKey: '***' });
    AWS.config.update(awsConfig);
    this.rekognition = new AWS.Rekognition();
    console.log('✅ AWS Rekognition inicializado');
  }

  async detectLabels(imageFile: File): Promise<any> {
    try {
      console.log('🔍 Iniciando detección de etiquetas para:', imageFile.name);
      const imageBytes = await this.fileToBytes(imageFile);
      console.log('🔍 Imagen convertida a bytes, tamaño:', imageBytes.length);
      
      const params = {
        Image: { Bytes: imageBytes },
        MaxLabels: 10,
        MinConfidence: 70
      };
      
      console.log('🔍 Enviando a Rekognition...');
      const result = await this.rekognition.detectLabels(params).promise();
      console.log('✅ Respuesta de Rekognition:', result);
      
      const processed = this.processLabels(result.Labels || []);
      console.log('✅ Etiquetas procesadas:', processed);
      
      return processed;
    } catch (error) {
      console.error('❌ Error en Rekognition:', error);
      throw error;
    }
  }

  private fileToBytes(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private processLabels(labels: any[]): any {
    console.log('🔍 Etiquetas detectadas:', labels);
    
    const categories = {
      'Electronics': ['Phone', 'Mobile Phone', 'Computer', 'Television', 'Camera', 'Laptop', 'Electronics', 'Screen', 'Monitor', 'Tablet', 'Radio', 'Speaker', 'Device'],
      'Clothing': ['Clothing', 'Shirt', 'Pants', 'Shoe', 'Dress', 'Apparel', 'Footwear', 'T-Shirt', 'Jacket'],
      'Furniture': ['Chair', 'Table', 'Sofa', 'Bed', 'Desk', 'Furniture', 'Couch', 'Armchair'],
      'Books': ['Book', 'Magazine', 'Paper', 'Text', 'Publication'],
      'Sports': ['Ball', 'Equipment', 'Bicycle', 'Sports Equipment', 'Exercise Equipment'],
      'Vehicle': ['Car', 'Vehicle', 'Transportation', 'Automobile', 'Motorcycle', 'Bike'],
      'Toy': ['Toy', 'Game', 'Doll', 'Action Figure']
    };

    let detectedCategory = 'Electronics'; // Default más común
    let confidence = 75; // Confianza base
    let suggestedTitle = 'Dispositivo electrónico';
    let bestLabel = null;

    // Buscar la mejor coincidencia
    for (const label of labels) {
      for (const [category, keywords] of Object.entries(categories)) {
        const match = keywords.find(keyword => 
          label.Name.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(label.Name.toLowerCase())
        );
        
        if (match && label.Confidence > confidence) {
          detectedCategory = category;
          confidence = label.Confidence;
          suggestedTitle = this.generateTitle(label.Name, category);
          bestLabel = label;
        }
      }
    }

    return {
      category: detectedCategory,
      confidence: Math.round(confidence),
      suggestedTitle,
      bestLabel,
      allLabels: labels.slice(0, 5).map(l => ({ name: l.Name, confidence: Math.round(l.Confidence) }))
    };
  }

  private generateTitle(labelName: string, category: string): string {
    const prefixes = {
      'Electronics': 'Dispositivo',
      'Clothing': 'Prenda',
      'Furniture': 'Mueble', 
      'Books': 'Libro',
      'Sports': 'Artículo deportivo',
      'Vehicle': 'Vehículo',
      'Toy': 'Juguete'
    };
    
    const prefix = prefixes[category as keyof typeof prefixes] || 'Artículo';
    return `${prefix} - ${labelName}`;
  }
}
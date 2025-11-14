// Agregar este endpoint a tu servidor Express existente
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

// Endpoint para mejorar imágenes
app.post('/api/improve-image', async (req, res) => {
  const { imageUrl } = req.body;
  
  try {
    console.log('🎨 Mejorando imagen:', imageUrl);
    
    // 1. Descargar imagen de Supabase
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Error al descargar imagen');
    }
    const imageBuffer = await imageResponse.buffer();
    
    // 2. Enviar a Remove.bg
    const formData = new FormData();
    formData.append('image_file', imageBuffer, 'image.jpg');
    formData.append('size', 'auto');
    
    const rbgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY
      },
      body: formData
    });
    
    if (!rbgResponse.ok) {
      const error = await rbgResponse.text();
      throw new Error(`Remove.bg error: ${error}`);
    }
    
    const resultBuffer = await rbgResponse.buffer();
    
    // 3. Subir resultado a Supabase Storage
    const fileName = `improved_${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('productos')
      .upload(fileName, resultBuffer, {
        contentType: 'image/png'
      });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    // 4. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('productos')
      .getPublicUrl(fileName);
    
    console.log('✅ Imagen mejorada:', publicUrlData.publicUrl);
    
    res.json({ 
      success: true,
      improvedUrl: publicUrlData.publicUrl,
      originalUrl: imageUrl
    });
    
  } catch (error) {
    console.error('❌ Error mejorando imagen:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
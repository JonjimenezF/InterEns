export const awsConfig = {
  accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || 'TU_ACCESS_KEY_AQUI',
  secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || 'TU_SECRET_KEY_AQUI',
  region: 'us-east-1'
};

// INSTRUCCIONES:
// 1. Crea archivo .env en la raíz del proyecto
// 2. Agrega tus credenciales AWS reales
// 3. El archivo .env NO se sube a GitHub (está en .gitignore)
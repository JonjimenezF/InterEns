# Guía de Integración Transbank Webpay Plus

## ✅ Cambios Realizados

### 1. Frontend (Ionic/Angular)

#### Servicio TransbankService
- ✅ Creado `src/app/services/transbank.service.ts`
- ✅ Manejo de Browser API para abrir Webpay
- ✅ Configuración de URL scheme personalizado (`interens://`)
- ✅ Validaciones de parámetros
- ✅ Manejo robusto de errores

#### Página ComprarPuntos
- ✅ Integración con TransbankService
- ✅ Validaciones antes de crear transacción
- ✅ Manejo de retorno desde Webpay
- ✅ Mensajes de error específicos
- ✅ Loading states mejorados

#### Configuración Capacitor
- ✅ Instalado `@capacitor/browser@6.0.0`
- ✅ Configurado esquema URL personalizado en `capacitor.config.ts`
- ✅ Sincronizado con plataformas nativas

### 2. Backend (Node.js/Fastify)

#### Mejoras en transbankRoutes
- ✅ Validaciones de parámetros de entrada
- ✅ Manejo de URLs de retorno para móviles
- ✅ Estados de transacción más específicos
- ✅ Mejor manejo de errores
- ✅ Soporte para esquemas URL personalizados

## 🔧 Pasos para Completar la Integración

### 1. Reemplazar tu archivo backend actual

Reemplaza tu archivo `transbank.ts` con el contenido de `backend-transbank-fixed.ts`:

```bash
# Copia el contenido del archivo backend-transbank-fixed.ts
# a tu archivo transbank.ts actual
```

### 2. Configurar Variables de Entorno

Agrega a tu `.env`:

```env
NODE_ENV=development  # o 'production' para usar Transbank real
TRANSBANK_COMMERCE_CODE=tu_codigo_comercio
TRANSBANK_API_KEY=tu_api_key
```

### 3. Para Integración Real con Transbank

Instala el SDK oficial:

```bash
npm install transbank-sdk
```

Modifica el endpoint `/transbank/crear-transaccion` para usar el SDK real:

```typescript
import { WebpayPlus } from 'transbank-sdk';

// En modo producción
if (process.env.NODE_ENV === 'production') {
  const transaction = new WebpayPlus.Transaction();
  const response = await transaction.create(
    buyOrder,
    sessionId,
    monto,
    `interens://transbank-return?token=${token}`
  );
  
  return reply.send({
    success: true,
    token: response.token,
    url: response.url
  });
}
```

### 4. Configurar Deep Links en Android

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTask"
    android:theme="@style/AppTheme.NoActionBarLaunch">
    
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="interens" />
    </intent-filter>
</activity>
```

### 5. Probar la Integración

#### Modo Simulación (Desarrollo)
```bash
# 1. Ejecutar backend
npm run dev

# 2. Ejecutar frontend
ionic serve

# 3. Probar compra de puntos
# - La URL se abrirá en el navegador
# - Simulará el pago automáticamente
# - Retornará a la app con resultado
```

#### Modo Producción
```bash
# 1. Compilar para dispositivo
ionic build
npx cap sync
npx cap run android

# 2. Probar en dispositivo real
# - Se abrirá Webpay real en navegador externo
# - Completar pago en Transbank
# - La app recibirá el resultado via deep link
```

## 🚨 Problemas Comunes y Soluciones

### Error: "No se pudo abrir Webpay"
- ✅ Verificar que `@capacitor/browser` esté instalado
- ✅ Compilar y sincronizar: `npm run build && npx cap sync`

### Error: "Usuario no identificado"
- ✅ Verificar que `localStorage.getItem('userId')` retorne un valor válido

### Error: "Error creando transacción"
- ✅ Verificar que el backend esté ejecutándose en `localhost:4000`
- ✅ Revisar logs del backend para errores específicos

### Deep Link no funciona
- ✅ Verificar configuración en `capacitor.config.ts`
- ✅ Sincronizar: `npx cap sync`
- ✅ Verificar AndroidManifest.xml

### Transacción queda pendiente
- ✅ Verificar conectividad de red
- ✅ Consultar estado con endpoint `/transbank/estado/:token`

## 📱 Flujo Completo

1. **Usuario selecciona paquete** → Confirma compra
2. **Frontend valida datos** → Llama a `crearTransaccion()`
3. **Backend crea transacción** → Retorna token y URL
4. **Frontend abre Webpay** → Browser externo o simulación
5. **Usuario completa pago** → Transbank procesa
6. **Webpay redirige** → `interens://transbank-return?...`
7. **App recibe deep link** → Procesa resultado
8. **Frontend consulta estado** → Muestra resultado final

## 🔐 Seguridad

- ✅ Validaciones en frontend y backend
- ✅ Tokens únicos por transacción
- ✅ Estados de transacción controlados
- ✅ Timeouts para transacciones pendientes
- ✅ Logs de auditoría

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs del backend
2. Verificar configuración de Capacitor
3. Probar en dispositivo real (no emulador)
4. Consultar documentación oficial de Transbank
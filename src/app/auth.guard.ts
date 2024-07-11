// src/app/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = localStorage.getItem('access_token'); // Verificar si existe un token de acceso
  if (!isAuthenticated) {
    // Si no hay token, redirigir al usuario a la página de inicio de sesión
    window.location.href = '/home'; // Usamos window.location.href para la redirección en este ejemplo
    return false;
  }
  return true;
};

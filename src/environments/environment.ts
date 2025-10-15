// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabaseUrl: 'https://icnabdpciheuucjpesln.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFiZHBjaWhldXVjanBlc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njg5MjUsImV4cCI6MjA3MzQ0NDkyNX0.Lf8l8KclTXu3hzD0e3DxzoGQuuVfkUrZYyimvYUfUZ8',
  redirectUrlWeb: 'http://localhost:8100/auth/callback',
  redirectUrlMobile: 'interens://auth-callback'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
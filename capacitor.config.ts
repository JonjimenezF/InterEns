import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MyAplicacion',
  webDir: 'www',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    App: {
      customUrlScheme: 'interens'
    }
  }
};

export default config;

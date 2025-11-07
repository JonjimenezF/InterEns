import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MyAplicacion',
  webDir: 'www',
  plugins: {
    App: {
      customUrlScheme: 'interens'
    }
  }
};

export default config;

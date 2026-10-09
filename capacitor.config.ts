import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hamza.guessthecelebmaker',
  appName: 'GuessTheCelebMaker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

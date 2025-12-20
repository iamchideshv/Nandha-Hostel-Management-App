import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nanda.hostel',
  appName: 'Hostel Manager',
  webDir: 'public',
  server: {
    url: 'https://hostel-devops.vercel.app',
    cleartext: true
  }
};

export default config;

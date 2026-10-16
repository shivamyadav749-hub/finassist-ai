import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = 3000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const APP_URL = process.env.APP_URL || '';
export const IS_PROD = process.env.NODE_ENV === 'production';

// Load Firebase configuration
let fbConfig = {
  projectId: '',
  appId: '',
  apiKey: '',
  authDomain: '',
  firestoreDatabaseId: '(default)',
  storageBucket: '',
  messagingSenderId: '',
};

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[Backend Config] Could not parse firebase-applet-config.json:', e);
}

export const firebaseConfig = fbConfig;

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
export const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
export const STORAGE_STATE_PATH = path.join(SESSIONS_DIR, 'storageState.json');
export const COMPUTRABAJO_BASE_URL = process.env.COMPUTRABAJO_BASE_URL || 'https://co.computrabajo.com';
export const PORT = Number(process.env.PLAYWRIGHT_PORT) || 3000;
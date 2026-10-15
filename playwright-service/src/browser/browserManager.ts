import fs from 'node:fs';
import { Browser, BrowserContext } from "playwright";
import { chromium } from "playwright-extra";
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { STORAGE_STATE_PATH } from '../config.js';

chromium.use(stealthPlugin());

export class BrowserManager {
    private static browser: Browser | null = null;

    public static async getBrowser(): Promise<Browser> {
        if (!this.browser || !this.browser.isConnected()) {
            this.browser = await chromium.launch({
                headless: process.env.HEADLESS_MODE !== 'false',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-notifications'
                ]
            })
        }
        return this.browser;
    }

    public static async createAuthenticatedContext(): Promise<BrowserContext> {
        const browser = await this.getBrowser();
        const hasSession = fs.existsSync(STORAGE_STATE_PATH);

        const contextOptions: Parameters<Browser['newContext']>[0] = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/ 129.0.0.0 Safari / 537.36',
            viewport: { width: 1280, height: 800 },
            locale: 'es-CO',
            timezoneId: 'America/Bogota'
        };

        if (hasSession) {
            console.log(`🔑 Cargando sesión autenticada desde: ${STORAGE_STATE_PATH}`);
            contextOptions.storageState = STORAGE_STATE_PATH;
        } else {
            console.warn(`⚠️ No se encontró storageState.json. Navegando como usuario anónimo.`);
        }

        return await browser.newContext(contextOptions)
    }
}
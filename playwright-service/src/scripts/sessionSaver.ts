import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { COMPUTRABAJO_BASE_URL, STORAGE_STATE_PATH, SESSIONS_DIR } from '../config.js';

chromium.use(stealthPlugin());

async function saveSession() {
    console.log('🚀 Iniciando navegador interactivo para captura de sesión...');
    console.log('👉 Por favor, inicia sesión con tu cuenta en la ventana de Chrome que se abrirá.');

    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    })

    const context = await browser.newContext({
        viewport: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/ 129.0.0.0 Safari / 537.36'
    });

    const page = await context.newPage();

    page.goto(`${COMPUTRABAJO_BASE_URL}`, { waitUntil: 'domcontentloaded' });

    console.log('\n⏳ Esperando a que completes el inicio de sesión...');
    console.log('El script detectará automáticamente cuando ingreses a tu panel/perfil.\n');

    try {
        await page.waitForURL((url) => {
            const urlStr = url.toString();
            return urlStr.includes('/candidate/') || urlStr.includes('/personas/panel') || urlStr.includes('idCandidato')
        }, { timeout: 180000 })

        await page.waitForTimeout(3000)

        await context.storageState({ path: STORAGE_STATE_PATH })
        console.log('🎉 ¡SESIÓN CAPTURADA CON ÉXITO!');
        console.log(`💾 Archivo guardado en: ${STORAGE_STATE_PATH}`);

    } catch (error) {
        console.error('❌ Tiempo de espera agotado o error al capturar la sesión:', error);
    } finally {
        await browser.close();
        console.log('🔒 Navegador cerrado.');
    }
}

saveSession();
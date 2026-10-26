import express, { Request, Response } from 'express';
import fs from 'node:fs';
import { STORAGE_STATE_PATH } from './config.js';
import { jobsRouter } from './routes/jobs.routes.js';


const app = express();
const PORT = process.env.PLAYWRIGHT_PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'playwright-service',
        timestamp: new Date().toISOString()
    });
})

app.get('/auth/status', (req: Request, res: Response) => {
    const hasSession = fs.existsSync(STORAGE_STATE_PATH);
    res.json({
        authenticated: hasSession,
        sessionPath: STORAGE_STATE_PATH,
        message: hasSession
            ? 'Sesión detectada (storageState.json existe).'
            : 'No se detectó sesión. Ejecuta "npm run session:save" para iniciar sesión.'
    })
})

app.use('/jobs', jobsRouter);

app.listen(PORT, () => {
    console.log(`🚀 Playwright service running on port ${PORT} (ESM NodeNext)`);
});


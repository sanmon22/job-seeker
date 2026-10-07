import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PLAYWRIGHT_PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'playwright-service',
        runtime: 'NodeNext ESM',
        timestamp: new Date().toISOString()
    });
})

app.listen(PORT, () => {
    console.log(`🚀 Playwright service running on port ${PORT} (ESM NodeNext)`);
});


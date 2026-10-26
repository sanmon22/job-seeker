import { Request, Response, Router } from "express";
import { jobSearchQuery } from "../scrapers/computrabajoSearch.js";
import { getJobDetail } from "../scrapers/computrabajoDetail.js";
import { prepareApply, submitApply } from "../scrapers/computrabajoApply.js";

export const jobsRouter = Router();

jobsRouter.post('/search', async (req: Request, res: Response) => {
    try {
        const { query, maxPages, limit, platform = 'computrabajo' } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: '"query" es requerido'
            })
        }

        if (platform !== 'computrabajo') {
            return res.status(400).json({
                success: false,
                error: `La plataforma ${platform} aun no está soportada`
            })
        }

        const jobs = await jobSearchQuery(query, { maxPages, limit })
        return res.json({
            success: true,
            count: jobs.length,
            data: jobs
        })
    } catch (error) {
        console.error('[Route Error /jobs/search]:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al buscar vacantes'
        });
    }
})

jobsRouter.post('/detail', async (req: Request, res: Response) => {
    try {
        const { id, url, platform = 'computrabajo' } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro "url" es requerido.'
            });
        }

        if (platform !== 'computrabajo') {
            return res.status(400).json({
                success: false,
                error: `La plataforma "${platform}" aún no está soportada.`
            })
        }

        const jobDetail = await getJobDetail(url);

        if (id) {
            jobDetail.id = id;
        }

        return res.json({
            success: true,
            data: jobDetail
        })

    } catch (error) {
        console.error('[Route Error /jobs/detail]:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al obtener detalle'
        });
    }
})

jobsRouter.post('/prepare-apply', async (req: Request, res: Response) => {
    try {
        const { id, url, platform = 'computrabajo' } = req.body;
        if (!id || !url) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros "id" y "url" son requeridos.'
            })
        }

        if (platform !== 'computrabajo') {
            return res.status(400).json({
                success: false, error: `La plataforma
                "${platform}" aún no está soportada.`
            });
        }

        const result = await prepareApply(id, url);
        return res.json({ success: true, data: result });

    } catch (error) {
        console.error('[Route Error /jobs/prepare-apply]:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al preparar postulación'
        });
    }
})

jobsRouter.post('/submit-apply', async (req: Request, res: Response) => {
    try {
        const { id, url, answers, platform = 'computrabajo' } = req.body;

        if (!id || !url || !answers) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros "id", "url" y "answers" son obligatorios.'
            });
        }

        if (platform !== 'computrabajo') {
            return res.status(400).json({
                success: false, error: `La plataforma
                "${platform}" aún no está soportada.`
            });
        }

        const result = await submitApply(id, url, answers);
        return res.json({ success: true, data: result });

    } catch (error) {
        console.error('[Route Error /jobs/submit-apply]:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al enviar postulación'
        });
    }
})
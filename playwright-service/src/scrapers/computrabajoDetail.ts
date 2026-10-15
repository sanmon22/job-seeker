import { BrowserManager } from "../browser/browserManager.js";

export interface JobDetail {
    id: string,
    url: string,
    title: string,
    company: string,
    description: string,
    alreadyApplied: boolean
}

function extractJobIdFromURL(url: string): string {
    const match = url.match(/([A-F0-9]{32})/i);
    return match ? match[1] : ''
}

export async function getJobDetail(url: string): Promise<JobDetail> {
    const jobId = extractJobIdFromURL(url);

    const context = await BrowserManager.createAuthenticatedContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.keyboard.press('Escape');
        await page.waitForSelector('h1, .box_detail, #btnApply', { timeout: 10000 });

        const detail = await page.evaluate(() => {
            const titleEl = document.querySelector('h1.title_offer, h1.fs24, h1');
            const companyEl = document.querySelector('a[href*="/empresas/"], p.fs16, .fc_base');
            const applyBtnEl = document.querySelector('#btnApply, .btn_apply, [data-event*="apply"]');

            const title = titleEl?.textContent?.trim() || '';
            const company = companyEl?.textContent?.trim() || 'Confidencial';
            const btnText = applyBtnEl?.textContent?.toLowerCase() || '';

            const alreadyApplied = btnText.includes('ya te has postulado') ||
                btnText.includes('ya te postulaste') ||
                applyBtnEl?.classList.contains('disable') || false;

            const textBlock = Array.from(document.querySelectorAll('.box_detail p, .box_detail ul li, .box_border p, p.mbB'))
                .map((el) => el.textContent?.trim() || '')
                .filter(Boolean);

            const description = textBlock.join('\n');

            return {
                title,
                company,
                description,
                alreadyApplied
            };
        });

        return {
            id: jobId,
            url,
            title: detail.title,
            company: detail.company,
            description: detail.description,
            alreadyApplied: detail.alreadyApplied,
        }

    } catch (error) {
        console.error(`[Detail Error] Falló la extracción para ${url}`, error);
        throw error;
    } finally {
        await page.close();
        await context.close();
    }
}

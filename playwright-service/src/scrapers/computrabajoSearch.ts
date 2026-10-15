import { BrowserManager } from "../browser/browserManager.js";
import { COMPUTRABAJO_BASE_URL } from "../config.js";

export interface DiscoveredJob {
    id: string,
    title: string,
    company: string,
    location: string,
    salary: string,
    url: string
}

export interface SearchOptions {
    maxPages?: number,
    limit?: number
}

function normalizeSearchURL(query: string, pageNumber: number = 1): string {
    const slug = query.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const pageParam = pageNumber > 1 ? `?p=${pageNumber}` : '';
    return `${COMPUTRABAJO_BASE_URL}/trabajo-de-${slug}${pageParam}`;
}

export async function jobSearchQuery(query: string, options: SearchOptions = {}): Promise<DiscoveredJob[]> {
    const { maxPages = 1, limit = 20 } = options;
    const discoveredJobs: DiscoveredJob[] = [];

    console.log('búsqueda:', query);

    const context = await BrowserManager.createAuthenticatedContext();
    const page = await context.newPage();

    try {
        for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
            const searchUrl = normalizeSearchURL(query, currentPage);
            console.log(`Navegando a página ${currentPage}: ${searchUrl}`);

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.keyboard.press('Escape');

            try {
                await page.waitForSelector('article.box_offer, article[data-id], .no_results', {
                    timeout: 10000
                })
            } catch (error) {
                console.error(`No se detectó ninguna oferta en la pag ${currentPage}`, error);
                break;
            }

            const rawJobsList = await page.$$eval('article.box_offer', (articles, baseUrl) => {
                return articles.map((art) => {

                    const id = art.getAttribute('data-id') || art.getAttribute('id') || '';
                    const titleEl = art.querySelector('h2 a.js-o-link, a.js-o-link');
                    const companyEl = art.querySelector('p.fs16 a, p.fs16 a[href*="/empleo/"]');

                    const title = titleEl?.textContent?.trim() || '';
                    const path = titleEl?.getAttribute('href') || '';
                    const company = companyEl?.textContent?.trim() || 'Confidencial';
                    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;


                    const details = Array.from(art.querySelectorAll('p.fs14 span, p.fs14, span.mr10'))
                        .map((el) => el.textContent?.trim() || '')
                        .filter(Boolean);

                    const location = details.find((d) =>
                        !/^\d+([.,]\d+)?$/.test(d) &&
                        !d.includes('$') &&
                        !/hace|urgente|días|horas|postularme/i.test(d)
                    ) || 'Colombia';

                    const salary = details.find((d) => d.includes('$') || /salario|mes|mensual|compensacion/i.test(d)) || 'No especificado';

                    return { id, title, company, location, salary, url }
                })
            }, COMPUTRABAJO_BASE_URL);

            const jobsListOnPage = rawJobsList.filter((job) => Boolean(job.id && job.title && job.url))

            for (const job of jobsListOnPage) {
                if (!discoveredJobs.some((j) => j.id === job.id)) {
                    discoveredJobs.push(job);
                }
                if (discoveredJobs.length >= limit) {
                    break;
                }
            }

            if (discoveredJobs.length >= limit || jobsListOnPage.length === 0) {
                break;
            }
        }
    } catch (error) {
        console.error('Error durante la búsqueda en CompuTrabajo', error);
        throw error;
    } finally {
        await page.close();
        await context.close();
    }

    return discoveredJobs;
}
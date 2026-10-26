import { BrowserManager } from '../browser/browserManager.js';

export interface ScreeningQuestion {
    id: string,
    question: string,
    maxLength: number
}

export interface ApplyResult {
    jobId: string,
    url: string,
    status: 'APPLIED' | 'NEEDS_ANSWERS' | 'ALREADY_APPLIED' | 'FAILED',
    message: string,
    questions?: ScreeningQuestion[]
}

export async function prepareApply(jobId: string, url: string): Promise<ApplyResult> {
    const context = await BrowserManager.createAuthenticatedContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.keyboard.press('Escape');

        const isAlreadyApplied = await page
            .locator(`[offer-detail-applied]:visible`)
            .first()
            .isVisible();

        if (isAlreadyApplied) {
            console.log('Ya aplicaste');
            return {
                jobId,
                url,
                status: 'ALREADY_APPLIED',
                message: 'Postulado previamente'
            };
        }

        const applyBtn = page
            .locator(`span[data-href-offer-apply*="${jobId}"]:visible`)
            .first();

        await applyBtn.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await applyBtn.click();

        await page.waitForSelector(
            'form[form-apply-kq], [offer-detail-applied]:not(.hide):visible',
            { timeout: 10000 }
        );

        const hasQuestionForm = await page.locator('form[form-apply-kq]').isVisible();
        if (hasQuestionForm) {
            const questions = await page.evaluate(() => {
                const questionBlocks = Array.from(document.querySelectorAll('div[div-kq]'));
                return questionBlocks.map((block) => {
                    const labelEl = block.querySelector('label');
                    const inputEl = block.querySelector('textarea, input[type="text"]')

                    return {
                        id: inputEl?.getAttribute('name') || '',
                        question: labelEl?.textContent?.trim() || '',
                        maxLength: Number(inputEl?.getAttribute('maxlength')) || 500
                    }
                }).filter(q => Boolean(q.id && q.question));
            });

            return {
                jobId,
                url,
                status: 'NEEDS_ANSWERS',
                message: `La vacante contiene ${questions.length} preguntas que requieren respuesta.`,
                questions
            }
        }

        return {
            jobId,
            url,
            status: 'APPLIED',
            message: 'Postulación directa enviada exitosamente sin preguntas adicionales.'
        };

    } catch (error) {
        console.error(`[Apply Error] Falló prepareApply para ${url}`, error);
        return {
            jobId,
            url,
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Error desconocido al preparar postulación'
        }
    } finally {
        await page.close();
        await context.close();
    }
}

export async function submitApply(jobId: string, url: string, answers: Record<string, string>): Promise<ApplyResult> {
    const context = await BrowserManager.createAuthenticatedContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.keyboard.press('Escape');

        const applyBtn = page
            .locator(`span[data-href-offer-apply*="${jobId}"]:visible`)
            .first();

        await applyBtn.waitFor({ state: 'visible', timeout: 15000 })
        await applyBtn.click();

        await page.waitForSelector('form[form-apply-kq]', { timeout: 15000 });

        for (const [inputName, answerText] of Object.entries(answers)) {
            const shortAnswer = answerText.slice(0, 500);
            const inputLocator = page.locator(`textarea[name="${inputName}"], input[name="${inputName}"]`);

            if (await inputLocator.count() > 0) {
                await inputLocator.fill(shortAnswer);
                console.log(`pregunta completada ${inputName}`);
            }
        }

        const submitBtn = page.locator('a[data-apply-ac-kq], a:has-text("Enviar mi HdV")').first();
        await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
        await submitBtn.click();

        await page.waitForSelector('.box_detail div[offer-detail-applied], .box_detail #btnApply:has-text("Postulado"), .box_detail :text("Ya aplicaste")', { timeout: 15000 });
        console.log('poestulacion confirmada');

        return {
            jobId,
            url,
            status: 'APPLIED',
            message: 'Candidatura y respuestas enviadas exitosamente.'
        }


    } catch (error) {
        console.error(`[Apply Error] Falló submitApply para ${url}`, error);
        return {
            jobId,
            url,
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Error al enviar respuestas de postulación'
        }
    } finally {
        await page.close();
        await context.close();
    }
}

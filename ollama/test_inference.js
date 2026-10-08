import { prompt_answer_questions } from './prompts/answer_question.js';
import { prompt_evaluate } from './prompts/evaluate.js';

console.log('🧠 Probando inferencia local con Ollama...');

async function runTest() {
    try {

        // =========================================================================
        // TEST 1: Coincidencia de trabajo
        // =========================================================================

        const mockJob = {
            title: 'Senior QA Automation Engineer (Playwright / TypeScript)',
            company: 'Tech Solutions Latam',
            location: 'Bogotá (Remoto)',
            salary: '$4.500.000 - $6.000.000 COP',
            description: `
            Buscamos un Ingeniero de QA Automation con más de 3 años de experiencia en automatización de pruebas E2E.
            Requisitos obligatorios:
            - Experiencia sólida diseñando suites con Playwright y TypeScript.
            - Pruebas y validación de APIs REST con Postman.
            - Experiencia gestionando defectos en JIRA y metodologías ágiles (Scrum).
            - Inglés intermedio/conversacional (B2).
            Deseable:
            - Conocimientos en n8n o integración continua.
          `
        };

        const prompt_filled = prompt_evaluate(mockJob);

        console.log('📡 Enviando petición a Ollama (http://localhost:11434/api/generate)...');

        const startTime = Date.now();
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'santi-agent',
                prompt: prompt_filled,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama respondió con código HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️ Inferencia completada en ${duration}s`);

        const evaluation = JSON.parse(data.response);

        console.log('\n🎯 RESULTADO DEL ANÁLISIS DE AFINIDAD:');
        console.log('-------------------------------------------');
        console.log(`📊 Score: ${evaluation.score}/100`);
        console.log(`✅ ¿Debe postularse?: ${evaluation.should_apply ? 'SÍ (>= 70%)' : 'NO (< 70%)'}`);
        console.log(`💡 Justificación: ${evaluation.summary_reason}`);
        console.log('👍 Pros:', evaluation.pros);
        console.log('⚠️ Contras:', evaluation.cons);
        console.log('-------------------------------------------');

        if (typeof evaluation.score === 'number' && evaluation.score >= 70) {
            console.log('🎉 ¡Test de inferencia de Ollama superado con éxito!');
        } else {
            console.log('⚠️ La inferencia respondió pero el score no superó el umbral esperado.');
        }

        // =========================================================================
        // TEST 2: Resolución de Preguntas del Empleador
        // =========================================================================

        console.log('\n🧪 TEST 2: Generación de Respuestas a Preguntas');
        console.log('------------------------------------------------------------');

        const sampleQuestions = [
            '¿Cuántos años de experiencia tienes realizando pruebas manuales?',
            '¿Cuál es tu aspiracion salarial exacta?',
            '¿Cuál es tu nivel de inglés y en qué contextos lo has utilizado?'
        ];

        const questions_filled = prompt_answer_questions(sampleQuestions);

        const startQuestions = Date.now();
        const questionsRes = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'santi-agent',
                prompt: questions_filled,
                stream: false,
                format: 'json'
            })
        });

        if (!questionsRes.ok) throw new Error(`Ollama error en Test 2: ${questionsRes.statusText}`);

        const questionsData = await questionsRes.json();
        const parsedData = JSON.parse(questionsData.response);
        const answersList = parsedData.answers || [parsedData];
        const questionsTime = ((Date.now() - startQuestions) / 1000).toFixed(2);

        console.log(`⏱️  Completado en: ${questionsTime}s`);
        console.log('📝 Respuestas generadas por santi-agent:');
        answersList.forEach((qa, idx) => {
            console.log(`\n  ${idx + 1}. Pregunta: "${qa.question}"`);
            console.log(`     👉 Respuesta: "${qa.answer}"`);
        });

    } catch (error) {
        console.error('❌ Error al probar Ollama:', error);
        process.exit(1);
    }
}

runTest();
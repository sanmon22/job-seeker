export const prompt_answer_questions = (questionsList) => `
    Por favor responde las siguientes preguntas de postulación basándote 
    en tu contexto acerca del perfil de Santiago Monrroy Lopez:

    PREGUNTAS DEL EMPLEADOR:
    ${JSON.stringify(questionsList, null, 2)}

    Responde ÚNICAMENTE con este JSON:
    {
        "answers": [
            {
                "question": "Texto exacto de la pregunta",
                "answer": "Respuesta en primera persona"
            }
        ]
    }
`;
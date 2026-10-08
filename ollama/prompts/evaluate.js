export const prompt_evaluate = ((mockJob) => (`
    Evalúa la afinidad entre tu perfil profesional y la siguiente oferta de empleo.
    Calcula un score (0 a 100) y marca "should_apply": true si score >= 70.

    OFERTA DE EMPLEO:
    Título: ${mockJob.title}
    Empresa: ${mockJob.company}
    Ubicación: ${mockJob.location}
    Salario: ${mockJob.salary}
    Descripción:
    ${mockJob.description}

    Responde ÚNICAMENTE con este JSON:
    {
      "score": 85,
      "should_apply": true,
      "summary_reason": "Justificación concisa",
      "pros": ["Punto a favor 1", "Punto a favor 2"],
      "cons": ["Requisito faltante"]
    }
`)
)
import { describe, it, expect } from "vitest";
import { validateResume } from "../stage0_validate.js";

const VALID_RESUME = `
John Doe
john.doe@email.com
+1 (555) 123-4567

Summary
Experienced software engineer with 5 years of experience in web development.

Work Experience
Senior Software Engineer at TechCorp (2020 - Present)
- Led team of 5 developers
- Improved performance by 40%

Education
Bachelor of Science in Computer Science - University of Technology (2018)

Skills
JavaScript, TypeScript, React, Node.js, Python
`;

describe("validateResume", () => {
  it("accepts a valid resume", () => {
    const result = validateResume(VALID_RESUME, 1);
    expect(result.outcome).toBe("VALID");
  });

  it("rejects blank/empty text", () => {
    const result = validateResume("", 1);
    expect(result.outcome).toBe("NOT_A_RESUME");
  });

  it("rejects whitespace-only text", () => {
    const result = validateResume("   \n\n   ", 1);
    expect(result.outcome).toBe("NOT_A_RESUME");
  });

  it("rejects insufficient content (< 100 chars)", () => {
    const result = validateResume("John email@test.com experience", 1);
    expect(result.outcome).toBe("INSUFFICIENT_CONTENT");
  });

  it("rejects non-resume (recipe) — no contact info", () => {
    const recipe = `
Best Chocolate Cake Recipe
Ingredients: flour, sugar, cocoa, eggs, butter, milk
Instructions: Mix dry ingredients. Add wet ingredients. Bake at 350 degrees for 30 minutes.
The result is a delicious and moist cake that everyone will love.
`;
    const result = validateResume(recipe, 1);
    expect(result.outcome).toBe("NOT_A_RESUME");
  });

  it("rejects non-resume — no section keywords", () => {
    const text = `
John Doe
john@example.com
This is some random text that has enough characters to pass the length check
but does not contain any resume section keywords whatsoever.
`;
    const result = validateResume(text, 1);
    expect(result.outcome).toBe("NOT_A_RESUME");
  });

  it("rejects resumes longer than 4 pages", () => {
    const result = validateResume(VALID_RESUME, 5);
    expect(result.outcome).toBe("TOO_LONG");
  });

  it("rejects non-English text", () => {
    // Uses English section keywords ("profile", "certifications", "awards",
    // "volunteer", "languages") which are in SECTION_KEYWORDS but NOT in
    // ENGLISH_STOP_WORDS, so the section-keyword check passes while the
    // English heuristic still fails.
    const nonEnglish = `
João Silva
joao@silva.com
+55 11 99999-9999

Perfil — profile
Desenvolvedor de Software pleno focado em aplicações web modernas e escaláveis.

Experiência Profissional
Desenvolvedor na Empresa XYZ (2020 - Presente)
- Liderou equipe de cinco desenvolvedores
- Melhorou desempenho em quarenta por cento
- Responsável por arquitetura e implementação completa

Formação Acadêmica
Bacharelado em Ciência da Computação — Universidade Federal (2018)

Certificações
AWS Certified Solutions Architect — Obtido em dois mil vinte

Prêmios — awards
Primeiro lugar no hackathon nacional de inovação tecnológica

Voluntariado — volunteer
Mentor de jovens programadores na comunidade local

Idiomas — languages
Português nativo, Espanhol avançado, Francês intermediário
`;
    const result = validateResume(nonEnglish, 1);
    expect(result.outcome).toBe("NOT_ENGLISH");
  });

  it("accepts 4-page resume", () => {
    const result = validateResume(VALID_RESUME, 4);
    expect(result.outcome).toBe("VALID");
  });
});

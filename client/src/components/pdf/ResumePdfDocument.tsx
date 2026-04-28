import { pdf } from "@react-pdf/renderer";
import type { TemplateId, PdfResumeData } from "./templates/templateTypes";
import { ProfessionalTemplate } from "./templates/professionalTemplate";
import { ModernTemplate } from "./templates/modernTemplate";

function getTemplateComponent(templateId: TemplateId) {
  switch (templateId) {
    case "modern":
      return ModernTemplate;
    case "professional":
    default:
      return ProfessionalTemplate;
  }
}

export async function generatePdf(
  data: PdfResumeData,
  templateId: TemplateId,
): Promise<Blob> {
  const TemplateComponent = getTemplateComponent(templateId);
  const doc = <TemplateComponent data={data} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after a short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

import { useEffect, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  LockClosedIcon,
  PencilSquareIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  EyeIcon,
  SwatchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../store/useStore";
import { useResumeEditorStore } from "../../store/useResumeEditorStore";
import { editorToPdfData } from "../../utils/editorTransforms";
import { renderPdfPages } from "../../utils/pdfUtils";
import { generatePdf } from "../pdf/ResumePdfDocument";
import { ProfessionalTemplatePreview } from "../pdf/templates/professionalTemplatePreview";
import { ModernTemplatePreview } from "../pdf/templates/modernTemplatePreview";
import Card from "../ui/Card";
import { Button, Tabs, Badge, Spinner } from "../ui";
import ResumeEditor from "./ResumeEditor";

const priorityBadgeVariant = (
  priority: "High" | "Medium" | "Low",
): "danger" | "warning" | "neutral" => {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    case "Low":
      return "neutral";
  }
};

const ResumeEditorPanel = () => {
  const { isLoggedIn } = useAuth();
  const tailorResult = useStore((s) => s.tailorResult);
  const analysisResults = useStore((s) => s.analysisResults);
  const resumeData = useStore((s) => s.resumeData);

  const sections = useResumeEditorStore((s) => s.sections);
  const activeSectionId = useResumeEditorStore((s) => s.activeSectionId);
  const editorMode = useResumeEditorStore((s) => s.editorMode);
  const selectedTemplate = useResumeEditorStore((s) => s.selectedTemplate);
  const isExporting = useResumeEditorStore((s) => s.isExporting);

  const initializeFromTailorResult = useResumeEditorStore(
    (s) => s.initializeFromTailorResult,
  );
  const updateSectionContent = useResumeEditorStore(
    (s) => s.updateSectionContent,
  );
  const setActiveSection = useResumeEditorStore((s) => s.setActiveSection);
  const revertSection = useResumeEditorStore((s) => s.revertSection);
  const setEditorMode = useResumeEditorStore((s) => s.setEditorMode);
  const setSelectedTemplate = useResumeEditorStore(
    (s) => s.setSelectedTemplate,
  );
  const setIsExporting = useResumeEditorStore((s) => s.setIsExporting);

  // Original PDF page images for visual reference
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  // Toggle between PDF reference and before-text for AI sections
  const [showBeforeText, setShowBeforeText] = useState(false);
  // Live preview collapse state
  const [previewExpanded, setPreviewExpanded] = useState(false);

  useEffect(() => {
    if (
      sections.length === 0 &&
      tailorResult &&
      analysisResults?.parsedData
    ) {
      initializeFromTailorResult(tailorResult, analysisResults.parsedData);
    }
  }, [sections.length, tailorResult, analysisResults?.parsedData, initializeFromTailorResult]);

  // Render original PDF pages when resume file is available
  useEffect(() => {
    if (!resumeData?.file) {
      setPdfPageImages([]);
      return;
    }

    let cancelled = false;
    renderPdfPages(resumeData.file)
      .then((urls) => {
        if (!cancelled) setPdfPageImages(urls);
      })
      .catch(() => {
        if (!cancelled) setPdfPageImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeData?.file]);

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  // Find the original "before" text for AI-modified sections
  const activeTailorSection = useMemo(() => {
    if (!activeSection || !tailorResult) return null;
    if (!activeSection.isAiModified) return null;
    const tailorIdx = tailorResult.sections.findIndex(
      (s) => s.name === activeSection.name,
    );
    return tailorIdx >= 0 ? tailorResult.sections[tailorIdx] : null;
  }, [activeSection, tailorResult]);

  const pdfData = useMemo(() => {
    if (!analysisResults?.parsedData) return null;
    return editorToPdfData(sections, analysisResults.parsedData);
  }, [sections, analysisResults?.parsedData]);

  const handleDownload = useCallback(async () => {
    if (!pdfData || isExporting) return;

    setIsExporting(true);
    try {
      console.log("Generating PDF with data:", JSON.stringify(pdfData, null, 2));
      const blob = await generatePdf(pdfData, selectedTemplate);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "resume.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [pdfData, selectedTemplate, isExporting, setIsExporting]);

  // Render the live HTML preview
  const renderLivePreview = () => {
    if (!pdfData) return null;
    const PreviewComponent =
      selectedTemplate === "professional"
        ? ProfessionalTemplatePreview
        : ModernTemplatePreview;
    return <PreviewComponent data={pdfData} />;
  };

  if (isLoggedIn === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card padding="xl" className="text-center">
          <LockClosedIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            Sign in Required
          </h3>
          <p className="text-stone-500 mb-4">
            Please sign in to edit and download your tailored resume.
          </p>
          <Link to="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </Card>
      </motion.div>
    );
  }

  if (!tailorResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card padding="xl" className="text-center">
          <PencilSquareIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            No Tailored Resume
          </h3>
          <p className="text-stone-500 mb-4">
            Tailor your resume first to unlock the editor.
          </p>
          <Button
            variant="primary"
            onClick={() =>
              useStore.getState().setActiveEditorTab("job-analysis")
            }
          >
            Go to Job Analysis
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card shadow padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">
              Resume Editor
            </h2>
            <Tabs
              variant="segmented"
              tabs={[
                {
                  id: "edit",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit Mode
                    </span>
                  ),
                },
                {
                  id: "template",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <SwatchIcon className="h-4 w-4" />
                      Template Mode
                    </span>
                  ),
                },
              ]}
              activeTab={editorMode}
              onTabChange={(id) =>
                setEditorMode(id as "edit" | "template")
              }
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Edit Mode */}
        {editorMode === "edit" && (
          <div className="flex flex-col lg:flex-row">
            {/* Section Sidebar */}
            <div className="lg:w-56 xl:w-64 border-b lg:border-b-0 lg:border-r border-stone-200 bg-stone-50">
              {/* Mobile dropdown */}
              <div className="lg:hidden p-3">
                <select
                  value={activeSectionId ?? ""}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} ({section.priority})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop sidebar list */}
              <div className="hidden lg:block max-h-[calc(100vh-280px)] overflow-y-auto p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                      section.id === activeSectionId
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span className="truncate">{section.name}</span>
                    <div className="flex items-center gap-1">
                      {section.isAiModified && (
                        <span className="px-1 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded">
                          AI
                        </span>
                      )}
                      <Badge variant={priorityBadgeVariant(section.priority)}>
                        {section.priority}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main editing area */}
            <div className="flex-1 flex flex-col">
              {activeSection ? (
                <>
                  <div className="flex-1 flex flex-col lg:flex-row">
                    {/* Original PDF reference — always visible */}
                    <div className="flex-1 border-b lg:border-b-0 lg:border-r border-stone-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                          Original Resume
                        </span>
                        <div className="flex items-center gap-2">
                          {activeSection.isAiModified && activeTailorSection && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowBeforeText(!showBeforeText)}
                              className="text-xs text-stone-400 hover:text-amber-600"
                            >
                              {showBeforeText ? "Show PDF" : "Show Before"}
                            </Button>
                          )}
                          {activeSection.isDirty && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revertSection(activeSection.id)}
                              className="text-xs text-stone-400 hover:text-amber-600"
                            >
                              <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                              Revert
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="bg-stone-50 rounded-lg p-2 max-h-[calc(100vh-420px)] overflow-y-auto">
                        {showBeforeText && activeSection.isAiModified && activeTailorSection ? (
                          <pre className="text-sm text-stone-600 whitespace-pre-wrap font-mono leading-relaxed">
                            {activeTailorSection.before}
                          </pre>
                        ) : pdfPageImages.length > 0 ? (
                          <div className="space-y-2">
                            {pdfPageImages.map((src, i) => (
                              <img
                                key={i}
                                src={src}
                                alt={`Page ${i + 1}`}
                                className="w-full rounded border border-stone-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-stone-400 italic">
                            Original PDF preview
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Editor panel */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                          Edited
                        </span>
                        {activeSection.isDirty && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 text-amber-600 rounded">
                            Modified
                          </span>
                        )}
                      </div>
                      <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
                        <ResumeEditor
                          initialContent={activeSection.htmlContent}
                          onUpdate={(html) =>
                            updateSectionContent(activeSection.id, html)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible live preview */}
                  <div className="border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded(!previewExpanded)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4 text-stone-400" />
                        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                          Live Preview
                        </span>
                      </div>
                      {previewExpanded ? (
                        <ChevronUpIcon className="h-4 w-4 text-stone-400" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                    {previewExpanded && pdfData && (
                      <div className="p-4 max-h-[400px] overflow-y-auto bg-white">
                        {renderLivePreview()}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-stone-400 text-sm">
                  Select a section to start editing
                </div>
              )}

              {/* Download button */}
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  disabled={isExporting || sections.length === 0}
                >
                  {isExporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" className="text-white" />
                      Generating PDF...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Download PDF
                    </span>
                  )}
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-stone-400">
                    {selectedTemplate === "professional" ? "Professional" : "Modern"} template
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedTemplate(
                        selectedTemplate === "professional"
                          ? "modern"
                          : "professional",
                      )
                    }
                    className="text-xs text-stone-400 hover:text-amber-600"
                  >
                    <SwatchIcon className="h-3.5 w-3.5 mr-1" />
                    Switch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Mode */}
        {editorMode === "template" && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Template selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    id: "professional" as const,
                    name: "Professional",
                    description: "Clean, traditional layout with amber accents",
                  },
                  {
                    id: "modern" as const,
                    name: "Modern",
                    description: "Two-column layout with dark sidebar",
                  },
                ] as const
              ).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === template.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-900">
                      {template.name}
                    </span>
                    {selectedTemplate === template.id && (
                      <EyeIcon className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>

            {/* HTML preview */}
            {pdfData && (
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white hidden sm:block">
                <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                  <EyeIcon className="h-4 w-4 text-stone-400" />
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Preview
                  </span>
                </div>
                <div className="p-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {renderLivePreview()}
                </div>
              </div>
            )}

            {/* Download button */}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={isExporting || sections.length === 0}
                className="w-full sm:w-auto"
              >
                {isExporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" className="text-white" />
                    Generating PDF...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Download PDF
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ResumeEditorPanel;

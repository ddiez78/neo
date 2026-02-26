import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, FileUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ScriptEditor() {
  const [, params] = useRoute("/projects/:projectId/script");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : 0;

  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Queries
  const { data: project } = trpc.projects.get.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: scripts } = trpc.scripts.listByProject.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  // Mutations
  const uploadMutation = trpc.scripts.upload.useMutation({
    onSuccess: (result) => {
      toast.success("Guion subido exitosamente");
      setScriptTitle("");
      setScriptContent("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const analyzeMutation = trpc.scripts.analyze.useMutation({
    onSuccess: (result) => {
      toast.success("Análisis completado exitosamente");
      setAnalysisResult(result.analysisResult);
      setShowAnalysisResult(true);
      // Redirigir a Story Bible después de 2 segundos
      setTimeout(() => {
        setLocation(`/projects/${projectId}/story-bible`);
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUploadScript = async () => {
    if (!scriptTitle.trim() || !scriptContent.trim()) {
      toast.error("El título y contenido del guion son requeridos");
      return;
    }

    if (scriptContent.length < 50) {
      toast.error("El guion debe tener al menos 50 caracteres");
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({
        projectId,
        title: scriptTitle,
        content: scriptContent,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeScript = async (scriptId: number) => {
    setIsAnalyzing(true);
    try {
      await analyzeMutation.mutateAsync({ scriptId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Proyecto no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/projects")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {project?.title || "Proyecto"}
            </h1>
            <p className="text-sm text-slate-600">Editor de Guion</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              Subir Nuevo Guion
            </CardTitle>
            <CardDescription>
              Crea un nuevo guion maestro para tu proyecto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Título del Guion
              </label>
              <Input
                placeholder="Ej: La Aventura de Luna - Episodio 1"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Contenido del Guion
              </label>
              <Textarea
                placeholder="Escribe o pega tu guion aquí. Incluye personajes, locaciones, acciones y diálogos..."
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                className="mt-1 font-mono text-sm"
                rows={10}
              />
              <p className="text-xs text-slate-500 mt-2">
                Caracteres: {scriptContent.length} / 50000
              </p>
            </div>
            <Button
              onClick={handleUploadScript}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Subir Guion
            </Button>
          </CardContent>
        </Card>

        {/* Scripts List */}
        {scripts && scripts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Guiones Disponibles
              </CardTitle>
              <CardDescription>
                Analiza un guion para generar Story Bible y Scene Breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scripts.map((script: any) => (
                  <div
                    key={script.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {script.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {script.content.length} caracteres
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(script.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        script.status === "analyzed"
                          ? "bg-green-100 text-green-700"
                          : script.status === "analyzing"
                          ? "bg-blue-100 text-blue-700"
                          : script.status === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {script.status === "analyzed"
                          ? "Analizado"
                          : script.status === "analyzing"
                          ? "Analizando..."
                          : script.status === "error"
                          ? "Error"
                          : "Pendiente"}
                      </span>
                      {script.status === "pending" && (
                        <Button
                          onClick={() => handleAnalyzeScript(script.id)}
                          disabled={isAnalyzing}
                          size="sm"
                          className="gap-2"
                        >
                          {isAnalyzing && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          Analizar
                        </Button>
                      )}
                      {script.status === "analyzed" && (
                        <Button
                          onClick={() =>
                            setLocation(`/projects/${projectId}/story-bible`)
                          }
                          size="sm"
                          variant="outline"
                        >
                          Ver Story Bible
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analysis Result Dialog */}
      <Dialog open={showAnalysisResult} onOpenChange={setShowAnalysisResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Análisis Completado!</DialogTitle>
            <DialogDescription>
              Tu guion ha sido analizado exitosamente
            </DialogDescription>
          </DialogHeader>
          {analysisResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-slate-600">Personajes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisResult.characterCount}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-slate-600">Locaciones</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analysisResult.locationCount}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-slate-600">Props</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisResult.propCount}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-slate-600">Escenas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analysisResult.sceneCount}
                  </p>
                </div>
              </div>
              {analysisResult.validationWarnings &&
                analysisResult.validationWarnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-medium text-yellow-800 mb-2">
                      Advertencias:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {analysisResult.validationWarnings.map(
                        (warning: string, i: number) => (
                          <li key={i}>• {warning}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              <p className="text-sm text-slate-600">
                Redirigiendo a Story Bible...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

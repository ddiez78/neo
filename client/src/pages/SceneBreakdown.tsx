import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Loader2, ArrowLeft, Download, Image as ImageIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function SceneBreakdown() {
  const [, params] = useRoute("/projects/:projectId/scenes");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : 0;

  const [selectedScene, setSelectedScene] = useState<any>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  // Queries
  const { data: project } = trpc.projects.get.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: breakdown, isLoading } = trpc.storyBible.getSceneBreakdown.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  // Mutations
  const generateImageMutation = trpc.scenes.generateImage.useMutation({
    onSuccess: (result) => {
      toast.success("Imagen generada exitosamente");
      setSelectedScene({
        ...selectedScene,
        imageUrl: result.imageUrl,
        status: "completed",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const exportMutation = trpc.storyBible.generateExport.useMutation({
    onSuccess: (result) => {
      toast.success("Exportación generada exitosamente");
      // Descargar archivo
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerateImage = async (sceneId: number) => {
    setIsGeneratingImage(true);
    try {
      await generateImageMutation.mutateAsync({ sceneId });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyPrompt = (prompt: string, sceneNumber: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(sceneNumber);
    toast.success("Prompt copiado al portapapeles");
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleExport = (format: "text" | "json" | "markdown") => {
    exportMutation.mutate({ projectId, format });
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
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/projects/${projectId}`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {project?.title || "Proyecto"}
              </h1>
              <p className="text-sm text-slate-600">Scene Breakdown</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("text")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Texto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("markdown")}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Markdown
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : breakdown && breakdown.scenes.length > 0 ? (
          <div className="space-y-4">
            {/* Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Total de Escenas
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {breakdown.totalScenes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Duración Total
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {breakdown.totalDuration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Segundos por Escena
                    </p>
                    <p className="text-2xl font-bold text-blue-600">10s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenes List */}
            <div className="space-y-4">
              {breakdown.scenes.map((scene: any) => (
                <Card
                  key={scene.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedScene(scene)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Scene {String(scene.sceneNumber).padStart(2, "0")}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <span className="inline-block mr-4">
                            <strong>TIME:</strong> {scene.timeStart}–{scene.timeEnd}
                          </span>
                          <span className="inline-block">
                            <strong>PLACE:</strong> {scene.place}
                          </span>
                        </CardDescription>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scene.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : scene.status === "generating"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {scene.status === "completed"
                          ? "Completado"
                          : scene.status === "generating"
                          ? "Generando..."
                          : "Pendiente"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        BEAT
                      </p>
                      <p className="text-sm text-slate-900">{scene.beat}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        GROK_VIDEO_PROMPT
                      </p>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-slate-900 flex-1">
                          {scene.grokVideoPrompt}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(
                              scene.grokVideoPrompt,
                              scene.sceneNumber
                            );
                          }}
                        >
                          {copiedPromptId === scene.sceneNumber ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        NEGATIVE
                      </p>
                      <p className="text-sm text-slate-900">{scene.negative}</p>
                    </div>
                    {scene.imageUrl && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">
                          Imagen Generada
                        </p>
                        <img
                          src={scene.imageUrl}
                          alt={`Scene ${scene.sceneNumber}`}
                          className="w-full h-40 object-cover rounded"
                        />
                      </div>
                    )}
                    {!scene.imageUrl && scene.status === "pending" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImage(scene.id);
                        }}
                        disabled={isGeneratingImage}
                        size="sm"
                        className="gap-2"
                      >
                        {isGeneratingImage && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <ImageIcon className="w-4 h-4" />
                        Generar Imagen
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-600">
                No hay escenas disponibles. Carga y analiza un guion primero.
              </p>
              <Button
                onClick={() => setLocation(`/projects/${projectId}/script`)}
                className="mt-4"
              >
                Ir al Editor de Guion
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scene Detail Modal */}
      {selectedScene && (
        <Dialog
          open={!!selectedScene}
          onOpenChange={() => setSelectedScene(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Scene {String(selectedScene.sceneNumber).padStart(2, "0")}
              </DialogTitle>
              <DialogDescription>
                {selectedScene.timeStart}–{selectedScene.timeEnd}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">PLACE</p>
                <p className="text-sm text-slate-900 mt-1">
                  {selectedScene.place}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">BEAT</p>
                <p className="text-sm text-slate-900 mt-1">
                  {selectedScene.beat}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  GROK_VIDEO_PROMPT
                </p>
                <p className="text-sm text-slate-900 mt-1">
                  {selectedScene.grokVideoPrompt}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">NEGATIVE</p>
                <p className="text-sm text-slate-900 mt-1">
                  {selectedScene.negative}
                </p>
              </div>
              {selectedScene.imageUrl && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Imagen Generada
                  </p>
                  <img
                    src={selectedScene.imageUrl}
                    alt={`Scene ${selectedScene.sceneNumber}`}
                    className="w-full rounded"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { Loader2, ArrowLeft, FileText, BookOpen, Film, Users } from "lucide-react";

export default function ProjectDashboard() {
  const [, params] = useRoute("/projects/:projectId");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : 0;

  // Queries
  const { data: project, isLoading } = trpc.projects.get.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: scripts } = trpc.scripts.listByProject.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: storyBible } = trpc.storyBible.getStoryBible.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: breakdown } = trpc.storyBible.getSceneBreakdown.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isLoading ? "Cargando..." : project?.title || "Proyecto"}
            </h1>
            <p className="text-sm text-slate-600">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Project Info */}
            {project && (
              <Card>
                <CardHeader>
                  <CardTitle>Información del Proyecto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Título</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {project.title}
                    </p>
                  </div>
                  {project.description && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Descripción
                      </p>
                      <p className="text-slate-700">{project.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Estado
                      </p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "analyzing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {project.status === "completed"
                          ? "Completado"
                          : project.status === "analyzing"
                          ? "Analizando"
                          : "Borrador"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Creado
                      </p>
                      <p className="text-slate-700 mt-1">
                        {new Date(project.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Guiones
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {scripts?.length || 0}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Personajes
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {storyBible?.characters.length || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Escenas
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {breakdown?.totalScenes || 0}
                      </p>
                    </div>
                    <Film className="w-8 h-8 text-orange-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Duración
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {breakdown?.totalDuration || "0:00"}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Editor de Guion
                  </CardTitle>
                  <CardDescription>
                    Sube o escribe tu guion maestro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setLocation(`/projects/${projectId}/script`)}
                    className="w-full"
                  >
                    Ir al Editor
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Story Bible
                  </CardTitle>
                  <CardDescription>
                    Visualiza personajes, locaciones y props
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() =>
                      setLocation(`/projects/${projectId}/story-bible`)
                    }
                    className="w-full"
                    disabled={!storyBible}
                  >
                    Ver Story Bible
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Scene Breakdown
                  </CardTitle>
                  <CardDescription>
                    Visualiza todas las escenas generadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setLocation(`/projects/${projectId}/scenes`)}
                    className="w-full"
                    disabled={!breakdown}
                  >
                    Ver Escenas
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personajes
                  </CardTitle>
                  <CardDescription>
                    Gestiona tus personajes y referencias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() =>
                      setLocation(`/projects/${projectId}/characters`)
                    }
                    className="w-full"
                    disabled={!storyBible}
                  >
                    Gestionar Personajes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Flujo de Trabajo</CardTitle>
                <CardDescription>
                  Sigue estos pasos para completar tu proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      scripts && scripts.length > 0
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}>
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        Subir Guion
                      </h3>
                      <p className="text-sm text-slate-600">
                        Carga tu guion maestro en el editor
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      storyBible ? "bg-green-500" : "bg-slate-300"
                    }`}>
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        Analizar Guion
                      </h3>
                      <p className="text-sm text-slate-600">
                        El LLM analizará tu guion y generará Story Bible
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      breakdown ? "bg-green-500" : "bg-slate-300"
                    }`}>
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        Revisar Escenas
                      </h3>
                      <p className="text-sm text-slate-600">
                        Visualiza el Scene Breakdown y genera imágenes
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-slate-300">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        Exportar
                      </h3>
                      <p className="text-sm text-slate-600">
                        Descarga tu proyecto en texto plano, JSON o Markdown
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

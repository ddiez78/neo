import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Loader2, Plus, Trash2, Edit2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Queries
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Filtrado y búsqueda
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project: any) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Mutations
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Proyecto creado exitosamente");
      setTitle("");
      setDescription("");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Proyecto eliminado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateProject = async () => {
    if (!title.trim()) {
      toast.error("El título del proyecto es requerido");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createMutation.mutateAsync({
        title,
        description: description || undefined,
      });
      if (result.projectId) {
        setLocation(`/projects/${result.projectId}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = (projectId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      deleteMutation.mutate({ projectId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bienvenido a Neo-App</CardTitle>
            <CardDescription>
              Crea historias narrativas con análisis de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Inicia sesión para comenzar a crear tus proyectos de historias visuales.
            </p>
            <Button className="w-full">Iniciar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Neo-App</h1>
            <p className="text-sm text-slate-500">Generador de Historias Narrativas</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="outline" size="sm">
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mis Proyectos</h2>
            <p className="text-slate-600 mt-1">
              {filteredProjects?.length || 0} de {projects?.length || 0} proyecto{projects?.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Create Project Dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                <DialogDescription>
                  Crea un nuevo proyecto para comenzar a generar tu historia
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Título del Proyecto
                  </label>
                  <Input
                    placeholder="Ej: La Aventura de Luna"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Descripción (Opcional)
                  </label>
                  <Textarea
                    placeholder="Describe brevemente tu proyecto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={isCreating}
                    className="gap-2"
                  >
                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Crear Proyecto
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        {projects && projects.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por título o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48 flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="analyzing">Analizando</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Creado el {new Date(project.createdAt).toLocaleDateString("es-ES")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/projects/${project.id}/edit`);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
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
                    <span className="text-xs text-slate-500">
                      {new Date(project.updatedAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600 mb-4">No se encontraron proyectos con los filtros aplicados</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="gap-2">
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-600 mb-4">No tienes proyectos todavía</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Crear tu primer proyecto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                    <DialogDescription>
                      Crea un nuevo proyecto para comenzar a generar tu historia
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Título del Proyecto
                      </label>
                      <Input
                        placeholder="Ej: La Aventura de Luna"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Descripción (Opcional)
                      </label>
                      <Textarea
                        placeholder="Describe brevemente tu proyecto..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isCreating}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={isCreating}
                        className="gap-2"
                      >
                        {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Crear Proyecto
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

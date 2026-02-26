import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Loader2, ArrowLeft, Plus, Users, MapPin, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function StoryBible() {
  const [, params] = useRoute("/projects/:projectId/story-bible");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : 0;

  const [activeTab, setActiveTab] = useState("characters");
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterSpecies, setNewCharacterSpecies] = useState("");
  const [newCharacterAge, setNewCharacterAge] = useState("");
  const [newCharacterTraits, setNewCharacterTraits] = useState("");

  // Queries
  const { data: project } = trpc.projects.get.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: storyBible, isLoading } = trpc.storyBible.getStoryBible.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  // Mutations
  const createCharacterMutation = trpc.characters.create.useMutation({
    onSuccess: () => {
      toast.success("Personaje agregado exitosamente");
      setNewCharacterName("");
      setNewCharacterSpecies("");
      setNewCharacterAge("");
      setNewCharacterTraits("");
      setIsAddingCharacter(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) {
      toast.error("El nombre del personaje es requerido");
      return;
    }

    await createCharacterMutation.mutateAsync({
      projectId,
      name: newCharacterName,
      species: newCharacterSpecies || undefined,
      ageVibe: newCharacterAge || undefined,
      visualTraits: newCharacterTraits || undefined,
    });
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
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
            <p className="text-sm text-slate-600">Story Bible</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : storyBible ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="characters" className="gap-2">
                <Users className="w-4 h-4" />
                Personajes ({storyBible.characters.length})
              </TabsTrigger>
              <TabsTrigger value="locations" className="gap-2">
                <MapPin className="w-4 h-4" />
                Locaciones ({storyBible.locations.length})
              </TabsTrigger>
              <TabsTrigger value="props" className="gap-2">
                <Package className="w-4 h-4" />
                Props ({storyBible.props.length})
              </TabsTrigger>
            </TabsList>

            {/* Characters Tab */}
            <TabsContent value="characters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  Personajes
                </h2>
                <Dialog open={isAddingCharacter} onOpenChange={setIsAddingCharacter}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Agregar Personaje
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Personaje</DialogTitle>
                      <DialogDescription>
                        Agrega un personaje manualmente a tu Story Bible
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Nombre
                        </label>
                        <Input
                          placeholder="Ej: Luna"
                          value={newCharacterName}
                          onChange={(e) => setNewCharacterName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Especie/Tipo
                        </label>
                        <Input
                          placeholder="Ej: Niña, Gato, Hada"
                          value={newCharacterSpecies}
                          onChange={(e) => setNewCharacterSpecies(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Edad/Vibe
                        </label>
                        <Input
                          placeholder="Ej: 7 años, Joven, Antiguo"
                          value={newCharacterAge}
                          onChange={(e) => setNewCharacterAge(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Rasgos Visuales
                        </label>
                        <Textarea
                          placeholder="Describe los rasgos visuales del personaje..."
                          value={newCharacterTraits}
                          onChange={(e) => setNewCharacterTraits(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3 justify-end pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingCharacter(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddCharacter}>
                          Agregar Personaje
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storyBible.characters.map((character: any) => (
                  <Card key={character.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{character.name}</CardTitle>
                      {character.species && (
                        <CardDescription>{character.species}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {character.ageVibe && (
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            Edad/Vibe
                          </p>
                          <p className="text-sm text-slate-900">
                            {character.ageVibe}
                          </p>
                        </div>
                      )}
                      {character.visualTraits && (
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            Rasgos Visuales
                          </p>
                          <p className="text-sm text-slate-900">
                            {character.visualTraits}
                          </p>
                        </div>
                      )}
                      {character.personalityVibe && (
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            Personalidad
                          </p>
                          <p className="text-sm text-slate-900">
                            {character.personalityVibe}
                          </p>
                        </div>
                      )}
                      {character.referenceImageUrl && (
                        <div>
                          <p className="text-xs font-medium text-slate-600">
                            Imagen de Referencia
                          </p>
                          <img
                            src={character.referenceImageUrl}
                            alt={character.name}
                            className="mt-2 w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Locaciones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyBible.locations.map((location: any) => (
                  <Card key={location.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        {location.visualDescription}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Props Tab */}
            <TabsContent value="props" className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Props
              </h2>
              {storyBible.props.length > 0 ? (
                <div className="space-y-3">
                  {storyBible.props.map((prop: any) => (
                    <Card key={prop.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              {prop.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {prop.description}
                            </p>
                            {prop.usedBy && (
                              <p className="text-xs text-slate-500 mt-2">
                                Usado por: {prop.usedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No hay props en este proyecto</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-600">
                No hay Story Bible disponible. Carga y analiza un guion primero.
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
    </div>
  );
}

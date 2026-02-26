import { useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function useScenes(projectId?: number) {
  const utils = trpc.useUtils();

  // Obtener lista de escenas
  const { data: scenes = [], isLoading, error } = trpc.scenes.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Generar imagen para escena
  const generateImageMutation = trpc.scenes.generateImage.useMutation({
    onSuccess: () => {
      utils.scenes.list.invalidate({ projectId: projectId! });
      toast.success('Imagen generada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al generar imagen: ${error.message}`);
    },
  });

  // Actualizar escena
  const updateMutation = trpc.scenes.update.useMutation({
    onSuccess: () => {
      utils.scenes.list.invalidate({ projectId: projectId! });
      toast.success('Escena actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al actualizar escena: ${error.message}`);
    },
  });

  const generateImage = useCallback(
    (sceneId: number) => {
      return generateImageMutation.mutateAsync({ sceneId });
    },
    [generateImageMutation]
  );

  const updateScene = useCallback(
    (sceneId: number, beat?: string, grokVideoPrompt?: string, negative?: string) => {
      return updateMutation.mutateAsync({
        sceneId,
        beat,
        grokVideoPrompt,
        negative,
      });
    },
    [updateMutation]
  );

  return {
    scenes,
    isLoading,
    error,
    generateImage,
    updateScene,
    isGenerating: generateImageMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function useCharacters(projectId?: number) {
  const utils = trpc.useUtils();

  // Obtener lista de personajes
  const { data: characters = [], isLoading, error } = trpc.characters.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Crear personaje
  const createMutation = trpc.characters.create.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate({ projectId: projectId! });
      toast.success('Personaje creado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al crear personaje: ${error.message}`);
    },
  });

  // Actualizar personaje
  const updateMutation = trpc.characters.update.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate({ projectId: projectId! });
      toast.success('Personaje actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al actualizar personaje: ${error.message}`);
    },
  });

  // Subir imagen
  const uploadImageMutation = trpc.characters.uploadImage.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate({ projectId: projectId! });
      toast.success('Imagen subida exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al subir imagen: ${error.message}`);
    },
  });

  // Eliminar personaje
  const deleteMutation = trpc.characters.delete.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate({ projectId: projectId! });
      toast.success('Personaje eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar personaje: ${error.message}`);
    },
  });

  const createCharacter = useCallback(
    (name: string, species?: string, ageVibe?: string, visualTraits?: string, outfit?: string, personalityVibe?: string) => {
      if (!projectId) {
        toast.error('Proyecto no disponible');
        return Promise.reject(new Error('Project ID required'));
      }
      return createMutation.mutateAsync({
        projectId,
        name,
        species,
        ageVibe,
        visualTraits,
        outfit,
        personalityVibe,
      });
    },
    [projectId, createMutation]
  );

  const updateCharacter = useCallback(
    (characterId: number, name?: string, species?: string, ageVibe?: string, visualTraits?: string, outfit?: string, personalityVibe?: string) => {
      return updateMutation.mutateAsync({
        characterId,
        name,
        species,
        ageVibe,
        visualTraits,
        outfit,
        personalityVibe,
      });
    },
    [updateMutation]
  );

  const uploadImage = useCallback(
    (characterId: number, file: File) => {
      return uploadImageMutation.mutateAsync({ characterId, imageBuffer: file as any });
    },
    [uploadImageMutation]
  );

  const deleteCharacter = useCallback(
    (characterId: number) => {
      return deleteMutation.mutateAsync({ characterId });
    },
    [deleteMutation]
  );

  return {
    characters,
    isLoading,
    error,
    createCharacter,
    updateCharacter,
    uploadImage,
    deleteCharacter,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUploading: uploadImageMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

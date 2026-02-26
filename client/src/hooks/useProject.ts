import { useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function useProject(projectId?: number) {
  const utils = trpc.useUtils();

  // Obtener proyecto específico
  const { data: project, isLoading: projectLoading, error: projectError } = trpc.projects.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Obtener lista de proyectos del usuario
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = trpc.projects.list.useQuery();

  // Crear proyecto
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success('Proyecto creado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al crear proyecto: ${error.message}`);
    },
  });

  // Actualizar proyecto
  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success('Proyecto actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al actualizar proyecto: ${error.message}`);
    },
  });

  // Eliminar proyecto
  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar proyecto: ${error.message}`);
    },
  });

  const createProject = useCallback(
    (title: string, description?: string) => {
      return createProjectMutation.mutateAsync({ title, description });
    },
    [createProjectMutation]
  );

  const updateProject = useCallback(
    (id: number, title?: string, description?: string, status?: 'draft' | 'analyzing' | 'completed' | 'archived') => {
      return updateProjectMutation.mutateAsync({ projectId: id, title, description, status });
    },
    [updateProjectMutation]
  );

  const deleteProject = useCallback(
    (id: number) => {
      return deleteProjectMutation.mutateAsync({ projectId: id });
    },
    [deleteProjectMutation]
  );

  return {
    // Datos
    project,
    projects,
    
    // Estados de carga
    isLoading: projectLoading || projectsLoading,
    projectLoading,
    projectsLoading,
    
    // Errores
    error: projectError || projectsError,
    projectError,
    projectsError,
    
    // Mutaciones
    createProject,
    updateProject,
    deleteProject,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}

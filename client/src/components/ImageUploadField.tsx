import { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  onImageSelect: (file: File, preview: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  label?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUploadField({
  onImageSelect,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  label = 'Subir Imagen',
  disabled = false,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Validar tipo de archivo
      if (!acceptedFormats.includes(file.type)) {
        return {
          valid: false,
          error: `Formato no permitido. Formatos aceptados: ${acceptedFormats.join(', ')}`,
        };
      }

      // Validar tamaño
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        return {
          valid: false,
          error: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB, Actual: ${fileSizeMB.toFixed(2)}MB`,
        };
      }

      return { valid: true };
    },
    [acceptedFormats, maxSizeMB]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Error al validar archivo');
        toast.error(validation.error || 'Error al validar archivo');
        return;
      }

      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        setFileName(file.name);
        onImageSelect(file, result);
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        toast.error('Error al leer el archivo');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    },
    [validateFile, onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Arrastra una imagen aquí o haz clic para seleccionar</p>
              <p className="text-xs text-gray-500 mt-1">
                Máximo {maxSizeMB}MB. Formatos: JPEG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="h-48 w-48 object-cover rounded-lg border border-gray-200"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled || isLoading}
              className="absolute top-1 right-1 bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Archivo:</span> {fileName}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

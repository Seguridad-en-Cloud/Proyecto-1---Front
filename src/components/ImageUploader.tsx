import { useState, useRef, useCallback } from "react";
import { uploadApi, type UploadResponse } from "@/api/upload";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** Current image URL (if any) */
  value?: string | null;
  /** Callback with the selected variant URL (medium by default) */
  onChange: (url: string | null) => void;
  /** "logos" for restaurant logos, "dishes" for dish images */
  prefix?: "logos" | "dishes";
  /** Additional CSS classes for the container */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  value,
  onChange,
  prefix = "dishes",
  className,
  placeholder = "Subir imagen",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error("Solo se aceptan imágenes JPEG, PNG o WebP");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("La imagen no puede superar 5 MB");
        return;
      }

      setUploading(true);
      try {
        const res: UploadResponse = await uploadApi.upload(file, prefix);
        // Use medium variant as default display
        onChange(res.medium);
        toast.success("Imagen subida correctamente");
      } catch {
        toast.error("Error al subir la imagen");
      } finally {
        setUploading(false);
      }
    },
    [onChange, prefix]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so re-selecting the same file works
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await uploadApi.delete(value);
      } catch {
        // Don't block removal if delete fails
      }
    }
    onChange(null);
  };

  if (value) {
    return (
      <div className={cn("relative group inline-block", className)}>
        <img
          src={value}
          alt="Uploaded"
          className="h-28 w-28 rounded-lg object-cover border border-border"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      ) : (
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
      )}
      <span className="mt-2 text-xs text-muted-foreground">
        {uploading ? "Subiendo..." : placeholder}
      </span>
      <span className="text-[10px] text-muted-foreground/60">
        JPEG, PNG, WebP · máx 5 MB
      </span>
    </div>
  );
}

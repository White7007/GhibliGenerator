import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";

interface FileUploaderProps {
  file: File | null;
  previewUrl: string | null;
  onFileUpload: (file: File, previewUrl: string) => void;
  onRemoveFile: () => void;
  onTransform: () => void;
  isTransforming: boolean;
}

export default function FileUploader({
  file,
  previewUrl,
  onFileUpload,
  onRemoveFile,
  onTransform,
  isTransforming
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file validation and processing
  const processFile = (file: File) => {
    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size exceeds the 2MB limit.",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileUpload(file, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle click on drop zone
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Image</h2>
      <p className="text-gray-600 mb-6">
        Upload an image to transform it into Studio Ghibli-style artwork using client-side filters and effects.
        Our local transformation provides authentic Ghibli color palettes, soft watercolor effects, and hand-drawn line styling.
        Supported formats: JPG, PNG. Maximum size: 2MB.
      </p>
      
      {!file ? (
        <div 
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 transition-colors
            ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 hover:bg-gray-100"}`}
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-center">
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG (max. 2MB)</p>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="rounded-md overflow-hidden w-16 h-16 flex-shrink-0 bg-gray-200">
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button 
              onClick={onRemoveFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Button 
            onClick={onTransform} 
            className="w-full"
            disabled={isTransforming}
          >
            {isTransforming ? "Transforming..." : "Apply Ghibli Style Filters"}
          </Button>
        </div>
      )}
    </div>
  );
}

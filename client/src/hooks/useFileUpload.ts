import { useState, useRef } from "react";

interface FileUploadOptions {
  maxSizeInBytes: number;
  acceptedFileTypes: string[];
}

interface FileUploadResult {
  file: File | null;
  filePreview: string | null;
  fileError: string | null;
  isDragging: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
  clearFile: () => void;
  triggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function useFileUpload(options: FileUploadOptions): FileUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!options.acceptedFileTypes.includes(file.type)) {
      setFileError(`Invalid file type. Accepted types: ${options.acceptedFileTypes.join(", ")}`);
      return false;
    }

    // Check file size
    if (file.size > options.maxSizeInBytes) {
      setFileError(`File size exceeds the limit of ${options.maxSizeInBytes / (1024 * 1024)}MB`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    file,
    filePreview,
    fileError,
    isDragging,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    triggerFileInput,
    fileInputRef
  };
}

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultSectionProps {
  state: "initial" | "uploading" | "transforming" | "success" | "error";
  originalImage: string | null;
  transformedImage: string | null;
  transformationMessage: string;
  errorMessage: string;
  onDownload: () => void;
  onNewTransform: () => void;
  onTryAgain: () => void;
}

export default function ResultSection({
  state,
  originalImage,
  transformedImage,
  transformationMessage,
  errorMessage,
  onDownload,
  onNewTransform,
  onTryAgain
}: ResultSectionProps) {
  // Initial state content
  const InitialState = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-32 h-32 text-gray-300 mb-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M9.5 15a3.5 3.5 0 005 0" />
      </svg>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Your Ghibli artwork will appear here</h3>
      <p className="text-sm text-gray-500">
        Upload an image to start the transformation process
      </p>
    </div>
  );

  // Loading state content
  const LoadingState = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-cream rounded-full animate-spin"></div>
        <div className="w-20 h-20 border-4 border-transparent border-t-green-500 rounded-full absolute top-0 left-0 animate-spin"></div>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Transforming your image...</h3>
      <p className="text-sm text-gray-500">
        Please wait while we apply Studio Ghibli style filters to your image. 
        We're adjusting colors, adding watercolor effects, and enhancing details to match the Ghibli aesthetic.
      </p>
    </div>
  );

  // Success state content
  const SuccessState = () => {
    // Use a generic AI badge rather than mentioning specific services
    const badgeColor = 'bg-blue-100 text-blue-800';
    const methodName = 'AI-Powered';
        
    return (
      <div className="flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-800">Your Ghibli Artwork</h2>
          <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
            {methodName}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {transformationMessage || 'Transformation complete! Your image has been styled in the Studio Ghibli aesthetic.'}
        </p>
        
        <div className="rounded-lg overflow-hidden bg-gray-100 flex-grow mb-4 relative min-h-[300px]">
          {transformedImage && (
            <img 
              src={transformedImage}
              alt="Transformed image in Ghibli style"
              className="w-full h-full object-contain"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={onDownload}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Download Artwork
          </Button>
          <Button 
            onClick={onNewTransform}
            variant="outline"
            className="w-full"
          >
            Transform Another Image
          </Button>
        </div>
      </div>
    );
  };

  // Error state content
  const ErrorState = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-6">
        {errorMessage || "There was an error processing your image. Please try again."}
      </p>
      <Button 
        onClick={onTryAgain}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {state === "success" ? "Result" : "Preview"}
      </h2>
      
      {state === "initial" && <InitialState />}
      {state === "uploading" && originalImage && (
        <div className="flex-grow flex flex-col">
          <div className="rounded-lg overflow-hidden bg-gray-100 flex-grow mb-4 relative min-h-[300px]">
            <img 
              src={originalImage}
              alt="Original image"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            Click "Apply Ghibli Style Filters" on the left to continue
          </p>
        </div>
      )}
      {state === "transforming" && <LoadingState />}
      {state === "success" && <SuccessState />}
      {state === "error" && <ErrorState />}
    </div>
  );
}

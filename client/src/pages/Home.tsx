import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProgressTracker from "@/components/ProgressTracker";
import FileUploader from "@/components/FileUploader";
import ResultSection from "@/components/ResultSection";
import GhibliExamples from "@/components/GhibliExamples";
import Advertisement from "@/components/Advertisement";
import FullScreenAd from "@/components/FullScreenAd";
import { transformImage } from "@/lib/api";
import { trackConversion, trackInteraction, initGoogleAdsRemarketing, trackCompletedTransformation } from "@/lib/googleAds";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

// Transformation states
type TransformationState = "initial" | "uploading" | "transforming" | "success" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [transformationState, setTransformationState] = useState<TransformationState>("initial");
  const [transformationMessage, setTransformationMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeStep, setActiveStep] = useState(1);
  const [showFullScreenAd, setShowFullScreenAd] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize Google Ads tracking on component mount
  useEffect(() => {
    // Initialize Google Ads remarketing
    initGoogleAdsRemarketing();
    
    // Track page view for Google Ads
    trackInteraction('view', 'home_page');
    
    return () => {
      // Clean up any Google Ads tracking if needed
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (uploadedFile: File, preview: string) => {
    setFile(uploadedFile);
    setPreviewUrl(preview);
    setTransformationState("uploading");
    
    // Track file upload for ad targeting
    trackInteraction('view', 'image_upload');
    
    // Show full-screen ad after file upload
    setShowFullScreenAd(true);
  };
  
  // Handle ad close
  const handleAdClose = () => {
    setShowFullScreenAd(false);
    
    // Track ad view completion
    trackConversion('adview', 1);
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setTransformedImageUrl(null);
    setTransformationState("initial");
    setActiveStep(1);
  };

  // Image transformation mutation
  const transformMutation = useMutation({
    mutationFn: transformImage,
    onMutate: () => {
      setTransformationState("transforming");
      setActiveStep(2);
    },
    onSuccess: (data) => {
      // Now we're handling this client-side, the data already includes the base64 info
      setTransformedImageUrl(`data:image/jpeg;base64,${data.transformedImage}`);
      setTransformationState("success");
      setActiveStep(3);
      
      // Set transformation message (not mentioning specific AI service)
      const method = data.method || 'client-side';
      let message = '';
      
      if (method === 'ai') {
        message = 'Transformation complete! Your image was processed by our advanced AI model that creates artwork in the distinctive Studio Ghibli style.';
      } else if (method === 'client-side') {
        message = 'Transformation complete! The image was processed with color palette adjustments, watercolor effects, and hand-drawn line styling.';
      } else {
        // Generic message for any other method
        message = 'Transformation complete! Your photo has been converted to Studio Ghibli style artwork.';
      }
      
      setTransformationMessage(message);
      
      toast({
        title: "Transformation Complete",
        description: "Your image has been transformed to Studio Ghibli style!",
      });
      
      // Track successful transformation for Google Ads
      trackCompletedTransformation({
        width: 0, // Can't directly access image dimensions from File object
        height: 0, // Can't directly access image dimensions from File object
        fileSize: file?.size || 0
      });
      trackConversion('image_transformed', 5);
    },
    onError: (error: Error) => {
      setTransformationState("error");
      setErrorMessage(error.message || "Failed to transform image. Please try again.");
      toast({
        title: "Transformation Failed",
        description: error.message || "Failed to transform image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle transformation
  const handleTransform = () => {
    if (!file) return;
    
    // Track the transform button click
    trackInteraction('transformation', 'transform_button');
    
    // Process image transformation client-side
    transformMutation.mutate(file);
  };

  // Handle download
  const handleDownload = () => {
    if (!transformedImageUrl) return;
    
    const link = document.createElement("a");
    link.href = transformedImageUrl;
    link.download = `ghibli-transformed-${file?.name || "image"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download as a high-value conversion for Google Ads
    trackConversion('image_download', 10);
    trackInteraction('click', 'download_button');
  };

  // Handle reset for a new transformation
  const handleNewTransform = () => {
    handleRemoveFile();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top ad banner */}
        <Advertisement position="top" />
        
        <ProgressTracker activeStep={activeStep} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main content area - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <FileUploader 
                  file={file}
                  previewUrl={previewUrl}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={handleRemoveFile}
                  onTransform={handleTransform}
                  isTransforming={transformationState === "transforming"}
                />
              </Card>
              
              {/* Ad between upload and preview sections */}
              <div className="col-span-1 lg:col-span-2 mt-2 mb-2">
                <div 
                  className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => {
                    trackInteraction('click', 'ad_between_sections');
                    trackConversion('mid_page_ad_click');
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-500 font-medium">Advertisement</p>
                      <p className="text-xs text-gray-400">Create multiple Ghibli-style transformations with our premium tools</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-6">
                <ResultSection 
                  state={transformationState}
                  originalImage={previewUrl}
                  transformedImage={transformedImageUrl}
                  transformationMessage={transformationMessage}
                  errorMessage={errorMessage}
                  onDownload={handleDownload}
                  onNewTransform={handleNewTransform}
                  onTryAgain={handleRemoveFile}
                />
              </Card>
            </div>
            
            {/* Ad above Ghibli Examples and below preview section */}
            <div className="mt-8 mb-8">
              <div onClick={() => trackInteraction('click', 'before_examples_ad')}>
                <Advertisement position="mid-content" className="w-full" />
              </div>
            </div>
            
            <GhibliExamples />
          </div>
          
          {/* Sidebar ad - 1/3 width on desktop */}
          <div className="hidden lg:block">
            <Advertisement position="sidebar" />
          </div>
        </div>
        
        {/* Bottom ad banner */}
        <Advertisement position="bottom" className="mt-12" />
        
        {/* Full-screen ad that shows after upload */}
        {showFullScreenAd && (
          <FullScreenAd onClose={handleAdClose} duration={8000} />
        )}
        
        {/* Google AdSense script (this would be activated in production) */}
        {process.env.NODE_ENV === 'production' && (
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9989787802364698" 
            crossOrigin="anonymous"></script>
        )}
      </div>
    </Layout>
  );
}

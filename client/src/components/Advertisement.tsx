import { cn } from "@/lib/utils";
import { trackInteraction, trackConversion } from "@/lib/googleAds";
import { useEffect, useRef } from "react";
import { GOOGLE_ADS_CONFIG } from "@/shared/config";

// Type declaration for Google AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdvertisementProps {
  position: 'top' | 'bottom' | 'sidebar' | 'mid-content';
  className?: string;
}

/**
 * Advertisement component that can be placed in different locations on the page
 */
export default function Advertisement({ position, className }: AdvertisementProps) {
  // For AdSense integration
  const adRef = useRef<HTMLDivElement>(null);
  
  // Initialize AdSense ads when component mounts
  useEffect(() => {
    // Only initialize AdSense for mid-content position in production
    if (position === 'mid-content' && process.env.NODE_ENV === 'production') {
      try {
        // Use a type assertion to avoid TypeScript errors
        const adsenseScript = (window as any).adsbygoogle;
        if (adsenseScript) {
          // Push the ad to AdSense for display
          (adsenseScript as any[] || []).push({});
          console.log('AdSense ad loaded for position:', position);
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [position]);
  
  // Track ad clicks
  const handleAdClick = () => {
    trackInteraction('click', `ad_${position}`);
  };
  
  // Different styling based on position
  const styles = {
    top: "w-full h-20 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg",
    bottom: "w-full h-24 mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg",
    sidebar: "w-full sticky top-4 h-[calc(100vh-2rem)] bg-gray-100 dark:bg-gray-800 rounded-lg",
    "mid-content": "w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
  };

  // Different content based on position
  const getContent = () => {
    switch (position) {
      case 'top':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">Advertisement</p>
              <p className="text-xs text-gray-400">Transform your photos with premium Ghibli style filters</p>
            </div>
          </div>
        );
      case 'bottom':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">Advertisement</p>
              <p className="text-sm text-gray-400">Upgrade to Pro for unlimited transformations</p>
              <button 
                className="mt-2 text-xs bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double tracking
                  trackInteraction('click', 'ad_bottom_button');
                  trackConversion('ad_click', 1);
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        );
      case 'sidebar':
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-gray-500 font-medium mb-2">Advertisement</p>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Explore premium Ghibli transformations and enhance your creative projects
            </p>
            <div className="flex flex-col space-y-4 w-full">
              {/* Multiple ad spots in sidebar */}
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent onClick from firing
                    trackInteraction('click', `ad_sidebar_feature_${i}`);
                    trackConversion('feature_click');
                  }}
                >
                  <p className="text-sm font-medium">Premium Feature #{i}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {i === 1 && "High-resolution exports"}
                    {i === 2 && "Multiple style variations"}
                    {i === 3 && "Batch processing"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'mid-content':
        return (
          <div className="relative w-full h-full">
            {/* Placeholder content for development/testing */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="flex items-center justify-between h-full p-4">
                <div className="text-center flex-1">
                  <p className="text-gray-500 font-medium">Advertisement</p>
                  <p className="text-sm text-gray-400">Check out our Ghibli art collection</p>
                </div>
                <div className="flex-1 text-center">
                  <button 
                    className="mt-2 text-xs bg-green-600 text-white px-4 py-1 rounded-full hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent double tracking
                      trackInteraction('click', 'ad_mid_content_button');
                      trackConversion('ad_mid_click', 2);
                    }}
                  >
                    View Gallery
                  </button>
                </div>
              </div>
            )}
            
            {/* Actual AdSense ad unit for production */}
            {process.env.NODE_ENV === 'production' && (
              <div ref={adRef}>
                <ins 
                  className="adsbygoogle"
                  style={{ display: 'block', width: '100%', height: '96px' }}
                  data-ad-client={GOOGLE_ADS_CONFIG.ADSENSE_PUBLISHER_ID}
                  data-ad-slot="mid-content-slot" // You'll need to create this slot in your AdSense account
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(styles[position], "overflow-hidden cursor-pointer", className)}
      onClick={handleAdClick}
    >
      {getContent()}
    </div>
  );
}
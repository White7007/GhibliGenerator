import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackInteraction, trackConversion } from '@/lib/googleAds';

interface FullScreenAdProps {
  onClose: () => void;
  duration?: number; // Duration in milliseconds before ad can be closed
}

export default function FullScreenAd({ onClose, duration = 5000 }: FullScreenAdProps) {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(duration / 1000));

  useEffect(() => {
    // Track full-screen ad impression
    trackInteraction('view', 'fullscreen_ad');
    trackConversion('fullscreen_ad_view');
    
    // Enable closing after duration
    const timer = setTimeout(() => {
      setCanClose(true);
    }, duration);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [duration]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Ad header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2">Ad</div>
            <h3 className="text-lg font-medium">Google Ads</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              trackInteraction('click', 'fullscreen_ad_close');
              onClose();
            }}
            disabled={!canClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
            {!canClose && <span className="ml-1">{countdown}</span>}
          </Button>
        </div>

        {/* Ad content */}
        <div className="p-6 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Premium Studio Ghibli Transformations</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Transform unlimited images with our premium service. Higher quality, more options, faster processing.
            </p>
          </div>

          {/* Mock Google Ad banners */}
          <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Google Ads would appear here</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Displaying relevant advertisements based on user interests
              </p>
            </div>
          </div>

          {/* Countdown message */}
          {!canClose && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ad will close in {countdown} seconds...
            </p>
          )}

          {/* Call to action */}
          {canClose && (
            <Button 
              onClick={() => {
                trackInteraction('click', 'fullscreen_ad_continue');
                trackConversion('ad_continue');
                onClose();
              }}
              size="lg" 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Continue to Your Transformation
            </Button>
          )}
        </div>

        {/* Ad footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Ad served by Google Ads Network • 
            <a 
              href="#" 
              className="underline"
              onClick={(e) => {
                e.preventDefault();
                trackInteraction('click', 'ad_preferences');
              }}
            >
              Ad Preferences
            </a> • 
            <a 
              href="#" 
              className="underline"
              onClick={(e) => {
                e.preventDefault();
                trackInteraction('click', 'why_this_ad');
              }}
            >
              Why this ad?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
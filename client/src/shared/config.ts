/**
 * Application configuration settings
 */

// Google Ads Configuration
export const GOOGLE_ADS_CONFIG = {
  // Google Ads Account ID - your actual Google Ads ID
  // Format: "AW-XXXXXXXXXX" 
  ACCOUNT_ID: "AW-3189-4292-1074-1854",
  
  // Google AdSense Publisher ID - your actual AdSense publisher ID
  // Format: "ca-pub-XXXXXXXXXXXXXXXX"
  ADSENSE_PUBLISHER_ID: "ca-pub-9989787802364698",
  
  // Conversion IDs/labels for different events
  CONVERSION_LABELS: {
    // Track when a user uploads an image
    IMAGE_UPLOAD: "image_upload",
    
    // Track when a user transforms an image
    IMAGE_TRANSFORM: "image_transform",
    
    // Track when a user downloads a transformed image
    IMAGE_DOWNLOAD: "image_download",
    
    // Track when a user clicks on mid-page ad
    MID_PAGE_AD_CLICK: "mid_page_ad_click"
  },
  
  // Conversion values (for ROI calculation in Google Ads)
  CONVERSION_VALUES: {
    IMAGE_UPLOAD: 1,     // $1 value for uploads
    IMAGE_TRANSFORM: 5,  // $5 value for transformations
    IMAGE_DOWNLOAD: 10,  // $10 value for downloads
    MID_PAGE_AD_CLICK: 2 // $2 value for mid-page ad clicks
  }
};
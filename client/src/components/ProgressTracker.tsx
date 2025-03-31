import { Check } from "lucide-react";

interface ProgressTrackerProps {
  activeStep: number;
}

export default function ProgressTracker({ activeStep }: ProgressTrackerProps) {
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Transform" },
    { number: 3, label: "Download" }
  ];

  return (
    <div className="mb-12 relative">
      {/* Progress lines */}
      <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-green-500 z-0 transition-all duration-300" 
        style={{ width: `${Math.max(0, (activeStep - 1) / (steps.length - 1) * 100)}%` }}
      />

      {/* Steps */}
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step) => {
          const isActive = step.number === activeStep;
          const isCompleted = step.number < activeStep;
          
          return (
            <div key={step.number} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${isCompleted ? "bg-blue-600 text-white" : 
                    isActive ? "bg-green-500 text-white" : 
                    "bg-gray-200 text-gray-600"}`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

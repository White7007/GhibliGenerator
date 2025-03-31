import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Component to display an upgrade prompt after successful transformations
 */
export default function UpgradePrompt() {
  return (
    <Card className="p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-300 dark:border-blue-800">
      <div className="flex flex-col items-center text-center">
        <Badge className="mb-2 bg-yellow-500 hover:bg-yellow-600">Premium Offer</Badge>
        <h3 className="text-xl font-bold mb-2">Unlock Premium Features</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Upgrade to our premium plan and transform unlimited images with additional style options:
        </p>
        
        <ul className="mb-4 text-left w-full max-w-xs">
          <li className="flex items-center mb-2">
            <span className="text-green-500 mr-2">✓</span>
            <span>Unlimited transformations</span>
          </li>
          <li className="flex items-center mb-2">
            <span className="text-green-500 mr-2">✓</span>
            <span>Higher resolution output</span>
          </li>
          <li className="flex items-center mb-2">
            <span className="text-green-500 mr-2">✓</span>
            <span>10+ additional style options</span>
          </li>
          <li className="flex items-center mb-2">
            <span className="text-green-500 mr-2">✓</span>
            <span>Batch processing</span>
          </li>
        </ul>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Upgrade Now - $9.99/month
          </Button>
          <Button variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </Card>
  );
}
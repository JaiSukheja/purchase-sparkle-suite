import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw, Clock } from 'lucide-react';

interface MaintenanceModeProps {
  estimatedTime?: string;
  message?: string;
}

export const MaintenanceMode = ({ 
  estimatedTime = "30 minutes", 
  message = "We're performing scheduled maintenance to improve your experience."
}: MaintenanceModeProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
          <CardTitle className="text-2xl">System Maintenance</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {estimatedTime}</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">What we're working on:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Database optimizations</li>
              <li>• Performance improvements</li>
              <li>• Security updates</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Thank you for your patience while we improve our service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
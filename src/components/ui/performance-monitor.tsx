import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      
      let fps = 60;
      let frameCount = 0;
      const startTime = performance.now();
      
      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime - startTime >= 1000) {
          fps = frameCount;
          setMetrics({
            loadTime: Math.round(loadTime),
            renderTime: Math.round(renderTime),
            memoryUsage: Math.round(memoryUsage * 10) / 10,
            fps
          });
        } else {
          requestAnimationFrame(measureFPS);
        }
      };
      
      requestAnimationFrame(measureFPS);
    };

    // Wait for page to load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Toggle visibility with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('load', measurePerformance);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isVisible]);

  if (process.env.NODE_ENV !== 'development' || !isVisible || !metrics) {
    return null;
  }

  const getMetricColor = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      loadTime: { good: 1000, poor: 3000 },
      renderTime: { good: 100, poor: 300 },
      memoryUsage: { good: 50, poor: 100 },
      fps: { good: 50, poor: 30 }
    };

    const threshold = thresholds[metric];
    if (metric === 'fps') {
      if (value >= threshold.good) return 'default';
      if (value >= threshold.poor) return 'secondary';
      return 'destructive';
    } else {
      if (value <= threshold.good) return 'default';
      if (value <= threshold.poor) return 'secondary';
      return 'destructive';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            <Badge variant="outline" className="text-xs">DEV</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Load Time
            </span>
            <Badge variant={getMetricColor('loadTime', metrics.loadTime)}>
              {metrics.loadTime}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Render Time
            </span>
            <Badge variant={getMetricColor('renderTime', metrics.renderTime)}>
              {metrics.renderTime}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Memory Usage</span>
            <Badge variant={getMetricColor('memoryUsage', metrics.memoryUsage)}>
              {metrics.memoryUsage}MB
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">FPS</span>
            <Badge variant={getMetricColor('fps', metrics.fps)}>
              {metrics.fps}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground pt-1 border-t">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
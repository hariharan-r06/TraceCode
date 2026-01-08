import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  compilationResult: string | null;
  output: string | null;
  status: 'idle' | 'success' | 'compilation_error' | 'runtime_error' | 'timeout';
  executionTime: number | null;
}

export const OutputPanel = ({
  compilationResult,
  output,
  status,
  executionTime,
}: OutputPanelProps) => {
  const statusConfig = {
    idle: { label: 'Ready', variant: 'secondary' as const, icon: Terminal },
    success: { label: 'Success', variant: 'default' as const, icon: CheckCircle2, color: 'text-success' },
    compilation_error: { label: 'Compilation Error', variant: 'destructive' as const, icon: XCircle },
    runtime_error: { label: 'Runtime Error', variant: 'destructive' as const, icon: XCircle },
    timeout: { label: 'Timeout', variant: 'destructive' as const, icon: Clock },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Output
          </CardTitle>
          <div className="flex items-center gap-2">
            {executionTime !== null && status === 'success' && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {executionTime.toFixed(3)}s
              </Badge>
            )}
            <Badge variant={currentStatus.variant} className="flex items-center gap-1">
              <StatusIcon className={cn("h-3 w-3", status === 'success' && 'text-success-foreground')} />
              {currentStatus.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-auto">
        {/* Compilation Result */}
        {compilationResult && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Compilation</h4>
            <pre
              className={cn(
                "p-3 rounded-lg text-sm font-mono overflow-x-auto",
                status === 'compilation_error' ? "bg-destructive/10 text-destructive" : "bg-muted"
              )}
            >
              {compilationResult}
            </pre>
          </div>
        )}

        {/* Runtime Output */}
        {output && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Output</h4>
            <pre
              className={cn(
                "p-3 rounded-lg text-sm font-mono overflow-x-auto bg-muted",
                status === 'runtime_error' && "bg-destructive/10 text-destructive"
              )}
            >
              {output}
            </pre>
          </div>
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Run your code to see the output here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

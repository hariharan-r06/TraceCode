import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bot, AlertTriangle, Lightbulb, BookOpen, Wrench, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugAssistantProps {
  isLoading: boolean;
  errorType: 'syntax' | 'runtime' | 'logical' | 'none' | null;
  hints: string[];
  rootCause: string | null;
  conceptReferences: { title: string; url: string }[];
  minimalPatch: string | null;
  onRequestHint: () => void;
  hasError: boolean;
}

const errorTypeConfig = {
  syntax: { label: 'Syntax Error', color: 'bg-destructive text-destructive-foreground' },
  runtime: { label: 'Runtime Error', color: 'bg-warning text-warning-foreground' },
  logical: { label: 'Logical Error', color: 'bg-accent text-accent-foreground' },
  none: { label: 'No Errors', color: 'bg-success text-success-foreground' },
};

export const DebugAssistant = ({
  isLoading,
  errorType,
  hints,
  rootCause,
  conceptReferences,
  minimalPatch,
  onRequestHint,
  hasError,
}: DebugAssistantProps) => {
  const hasData = errorType !== null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Debug Assistant
          </CardTitle>
          {hasError && (
            <Button size="sm" onClick={onRequestHint} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Get Hints
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-3 text-primary" />
            <p className="text-sm">Analyzing your code...</p>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center">
              {hasError
                ? "Click 'Get Hints' to receive AI-powered debugging assistance"
                : "Run your code to get started"}
            </p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={['error', 'hints']} className="space-y-2">
            {/* Error Classification */}
            {errorType && errorType !== 'none' && (
              <AccordionItem value="error" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>Error Classification</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Badge className={cn("mb-3", errorTypeConfig[errorType].color)}>
                    {errorTypeConfig[errorType].label}
                  </Badge>
                  {rootCause && (
                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-1">Root Cause</h5>
                      <p className="text-sm text-muted-foreground">{rootCause}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <AccordionItem value="hints" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    <span>Step-by-Step Hints</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {hints.map((hint, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {hint}
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Concept References */}
            {conceptReferences.length > 0 && (
              <AccordionItem value="concepts" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Learning Resources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {conceptReferences.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref.url}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {ref.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Minimal Patch */}
            {minimalPatch && (
              <AccordionItem value="patch" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-accent" />
                    <span>Suggested Fix Direction</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg font-mono">
                    {minimalPatch}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Note: This is a hint, not the complete solution. Try to understand and implement it yourself!
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

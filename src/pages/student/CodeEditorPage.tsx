import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CodeEditor, Language, getDefaultCode } from '@/components/code-editor/CodeEditor';
import { OutputPanel } from '@/components/code-editor/OutputPanel';
import { DebugAssistant } from '@/components/debug-assistant/DebugAssistant';
import { useRunCode, useGetHint } from '@/hooks/useApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Bot } from 'lucide-react';

const CodeEditorPage = () => {
  const [code, setCode] = useState(getDefaultCode('python'));
  const [language, setLanguage] = useState<Language>('python');
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'output' | 'debug'>('output');

  const runCode = useRunCode();
  const getHint = useGetHint();

  const handleRun = async () => {
    await runCode.execute({ code, language, input });
    // Auto-switch to output tab when running
    setActiveTab('output');
  };

  const handleReset = () => {
    setCode(getDefaultCode(language));
    setInput('');
  };

  const handleRequestHint = async () => {
    await getHint.execute({
      code,
      language,
      error: runCode.data?.compilationResult,
    });
    setActiveTab('debug');
  };

  const hasError = runCode.data?.status === 'compilation_error' || 
                   runCode.data?.status === 'runtime_error';

  return (
    <PageLayout fullWidth>
      <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 p-4">
        {/* Code Editor Section */}
        <div className="flex-1 min-h-0 lg:min-w-0">
          <CodeEditor
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            input={input}
            onInputChange={setInput}
            onRun={handleRun}
            onReset={handleReset}
            isRunning={runCode.isLoading}
          />
        </div>

        {/* Output & Debug Section */}
        <div className="w-full lg:w-96 xl:w-[450px] min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'output' | 'debug')} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="output" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Output
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Debug Assistant
              </TabsTrigger>
            </TabsList>
            <TabsContent value="output" className="flex-1 mt-0">
              <OutputPanel
                compilationResult={runCode.data?.compilationResult || null}
                output={runCode.data?.output || null}
                status={runCode.data?.status || 'idle'}
                executionTime={runCode.data?.executionTime || null}
              />
            </TabsContent>
            <TabsContent value="debug" className="flex-1 mt-0">
              <DebugAssistant
                isLoading={getHint.isLoading}
                errorType={getHint.data?.errorType || null}
                hints={getHint.data?.hints || []}
                rootCause={getHint.data?.rootCause || null}
                conceptReferences={getHint.data?.conceptReferences || []}
                minimalPatch={getHint.data?.minimalPatch || null}
                onRequestHint={handleRequestHint}
                hasError={hasError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default CodeEditorPage;

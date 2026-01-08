import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, RotateCcw, Loader2 } from 'lucide-react';

export type Language = 'python' | 'c' | 'cpp' | 'java';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  input: string;
  onInputChange: (input: string) => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const languageConfig: Record<Language, { label: string; monacoLang: string; defaultCode: string }> = {
  python: {
    label: 'Python',
    monacoLang: 'python',
    defaultCode: '# Write your Python code here\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n',
  },
  c: {
    label: 'C',
    monacoLang: 'c',
    defaultCode: '// Write your C code here\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
  },
  cpp: {
    label: 'C++',
    monacoLang: 'cpp',
    defaultCode: '// Write your C++ code here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  },
  java: {
    label: 'Java',
    monacoLang: 'java',
    defaultCode: '// Write your Java code here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  },
};

export const CodeEditor = ({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  input,
  onInputChange,
  onRun,
  onReset,
  isRunning,
}: CodeEditorProps) => {
  const handleLanguageChange = (newLang: Language) => {
    onLanguageChange(newLang);
    onCodeChange(languageConfig[newLang].defaultCode);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languageConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={isRunning}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning} className="gradient-primary text-primary-foreground">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={languageConfig[language].monacoLang}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Input Area */}
      <div className="border-t p-3 bg-muted/30">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Program Input (stdin)
        </label>
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter input for your program here..."
          className="font-mono text-sm resize-none h-20"
        />
      </div>
    </div>
  );
};

export const getDefaultCode = (language: Language): string => {
  return languageConfig[language].defaultCode;
};

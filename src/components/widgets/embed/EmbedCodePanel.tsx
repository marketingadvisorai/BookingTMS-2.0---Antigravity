import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getAllEmbedCodes } from './embedCodeGenerator';

interface EmbedCodePanelProps {
  selectedTemplateId: string;
  selectedTemplateName: string;
  primaryColor: string;
}

export function EmbedCodePanel({
  selectedTemplateId,
  selectedTemplateName,
  primaryColor,
}: EmbedCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const embedCodes = getAllEmbedCodes({
    templateId: selectedTemplateId,
    templateName: selectedTemplateName,
    primaryColor,
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm lg:col-span-2">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg">Embed Code</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">
              Copy and paste this code into your website
            </p>
          </div>
          <Button
            onClick={() => handleCopyCode(embedCodes.html)}
            className="flex-shrink-0 h-9 sm:h-10 text-xs sm:text-sm bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <Tabs defaultValue="html">
          <TabsList className="w-full grid grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="html" className="text-xs sm:text-sm">
              HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="text-xs sm:text-sm">
              React
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="text-xs sm:text-sm">
              WordPress
            </TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="mt-3 sm:mt-4">
            <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
              <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                <code>{embedCodes.html}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="react" className="mt-3 sm:mt-4">
            <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
              <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                <code>{embedCodes.react}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="wordpress" className="mt-3 sm:mt-4">
            <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
              <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                <code>{embedCodes.wordpress}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

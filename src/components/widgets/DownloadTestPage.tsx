import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DownloadTestPageProps {
  embedUrl: string;
  widgetName: string;
  widgetId: string;
  iframeCode: string;
  scriptCode: string;
}

export function DownloadTestPage({ 
  embedUrl, 
  widgetName, 
  widgetId,
  iframeCode,
  scriptCode 
}: DownloadTestPageProps) {
  
  const generateHTMLTestPage = (type: 'iframe' | 'script') => {
    const code = type === 'iframe' ? iframeCode : scriptCode;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${widgetName} - Test Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f3f4f6;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: #6b7280;
            font-size: 14px;
        }
        
        .widget-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .header, .widget-container {
                padding: 15px;
            }
            
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${widgetName} Test Page</h1>
            <p class="subtitle">
                This is a test page for the BookingTMS ${widgetName}. 
                Open this file in any web browser to test the widget locally.
            </p>
        </div>
        
        <div class="widget-container">
            ${code}
        </div>
        
        <div class="footer">
            <p>
                Powered by <a href="https://bookingtms.com" target="_blank">BookingTMS</a> | 
                <a href="${embedUrl}" target="_blank">View Widget URL</a>
            </p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleDownload = (type: 'iframe' | 'script') => {
    const htmlContent = generateHTMLTestPage(type);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${widgetId}-test-${type}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Test page downloaded! Open the HTML file in your browser.`);
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Download Test Page</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Download a ready-to-use HTML test page to test the widget locally on your computer before deploying to your website.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleDownload('iframe')}
            className="w-full h-10 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download iFrame Test
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload('script')}
            className="w-full h-10 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Script Test
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white mb-1">How to use:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Download the test HTML file</li>
            <li>Open the file in your web browser</li>
            <li>Test all functionality before deploying</li>
            <li>Make sure everything works as expected</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

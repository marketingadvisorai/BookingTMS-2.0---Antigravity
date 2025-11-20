import { useTheme } from '../layout/ThemeContext';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  FileText, 
  Download, 
  Mail, 
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Building2,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface WaiverPreviewProps {
  template: any;
  waiver: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function WaiverPreview({ template, waiver, isOpen, onClose }: WaiverPreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const handleDownload = () => {
    try {
      if (!waiver) {
        toast.info('No waiver record to download');
        return;
      }
      const doc = new jsPDF();
      const marginX = 15;
      let y = 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text('Waiver Record', marginX, y);

      y += 10;
      doc.setFontSize(11);
      const infoLines = [
        `Waiver ID: ${waiver.id}`,
        `Template: ${waiver.templateName}`,
        `Customer: ${waiver.customer}`,
        `Email: ${waiver.email}`,
        `Game: ${waiver.game}`,
        `Status: ${waiver.status}`,
        `Signed Date: ${waiver.signedDate}`,
      ];
      infoLines.forEach((line) => {
        doc.text(line, marginX, y);
        y += 8;
      });

      y += 4;
      doc.setFontSize(12);
      doc.text('Waiver Content', marginX, y);
      y += 6;

      doc.setFontSize(11);
      const content = template?.content || waiver?.content || '(No content provided)';
      const wrapped = doc.splitTextToSize(content, 180);
      wrapped.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, marginX, y);
        y += 7;
      });

      doc.save(`${waiver.id}.pdf`);
      toast.success('Downloaded waiver PDF');
    } catch (err) {
      console.error('Failed to download waiver', err);
      toast.error('Failed to download waiver');
    }
  };

  const handleSendEmail = () => {
    toast.success('Sending waiver via email...');
  };

  // Use either waiver data or template data
  const displayData = waiver || template;
  const isWaiverRecord = !!waiver;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogDescription className="sr-only">
            {isWaiverRecord ? 'View and manage signed waiver record with participant information and digital signature.' : 'Preview waiver template content, terms, and required fields.'}
          </DialogDescription>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className={textClass}>
                {isWaiverRecord ? 'Waiver Record' : 'Template Preview'}
              </DialogTitle>
              {displayData && (
                <p className={`text-sm mt-1 ${textMutedClass}`}>
                  {isWaiverRecord ? displayData.templateName : displayData.name}
                </p>
              )}
            </div>
            {isWaiverRecord && (
              <Badge 
                className={
                  waiver.status === 'signed'
                    ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0')
                    : (isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0')
                }
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {waiver.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information (if waiver record) */}
          {isWaiverRecord && waiver && (
            <>
              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <h3 className={`text-sm mb-3 ${textClass}`}>Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <User className="w-4 h-4" />
                    <div>
                      <p className={`text-xs ${textMutedClass}`}>Customer</p>
                      <p className={textClass}>{waiver.customer}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Mail className="w-4 h-4" />
                    <div>
                      <p className={`text-xs ${textMutedClass}`}>Email</p>
                      <p className={textClass}>{waiver.email}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Building2 className="w-4 h-4" />
                    <div>
                      <p className={`text-xs ${textMutedClass}`}>Game</p>
                      <p className={textClass}>{waiver.game}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className={`text-xs ${textMutedClass}`}>Signed Date</p>
                      <p className={textClass}>{waiver.signedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className={borderClass} />
            </>
          )}

          {/* Template Information */}
          {!isWaiverRecord && template && (
            <>
              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <h3 className={`text-sm mb-3 ${textClass}`}>Template Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Type</p>
                    <p className={`text-sm ${textClass}`}>{template.type}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Status</p>
                    <Badge 
                      className={
                        template.status === 'active'
                          ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0')
                          : (isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] border-0' : 'bg-gray-100 text-gray-700 border-0')
                      }
                    >
                      {template.status}
                    </Badge>
                  </div>
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Created</p>
                    <p className={`text-sm ${textClass}`}>{template.createdDate}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Last Modified</p>
                    <p className={`text-sm ${textClass}`}>{template.lastModified}</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <h3 className={`text-sm mb-3 ${textClass}`}>Required Fields ({template.requiredFields?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {template.requiredFields?.map((field: string) => (
                    <Badge 
                      key={field}
                      variant="secondary"
                      className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] border-0' : ''}
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className={borderClass} />
            </>
          )}

          {/* Waiver Content */}
          <div className={`p-6 rounded-lg border ${borderClass} ${cardBgClass}`}>
            <h3 className={`text-sm mb-4 ${textClass}`}>Waiver Content</h3>
            <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
              {displayData?.content ? (
                <div className={`whitespace-pre-wrap text-sm ${textClass}`}>
                  {displayData.content}
                </div>
              ) : (
                <div className={`p-8 text-center ${bgElevatedClass} rounded-lg`}>
                  <FileText className={`w-12 h-12 mx-auto mb-2 ${textMutedClass}`} />
                  <p className={textMutedClass}>No content available</p>
                  <p className={`text-xs mt-1 ${textMutedClass}`}>
                    {isWaiverRecord ? 'This waiver has no content' : 'Edit this template to add content'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Signature Section (if waiver record and signed) */}
          {isWaiverRecord && waiver?.status === 'signed' && (
            <>
              <Separator className={borderClass} />
              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <h3 className={`text-sm mb-3 ${textClass}`}>Signature</h3>
                <div className={`p-4 rounded border ${borderClass} ${cardBgClass}`}>
                  <p className={`italic ${textMutedClass}`}>
                    Signed electronically by {waiver.customer} on {waiver.signedDate}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full sm:w-auto">
            {isWaiverRecord && (
              <>
                <Button variant="outline" onClick={handleSendEmail} className="h-11">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={handleDownload} className="h-11">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </>
            )}
            <Button 
              variant={isWaiverRecord ? "default" : "outline"}
              onClick={onClose}
              style={{ backgroundColor: isDark && !isWaiverRecord ? undefined : isDark ? '#4f46e5' : undefined }}
              className={`h-11 ${isDark && !isWaiverRecord ? '' : isDark ? 'text-white hover:bg-[#4338ca]' : !isWaiverRecord ? '' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

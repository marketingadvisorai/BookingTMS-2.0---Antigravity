import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  QrCode,
  Scan,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  Upload,
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface ScanWaiverDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScanWaiverDialog({ isOpen, onClose }: ScanWaiverDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const [scanMode, setScanMode] = useState<'qr' | 'camera' | 'upload' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const WAIVERS_STORAGE_KEY = 'admin_waivers';

  // ZXing camera scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);

  const handleDecodedText = (text: string) => {
    const codeMatch = text.match(/WV-\d+/);
    if (codeMatch) {
      const code = codeMatch[0];
      try {
        const raw = localStorage.getItem(WAIVERS_STORAGE_KEY);
        const waivers = raw ? JSON.parse(raw) : [];
        const rec = waivers.find((w: any) => w.id === code);
        if (rec) {
          setScanResult({ ...rec, status: 'verified', date: new Date().toLocaleDateString() });
          toast.success('Waiver verified successfully!');
        } else {
          toast.error('Waiver not found');
        }
      } catch (err) {
        console.error('Failed to verify waiver code', err);
        toast.error('Verification error');
      }
    } else if (/^https?:\/\//.test(text)) {
      // Open URLs (e.g., waiver form links)
      window.open(text, '_blank');
      toast.success('Opened link from QR');
    } else {
      toast.info(`Scanned: ${text}`);
    }
    setIsScanning(false);
    try {
      scannerControlsRef.current?.stop();
      // codeReaderRef.current?.reset();
    } catch { }
  };

  const startCameraScan = async () => {
    try {
      setIsScanning(true);
      if (!codeReaderRef.current) codeReaderRef.current = new BrowserMultiFormatReader();
      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, err) => {
          if (result) {
            handleDecodedText(result.getText());
          }
        }
      );
      scannerControlsRef.current = controls;
    } catch (err) {
      console.error('Failed to start camera scanning', err);
      toast.error('Camera access failed');
      setIsScanning(false);
    }
  };

  const stopCameraScan = () => {
    try {
      scannerControlsRef.current?.stop();
      // codeReaderRef.current?.reset();
    } catch { }
    setIsScanning(false);
  };

  // Upload scanning
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIsScanning(true);
    try {
      if (!codeReaderRef.current) codeReaderRef.current = new BrowserMultiFormatReader();
      const result = await codeReaderRef.current.decodeFromImageUrl(url);
      handleDecodedText(result.getText());
    } catch (err) {
      console.error('No QR found in image', err);
      toast.error('No QR code found in image');
      setIsScanning(false);
    } finally {
      URL.revokeObjectURL(url);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Templates for QR mode
  type WaiverTemplate = {
    id: string;
    name: string;
    status?: 'active' | 'inactive' | 'draft';
  };
  const WAIVER_TEMPLATES_STORAGE_KEY = 'admin_waiver_templates';
  const [templates, setTemplates] = useState<WaiverTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(WAIVER_TEMPLATES_STORAGE_KEY);
      const list: WaiverTemplate[] = raw ? JSON.parse(raw) : [];
      setTemplates(list);
      setSelectedTemplateId(list[0]?.id || '');
    } catch (err) {
      console.error('Failed to load templates for QR mode', err);
      setTemplates([]);
      setSelectedTemplateId('');
    }
  }, [isOpen]);

  const buildFormUrl = (id?: string) => {
    if (!id) return '';
    return `${window.location.origin}/waiver-form/${id}`;
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const qrUrl = buildFormUrl(selectedTemplate?.id);

  const handleCopyQrLink = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success('Copied waiver form link');
    } catch (err) {
      console.error('Failed to copy link', err);
      toast.error('Failed to copy link');
    }
  };

  const handleOpenQrForm = () => {
    if (!qrUrl) return;
    window.open(qrUrl, '_blank');
    toast.success('Opening waiver form...');
  };

  const handleScanCamera = () => {
    if (isScanning) {
      stopCameraScan();
    } else {
      startCameraScan();
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode) {
      toast.error('Please enter a waiver code');
      return;
    }

    setIsScanning(true);
    try {
      const raw = localStorage.getItem(WAIVERS_STORAGE_KEY);
      const waivers = raw ? JSON.parse(raw) : [];
      const rec = waivers.find((w: any) => w.id === manualCode);
      if (rec) {
        setScanResult({ ...rec, status: 'verified', date: new Date().toLocaleDateString() });
        toast.success('Waiver verified successfully!');
      } else {
        toast.error('Waiver not found');
      }
    } catch (err) {
      console.error('Verification error', err);
      toast.error('Verification error');
    }
    setIsScanning(false);
    setManualCode('');
  };

  const handleReset = () => {
    setScanResult(null);
    setManualCode('');
    setScanMode('camera');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Scan Waiver</DialogTitle>
          <DialogDescription className={textMutedClass}>
            Scan QR code or enter waiver code to verify check-in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!scanResult ? (
            <>
              {/* Scan Mode Selector */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setScanMode('qr')}
                  className={`p-4 rounded-lg border-2 transition-all ${scanMode === 'qr'
                      ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                      : (isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300')
                    }`}
                >
                  <QrCode className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'qr' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                  <p className={`text-sm ${textClass}`}>Show QR</p>
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  className={`p-4 rounded-lg border-2 transition-all ${scanMode === 'camera'
                      ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                      : (isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300')
                    }`}
                >
                  <Camera className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'camera' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                  <p className={`text-sm ${textClass}`}>Camera</p>
                </button>

                <button
                  onClick={() => setScanMode('upload')}
                  className={`p-4 rounded-lg border-2 transition-all ${scanMode === 'upload'
                      ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                      : (isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300')
                    }`}
                >
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'upload' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                  <p className={`text-sm ${textClass}`}>Upload</p>
                </button>

                <button
                  onClick={() => setScanMode('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${scanMode === 'manual'
                      ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                      : (isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300')
                    }`}
                >
                  <QrCode className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'manual' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                  <p className={`text-sm ${textClass}`}>Manual</p>
                </button>
              </div>

              <Separator className={borderClass} />

              {/* QR Mode */}
              {scanMode === 'qr' && (
                <div className="space-y-4">
                  {templates.length === 0 ? (
                    <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`} />
                        <p className={`text-sm ${textMutedClass}`}>No templates found. Create a waiver template to show a QR code.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className={textClass}>Waiver Template</Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={`rounded-lg border ${borderClass} ${bgElevatedClass} p-6 flex flex-col items-center justify-center gap-4`}>
                        {qrUrl ? (
                          <>
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-[#0f0f0f]' : 'bg-white'} border ${borderClass}`}>
                              <QRCode value={qrUrl} size={180} bgColor={isDark ? '#0f0f0f' : '#ffffff'} fgColor={isDark ? '#ffffff' : '#000000'} />
                            </div>
                            <p className={`text-sm ${textMutedClass}`}>Scan to sign: <span className={textClass}>{selectedTemplate?.name}</span></p>
                            <div className="flex gap-2">
                              <Button variant="outline" className="h-11" onClick={handleCopyQrLink}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </Button>
                              <Button className={`h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : ''}`} style={{ backgroundColor: isDark ? '#4f46e5' : undefined }} onClick={handleOpenQrForm}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Form
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className={`text-sm ${textMutedClass}`}>Select a template to generate QR code.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Camera Mode */}
              {scanMode === 'camera' && (
                <div className="space-y-4">
                  <div className={`aspect-video rounded-lg border-2 border-dashed ${borderClass} ${bgElevatedClass} flex items-center justify-center overflow-hidden`}>
                    {isScanning ? (
                      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <div className="text-center">
                        <Camera className={`w-16 h-16 mx-auto mb-4 ${textMutedClass}`} />
                        <p className={textClass}>Camera Preview</p>
                        <p className={`text-sm ${textMutedClass}`}>Click scan to activate camera</p>
                      </div>
                    )}
                  </div>

                  <Button
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    className={`w-full h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={handleScanCamera}
                    disabled={isScanning}
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                  </Button>
                </div>
              )}

              {/* Upload Mode */}
              {scanMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    className={`aspect-video rounded-lg border-2 border-dashed ${borderClass} ${bgElevatedClass} flex items-center justify-center cursor-pointer hover:border-current transition-colors`}
                    onClick={handleUploadClick}
                  >
                    <div className="text-center">
                      <Upload className={`w-16 h-16 mx-auto mb-4 ${textMutedClass}`} />
                      <p className={textClass}>Drop QR code image here</p>
                      <p className={`text-sm ${textMutedClass}`}>or click to browse</p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFile} />
                </div>
              )}

              {/* Manual Mode */}
              {scanMode === 'manual' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="waiver-code" className={textClass}>Waiver Code</Label>
                    <Input
                      id="waiver-code"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="WV-1001"
                      className="h-11 font-mono"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    />
                  </div>

                  <Button
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    className={`w-full h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={handleManualSubmit}
                    disabled={isScanning || !manualCode}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isScanning ? 'Verifying...' : 'Verify Waiver'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Scan Result */
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg ${isDark ? 'text-emerald-300' : 'text-green-900'}`}>Waiver Verified</h3>
                    <p className={`text-sm ${isDark ? 'text-emerald-400/70' : 'text-green-700'}`}>Customer checked in successfully</p>
                  </div>
                </div>

                <Separator className={isDark ? 'bg-emerald-500/20' : 'bg-green-200'} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <User className="w-4 h-4" />
                      <p className="text-xs">Customer</p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.customer}</p>
                  </div>

                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <QrCode className="w-4 h-4" />
                      <p className="text-xs">Waiver ID</p>
                    </div>
                    <p className={`text-sm font-mono ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.id}</p>
                  </div>

                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <Mail className="w-4 h-4" />
                      <p className="text-xs">Email</p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.email}</p>
                  </div>

                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <Phone className="w-4 h-4" />
                      <p className="text-xs">Phone</p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.phone}</p>
                  </div>

                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <Calendar className="w-4 h-4" />
                      <p className="text-xs">Booking</p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.booking}</p>
                  </div>

                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${textMutedClass}`}>
                      <Calendar className="w-4 h-4" />
                      <p className="text-xs">Game</p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-emerald-200' : 'text-green-900'}`}>{scanResult.game}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full h-11"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Another Waiver
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant={scanResult ? "default" : "outline"}
            onClick={scanResult ? handleReset : onClose}
            style={{ backgroundColor: isDark && scanResult ? '#4f46e5' : undefined }}
            className={`h-11 ${isDark && scanResult ? 'text-white hover:bg-[#4338ca]' : scanResult ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            {scanResult ? 'Done' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

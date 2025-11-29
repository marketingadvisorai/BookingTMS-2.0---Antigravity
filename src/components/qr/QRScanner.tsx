/**
 * QRScanner Component
 * 
 * Camera-based QR code scanner for check-in operations.
 * Uses html5-qrcode library for cross-browser support.
 * @module components/qr/QRScanner
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { validateQRCode } from '../../lib/qr';
import type { QRScanResult } from '../../lib/qr';

export interface QRScannerProps {
  /** Callback when QR code is successfully scanned */
  onScan: (result: QRScanResult) => void;
  /** Callback on scan error */
  onError?: (error: string) => void;
  /** Width of scanner (default 300) */
  width?: number;
  /** Height of scanner (default 300) */
  height?: number;
  /** Enable sound on scan */
  enableSound?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * QR code scanner using device camera
 */
export function QRScanner({
  onScan,
  onError,
  width = 300,
  height = 300,
  enableSound = true,
  className = '',
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for scan feedback
  useEffect(() => {
    if (enableSound) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 
        'tvT19' + 'A'.repeat(100)); // Placeholder beep
    }
    return () => {
      audioRef.current = null;
    };
  }, [enableSound]);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Validate the QR code
    const result = await validateQRCode(decodedText);
    
    if (result.valid) {
      setLastResult('success');
      if (enableSound && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      onScan(result);
    } else {
      setLastResult('error');
      onError?.(result.error || 'Invalid QR code');
    }

    // Reset visual feedback after delay
    setTimeout(() => setLastResult(null), 2000);
  }, [onScan, onError, enableSound]);

  const handleScanError = useCallback((errorMessage: string) => {
    // Ignore common non-critical errors
    if (errorMessage.includes('NotFoundException')) return;
    console.warn('QR scan error:', errorMessage);
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      // Initialize scanner
      scannerRef.current = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: Math.min(width - 50, 250), height: Math.min(height - 50, 250) },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        false
      );

      scannerRef.current.render(handleScanSuccess, handleScanError);
      setIsScanning(true);
    } catch (err) {
      setHasPermission(false);
      onError?.('Camera permission denied');
    }
  }, [width, height, handleScanSuccess, handleScanError, onError]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.warn);
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Scanner Container */}
      <div
        ref={containerRef}
        className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
          lastResult === 'success' ? 'border-green-500' : 
          lastResult === 'error' ? 'border-red-500' : 
          'border-gray-200 dark:border-gray-700'
        }`}
        style={{ width, height }}
      >
        {isScanning ? (
          <div id="qr-scanner-container" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
            {hasPermission === false ? (
              <>
                <CameraOff className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Camera access denied</p>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to start scanning</p>
              </>
            )}
          </div>
        )}

        {/* Status Overlay */}
        {lastResult && (
          <div className={`absolute inset-0 flex items-center justify-center bg-opacity-80 ${
            lastResult === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {lastResult === 'success' ? (
              <CheckCircle2 className="w-16 h-16 text-white" />
            ) : (
              <XCircle className="w-16 h-16 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanner} disabled={hasPermission === false}>
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanner}>
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Scanner
          </Button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Position the QR code within the scanner frame. The code will be automatically detected.
      </p>
    </div>
  );
}

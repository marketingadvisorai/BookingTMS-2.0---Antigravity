/**
 * useBookingReceipt Hook
 * Hook for generating and downloading booking receipts
 */

import { useCallback } from 'react';
import { receiptGeneratorService } from '../services/receiptGenerator.service';
import type { ReceiptData, ReceiptConfig } from '../types';

interface UseBookingReceiptReturn {
  downloadReceipt: (data: ReceiptData, config?: Partial<ReceiptConfig>) => void;
  viewReceipt: (data: ReceiptData, config?: Partial<ReceiptConfig>) => void;
  generateHtml: (data: ReceiptData, config?: Partial<ReceiptConfig>) => string;
}

export function useBookingReceipt(): UseBookingReceiptReturn {
  const downloadReceipt = useCallback(
    (data: ReceiptData, config?: Partial<ReceiptConfig>) => {
      receiptGeneratorService.downloadReceipt(data, config);
    },
    []
  );

  const viewReceipt = useCallback(
    (data: ReceiptData, config?: Partial<ReceiptConfig>) => {
      receiptGeneratorService.viewReceipt(data, config);
    },
    []
  );

  const generateHtml = useCallback(
    (data: ReceiptData, config?: Partial<ReceiptConfig>) => {
      return receiptGeneratorService.generateHtmlReceipt(data, config);
    },
    []
  );

  return { downloadReceipt, viewReceipt, generateHtml };
}

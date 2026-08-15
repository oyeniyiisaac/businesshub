// BarcodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, onClose }: BarcodeScannerProps) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');
  const [fileError, setFileError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configure hints to strictly target 1D barcodes + QR codes
  const hints = new Map();
  const formats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A,
    BarcodeFormat.EAN_8,
    BarcodeFormat.QR_CODE,
  ];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true); // Improves detection on images & low light

  const codeReader = useRef(new BrowserMultiFormatReader(hints));

  // 1. Camera Scanning Logic
  useEffect(() => {
    if (scanMode !== 'camera') return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const deviceId: string | null = null;

    codeReader.current
      .decodeFromVideoDevice(deviceId, videoElement, (result: any, error: any) => {
        if (result) {
          onScanSuccess(result.getText());
          codeReader.current.reset();
        }

        if (error) {
          console.error('Camera error:', error);
        }
      })
      .catch((err: unknown) => console.error('Camera error:', err));

    return () => {
      codeReader.current.reset();
    };
  }, [scanMode, onScanSuccess]);

  // 2. File Upload Logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const imageUrl = URL.createObjectURL(file);

    try {
      const result = await codeReader.current.decodeFromImageUrl(imageUrl);
      onScanSuccess(result.getText());
    } catch (err) {
      setFileError("Could not read barcode. Try lighting the area better or aligning horizontally.");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan Product Barcode</h3>
          <button
            type="button"
            onClick={() => {
              codeReader.current.reset();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 ${
              scanMode === 'camera' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setScanMode('camera')}
          >
            Use Camera
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 ${
              scanMode === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
            onClick={() => setScanMode('file')}
          >
            Upload File
          </button>
        </div>

        {/* Live Video Element */}
        {scanMode === 'camera' && (
          <div className="relative w-full overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 border-2 border-red-500/50 pointer-events-none flex items-center justify-center">
              <div className="w-3/4 h-24 border-2 border-dashed border-red-500 rounded"></div>
            </div>
          </div>
        )}

        {/* File Upload Mode */}
        {scanMode === 'file' && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-600 text-center">
              Select an image of a 1D Barcode (EAN-13, Code 128) or QR Code.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Choose Image File
            </button>
            {fileError && <p className="text-xs text-red-500 text-center mt-2">{fileError}</p>}
          </div>
        )}

      </div>
    </div>
  );
};
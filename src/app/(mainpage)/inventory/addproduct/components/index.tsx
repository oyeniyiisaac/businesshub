import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  inline?: boolean;
}

export const BarcodeScanner = ({ onScanSuccess, onClose, inline = false }: BarcodeScannerProps) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');
  const [fileError, setFileError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hasZoomSupport, setHasZoomSupport] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const codeReader = useMemo(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_128,
      BarcodeFormat.UPC_A,
      BarcodeFormat.EAN_8,
      BarcodeFormat.QR_CODE,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);
    return new BrowserMultiFormatReader(hints);
  }, []);

  const onScanSuccessRef = useRef(onScanSuccess);
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  // Inspect Torch and Zoom capabilities
  const checkCapabilities = (stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    if (typeof track.getCapabilities === 'function') {
      const caps = track.getCapabilities() as any;
      if (caps && (caps.torch || 'torch' in caps)) setHasTorch(true);
      if (caps && caps.zoom) setHasZoomSupport(true);
    }
  };

  // 1. ZXing Continuous Camera Decoder with Live getUserMedia Stream
  useEffect(() => {
    if (scanMode !== 'camera') return;

    let isSubscribed = true;

    const startDecoder = async () => {
      // Allow DOM ref binding to settle if mounting synchronously
      await new Promise((r) => setTimeout(r, 60));
      if (!isSubscribed) return;

      if (!videoRef.current) {
        // Retry once if ref wasn't immediately attached
        await new Promise((r) => setTimeout(r, 120));
      }

      if (!videoRef.current || !isSubscribed) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        checkCapabilities(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        let hasScanned = false;

        codeReader.decodeFromStream(stream, videoRef.current || undefined, (result, err) => {
          if (result && isSubscribed && !hasScanned) {
            const text = result.getText();
            if (text) {
              hasScanned = true;
              onScanSuccessRef.current(text);
            }
          }
        });
      } catch (err) {
        console.error('Camera stream access failed:', err);
      }
    };

    startDecoder();

    return () => {
      isSubscribed = false;
      try {
        codeReader.reset();
      } catch {
        // ignore
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [scanMode, codeReader]);

  // Apply Zoom
  const applyZoom = async (newZoom: number) => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ zoom: newZoom } as any],
      });
      setZoomLevel(newZoom);
    } catch (err) {
      console.error('Zoom constraint error:', err);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error('Torch error:', err);
    }
  };

  // 2. File Upload Logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const imageUrl = URL.createObjectURL(file);

    try {
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      onScanSuccessRef.current(result.getText());
    } catch (err) {
      setFileError('Could not read barcode. Ensure proper lighting and align horizontally.');
    } finally {
      URL.revokeObjectURL(imageUrl);
      if (event.target) event.target.value = '';
    }
  };

  const handleClose = () => {
    try {
      codeReader.reset();
    } catch {
      // ignore
    }
    onClose();
  };

  if (inline) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black flex items-center justify-center border-2 border-emerald-500/80 shadow-inner">
        {scanMode === 'camera' ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3">
              <div className="w-11/12 h-24 border-2 border-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500/80 animate-pulse"></div>
              </div>
              <p className="text-white/90 text-[11px] mt-2 bg-black/70 px-2.5 py-1 rounded-full font-medium">
                Position barcode inside viewfinder
              </p>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className="bg-black/70 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold hover:bg-black/90 transition shadow-md cursor-pointer"
                >
                  {torchOn ? '🔦 Flash Off' : '🔦 Flash On'}
                </button>
              )}

              {hasZoomSupport && (
                <button
                  type="button"
                  onClick={() => applyZoom(zoomLevel === 1 ? 2 : 1)}
                  className="bg-black/70 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold hover:bg-black/90 transition shadow-md cursor-pointer"
                >
                  {zoomLevel === 1 ? '🔍 2x Zoom' : '🔍 1x Zoom'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 space-y-2 w-full h-full text-white">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-300 text-center">
              Select image containing barcode
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition"
            >
              Choose Image File
            </button>
            {fileError && (
              <p className="text-[10px] text-red-400 text-center">{fileError}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan Product Barcode</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 font-bold px-2 py-1 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 ${
              scanMode === 'camera'
                ? 'border-emerald-600 text-emerald-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setScanMode('camera')}
          >
            Use Camera
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 ${
              scanMode === 'file'
                ? 'border-emerald-600 text-emerald-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setScanMode('file')}
          >
            Upload File
          </button>
        </div>

        {/* Camera Viewport */}
        {scanMode === 'camera' && (
          <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />
            {/* Offscreen canvas used for frame analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              <div className="w-11/12 h-28 border-2 border-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500/80 animate-pulse"></div>
              </div>
              <p className="text-white/90 text-xs mt-3 bg-black/70 px-3 py-1.5 rounded-full font-medium">
                Hold phone 20–25cm away & align barcode horizontally
              </p>
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-black/90 transition shadow-md"
                >
                  {torchOn ? '🔦 Flash Off' : '🔦 Flash On'}
                </button>
              )}

              {hasZoomSupport && (
                <button
                  type="button"
                  onClick={() => applyZoom(zoomLevel === 1 ? 2 : 1)}
                  className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-black/90 transition shadow-md"
                >
                  {zoomLevel === 1 ? '🔍 2x Zoom' : '🔍 1x Zoom'}
                </button>
              )}
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
              Select an image containing an EAN-13, Code 128, or QR Code.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              Choose Image File
            </button>
            {fileError && (
              <p className="text-xs text-red-500 text-center mt-2">{fileError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
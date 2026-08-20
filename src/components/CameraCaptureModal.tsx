"use client";

import React, { useState, useEffect, useRef } from "react";
import { PhotoCamera, Close, FlipCameraIos } from "google-material-icons/outlined";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setError(null);
      return;
    }

    let activeStream: MediaStream | null = null;

    async function startCamera() {
      setError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        // Try fallback to any available video stream without constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          activeStream = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
        } catch (fallbackErr: any) {
          setError(
            "Camera permission denied or camera not found. Please allow camera access in your browser settings."
          );
        }
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        const dataUrl = canvas.toDataURL("image/jpeg");

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }

        onCapture(file, dataUrl);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-2">
            <PhotoCamera className="w-5 h-5 text-primary" />
            <h3 className="text-body-md font-bold text-on-surface">Take Photo with Camera</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        {/* Video Stream Container */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-rose-400 text-body-xs leading-relaxed space-y-2">
              <p className="font-semibold text-rose-500">Camera Unavailable</p>
              <p>{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between p-4 bg-surface-container-low border-t border-outline-variant/60">
          <button
            type="button"
            onClick={toggleFacingMode}
            disabled={!!error}
            className="p-2.5 rounded-full border border-outline-variant hover:bg-surface-container text-on-surface transition-colors cursor-pointer disabled:opacity-40"
            title="Switch Camera"
          >
            <FlipCameraIos className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!error || !stream}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-body-sm font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhotoCamera className="w-5 h-5" />
            <span>Capture Photo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-DEFAULT text-body-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

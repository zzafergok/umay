'use client';

import * as React from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { toast } from '@/components/core/toast';

interface BarcodeDetectorResult {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

/** Manages camera barcode/QR scanning with native BarcodeDetector and @zxing fallback. */
export function useScanCamera(onDetected: (code: string) => void) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = React.useState(false);

  React.useEffect(() => {
    if (!scanning || !videoRef.current) return;
    let active = true;
    let stream: MediaStream | null = null;
    let controls: { stop: () => void } | null = null;

    const startScan = async () => {
      try {
        const detectorCtor = Reflect.get(globalThis, 'BarcodeDetector');
        if (typeof detectorCtor === 'function' && videoRef.current) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          const detector = Reflect.construct(detectorCtor, [
            { formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a'] },
          ]) as BarcodeDetectorLike;

          const tick = async () => {
            if (!active || !videoRef.current) return;
            try {
              const found = await detector.detect(videoRef.current);
              const val = found[0]?.rawValue;
              if (val) {
                onDetected(val);
                setScanning(false);
                toast.success(`Okundu: ${val}`);
                return;
              }
            } catch {
              // ignore frame errors
            }
            if (active) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        } else if (videoRef.current) {
          const reader = new BrowserMultiFormatReader();
          controls = await reader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result) => {
              if (result && active) {
                const text = result.getText();
                onDetected(text);
                setScanning(false);
                toast.success(`Okundu: ${text}`);
              }
            },
          );
        }
      } catch {
        toast.error('Kamera açılamadı. Manuel barkod girebilirsin.');
        setScanning(false);
      }
    };

    startScan();

    return () => {
      active = false;
      controls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, onDetected]);

  return { videoRef, scanning, setScanning };
}

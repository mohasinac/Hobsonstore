"use client";

import { useRef, useState, useCallback } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  productSlug: string;
  onCapture: (url: string, type: "image" | "video") => void;
  mode?: "image" | "video";
}

export function CameraCapture({ productSlug, onCapture, mode = "image" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [open, setOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: mode === "video",
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("Camera permission denied or unavailable.");
    }
  }, [mode]);

  function stopStream() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  }

  function captureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setPreviewBlob(blob);
      setPreview(URL.createObjectURL(blob));
      stopStream();
    }, "image/jpeg", 0.92);
  }

  function startRecording() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setPreviewBlob(blob);
      setPreview(URL.createObjectURL(blob));
      stopStream();
      setRecording(false);
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function uploadPreview() {
    if (!previewBlob) return;
    setUploading(true);
    try {
      const storage = getStorage(getFirebaseApp());
      const ext = mode === "image" ? "jpg" : "webm";
      const folder = mode === "image" ? "images" : "videos";
      const storageRef = ref(storage, `products/${productSlug}/${folder}/${Date.now()}.${ext}`);
      await uploadBytes(storageRef, previewBlob);
      const url = await getDownloadURL(storageRef);
      onCapture(url, mode);
      handleClose();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    stopStream();
    if (recording) mediaRecorderRef.current?.stop();
    setOpen(false);
    setPreview(null);
    setPreviewBlob(null);
    setError(null);
    setRecording(false);
  }

  function handleOpen() {
    // Feature detection — fall back to input if not supported
    if (!navigator.mediaDevices?.getUserMedia) return;
    setOpen(true);
    startCamera();
  }

  // If getUserMedia is unsupported (non-HTTPS env etc.), render a simple file input fallback
  const supportsCamera = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  if (!supportsCamera) {
    return (
      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm dark:hover:bg-white/10 hover:bg-gray-50" style={{ border: '2px solid var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}>
        <span>📷 {mode === "image" ? "Camera" : "Record"}</span>
        <input
          type="file"
          accept={mode === "image" ? "image/*" : "video/*"}
          capture="environment"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const storage = getStorage(getFirebaseApp());
              const storageRef = ref(storage, `products/${productSlug}/${mode === "image" ? "images" : "videos"}/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              onCapture(url, mode);
            } finally {
              setUploading(false);
            }
          }}
        />
      </label>
    );
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={handleOpen} disabled={uploading}>
        📷 {mode === "image" ? "Camera" : "Record"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl shadow-xl overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-ink)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-black)' }}>{mode === "image" ? "Take Photo" : "Record Video"}</h3>
              <button type="button" onClick={handleClose} className="text-lg leading-none dark:text-slate-400 dark:hover:text-slate-100 text-gray-400 hover:text-gray-700">×</button>
            </div>

            <div className="p-4 space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {!preview ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg bg-black aspect-video object-cover"
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {streaming && (
                    <div className="flex justify-center gap-3">
                      {mode === "image" ? (
                        <Button onClick={captureImage}>📷 Capture</Button>
                      ) : recording ? (
                        <Button variant="danger" onClick={stopRecording}>⏹ Stop</Button>
                      ) : (
                        <Button onClick={startRecording}>⏺ Record</Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {mode === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="w-full rounded-lg" />
                  ) : (
                    <video src={preview} controls className="w-full rounded-lg" />
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button onClick={uploadPreview} loading={uploading}>Use This</Button>
                    <Button variant="ghost" onClick={() => { setPreview(null); setPreviewBlob(null); startCamera(); }}>
                      Retake
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

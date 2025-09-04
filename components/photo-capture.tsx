"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Check } from "lucide-react"

interface PhotoCaptureProps {
  onPhotoSelected: (photoSrc: string) => void
  onClose: () => void
}

export default function PhotoCapture({ onPhotoSelected, onClose }: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedPhoto(photoDataUrl)
        stopCamera()
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCapturedPhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoSelected(capturedPhoto)
      onClose()
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    startCamera()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Add Photo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopCamera()
                onClose()
              }}
              className="text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isCapturing && !capturedPhoto && (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Choose how to add your photo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={startCamera}
                  className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col items-center justify-center gap-1"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs">Take Photo</span>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-12 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground flex flex-col items-center justify-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">Upload</span>
                </Button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          )}

          {isCapturing && (
            <div className="space-y-4">
              <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {capturedPhoto && (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={capturedPhoto || "/placeholder.svg"}
                  alt="Captured photo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={retakePhoto} variant="outline" className="flex-1 bg-transparent">
                  Retake
                </Button>
                <Button
                  onClick={confirmPhoto}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

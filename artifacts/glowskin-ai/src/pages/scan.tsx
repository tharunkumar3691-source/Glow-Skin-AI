import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Camera, Upload, RefreshCw, CheckCircle, X } from 'lucide-react';
import { GlowButton, GlassCard } from '@/components/ui-elements';
import { useAnalyzeSkin, AnalyzeSkinRequestSkinType } from '@workspace/api-client-react';
import { useSkinStore } from '@/store/use-skin-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const skinTypes: { value: AnalyzeSkinRequestSkinType, label: string }[] = [
  { value: 'Dry', label: 'Dry' },
  { value: 'Oily', label: 'Oily' },
  { value: 'Combination', label: 'Combination' },
  { value: 'Balanced', label: 'Balanced' },
];

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const setScanData = useSkinStore(state => state.setScanData);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedSkinType, setSelectedSkinType] = useState<AnalyzeSkinRequestSkinType | null>(null);

  const analyzeMutation = useAnalyzeSkin();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) return; // Already running
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow permissions or use file upload.",
        variant: "destructive"
      });
      setMode('upload');
    }
  }, [stream, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Handle mode switch
  const handleModeSwitch = (newMode: 'camera' | 'upload') => {
    setMode(newMode);
    if (newMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Initialize camera if mode is camera
  useState(() => {
    if (mode === 'camera') startCamera();
  });

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally for user facing camera feeling
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    if (mode === 'camera') startCamera();
  };

  const handleSubmit = () => {
    if (!capturedImage) return;

    // Remove data:image/jpeg;base64, prefix
    const base64Data = capturedImage.split(',')[1];

    analyzeMutation.mutate({
      data: {
        imageBase64: base64Data,
        skinType: selectedSkinType
      }
    }, {
      onSuccess: (data) => {
        setScanData(data, selectedSkinType, capturedImage);
        toast({
          title: "Analysis Complete",
          description: "Your skin health dashboard is ready.",
        });
        setLocation('/results');
      },
      onError: (err) => {
        toast({
          title: "Analysis Failed",
          description: err.error?.error || "Something went wrong during analysis.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Skin Analysis Scan</h1>
        <p className="text-muted-foreground text-lg">Take a clear, well-lit selfie without makeup for the most accurate results.</p>
      </div>

      <GlassCard className="w-full flex flex-col items-center p-4 sm:p-8">
        
        {/* Mode Selector */}
        {!capturedImage && (
          <div className="flex bg-secondary/50 p-1 rounded-full mb-8">
            <button 
              onClick={() => handleModeSwitch('camera')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${mode === 'camera' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Camera className="w-4 h-4" /> Camera
            </button>
            <button 
              onClick={() => handleModeSwitch('upload')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${mode === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        )}

        {/* Viewfinder / Image Preview */}
        <div className="w-full max-w-lg aspect-[3/4] sm:aspect-square relative rounded-3xl overflow-hidden bg-black/5 shadow-inner mb-8 border-4 border-white">
          <AnimatePresence mode="wait">
            {capturedImage ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                {!analyzeMutation.isPending && (
                  <button 
                    onClick={resetCapture}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ) : mode === 'camera' ? (
              <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
                {/* Targeting overlay */}
                <div className="absolute inset-0 border-[6px] border-white/20 rounded-3xl pointer-events-none m-4"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-48 h-64 border-2 border-dashed border-white rounded-full"></div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-primary">
                  <Upload className="w-10 h-10" />
                </div>
                <p className="font-medium text-lg mb-2">Upload a selfie</p>
                <p className="text-sm text-muted-foreground mb-6">JPEG or PNG, max 5MB</p>
                <GlowButton variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </GlowButton>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Scanning Animation Overlay */}
          {analyzeMutation.isPending && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium drop-shadow-md text-lg">AI is analyzing your skin...</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="w-full max-w-lg flex flex-col gap-6">
          {!capturedImage ? (
            mode === 'camera' && (
              <div className="flex justify-center">
                <button 
                  onClick={captureImage}
                  className="w-20 h-20 rounded-full bg-white border-4 border-primary/20 shadow-lg flex items-center justify-center hover:scale-105 hover:border-primary/40 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary group-hover:bg-primary/90 transition-colors flex items-center justify-center animate-pulse-ring">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </button>
              </div>
            )
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 w-full"
            >
              <div className="bg-secondary/30 rounded-2xl p-4 border border-secondary">
                <label className="block text-sm font-semibold mb-3">Skin Type (Optional, helps accuracy)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {skinTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedSkinType(selectedSkinType === type.value ? null : type.value)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                        selectedSkinType === type.value 
                          ? 'bg-primary text-white border-primary shadow-md' 
                          : 'bg-white text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <GlowButton 
                  variant="outline" 
                  className="flex-1" 
                  onClick={resetCapture}
                  disabled={analyzeMutation.isPending}
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </GlowButton>
                <GlowButton 
                  className="flex-[2]" 
                  onClick={handleSubmit}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? 'Analyzing...' : (
                    <><CheckCircle className="w-5 h-5" /> Get My Results</>
                  )}
                </GlowButton>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

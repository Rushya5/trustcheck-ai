import { useState, useCallback } from 'react';
import { Upload, Image, Video, Music, X, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/analysis';

interface UploadedFile {
  id: string;
  file: File;
  type: MediaType;
  preview?: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

interface MediaUploaderProps {
  onUpload?: (files: File[]) => void;
  caseId?: string;
}

export function MediaUploader({ onUpload, caseId }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // Default
  };

  const getIcon = (type: MediaType) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      type: getMediaType(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, progress: 100, status: 'processing' }
                : f
            )
          );

          // Simulate processing
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id ? { ...f, status: 'complete' } : f
              )
            );
          }, 1500);
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }
      }, 200);
    });

    onUpload?.(newFiles.map((f) => f.file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-300",
          dragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/20"
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="p-12 text-center">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
            dragActive ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              dragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {dragActive ? "Drop files here" : "Upload media for analysis"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop images, videos, or audio files
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Image className="h-4 w-4" /> JPEG, PNG
            </span>
            <span className="flex items-center gap-1">
              <Video className="h-4 w-4" /> MP4, MOV
            </span>
            <span className="flex items-center gap-1">
              <Music className="h-4 w-4" /> WAV, MP3
            </span>
          </div>

          <Button variant="forensic" className="mt-6">
            Select Files
          </Button>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          {files.map((uploadedFile) => {
            const Icon = getIcon(uploadedFile.type);
            return (
              <div
                key={uploadedFile.id}
                className="forensic-card p-4 flex items-center gap-4"
              >
                {/* Preview/Icon */}
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {uploadedFile.status !== 'complete' && (
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          uploadedFile.status === 'processing'
                            ? "bg-analysis data-stream"
                            : "bg-primary"
                        )}
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'complete' ? (
                    <div className="flex items-center gap-1 text-trust">
                      <FileCheck className="h-4 w-4" />
                      <span className="text-xs">Ready</span>
                    </div>
                  ) : uploadedFile.status === 'processing' ? (
                    <span className="text-xs text-analysis animate-pulse">Processing...</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(uploadedFile.progress)}%
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

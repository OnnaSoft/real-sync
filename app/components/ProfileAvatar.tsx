import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from '@/lib/cropImage';

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullname: string;
  isEditing: boolean;
  onAvatarChange: (file: File) => void;
}

export function ProfileAvatar({ avatarUrl, fullname, isEditing, onAvatarChange }: Readonly<ProfileAvatarProps>) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (croppedImage && croppedAreaPixels) {
        const croppedImageUrl = await getCroppedImg(
          croppedImage,
          croppedAreaPixels,
          0
        );
        setCroppedImage(croppedImageUrl);
        setCropperOpen(false);
        
        // Convert base64 to blob
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "cropped-avatar.jpg", { type: "image/jpeg" });
        
        onAvatarChange(file);
      }
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, croppedImage, onAvatarChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCroppedImage(reader.result as string);
        setCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`w-40 h-40 bg-gray-200 flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      >
        {(avatarUrl || croppedImage) ? (
          <img 
            src={avatarUrl || croppedImage || undefined} 
            alt={fullname} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-gray-400">
            {fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64">
            {croppedImage && (
              <Cropper
                image={croppedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCropperOpen(false)}>Cancel</Button>
            <Button onClick={showCroppedImage}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


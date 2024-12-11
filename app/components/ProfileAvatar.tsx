import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
	avatarUrl?: string;
	fullname: string;
	isEditing: boolean;
	onAvatarChange: (file: File) => void;
}

const compressImage = async (file: File): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => handleReaderLoad(event, resolve, reject);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
};

const handleReaderLoad = (event: ProgressEvent<FileReader>, resolve: (value: Blob | PromiseLike<Blob>) => void, reject: (reason?: any) => void) => {
	const img = new Image();
	img.onload = () => handleImageLoad(img, resolve, reject);
	img.onerror = () => reject(new Error('Failed to load image'));
	img.src = event.target?.result as string;
};

const handleImageLoad = (img: HTMLImageElement, resolve: (value: Blob | PromiseLike<Blob>) => void, reject: (reason?: any) => void) => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = 200;
	canvas.height = 200;
	ctx?.drawImage(img, 0, 0, 200, 200);
	canvas.toBlob((blob) => {
		if (blob) {
			resolve(blob);
		} else {
			reject(new Error('Failed to compress image'));
		}
	}, 'image/jpeg', 0.7);
};

interface ProfileAvatarProps {
	avatarUrl?: string;
	fullname: string;
	isEditing: boolean;
	onAvatarChange: (file: File) => void;
}

export function ProfileAvatar({ avatarUrl, fullname, isEditing, onAvatarChange }: Readonly<ProfileAvatarProps>) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			const compressedImage = await compressImage(file);
			const blob = new Blob([compressedImage], { type: 'image/jpeg' });
			setPreviewUrl(URL.createObjectURL(blob));
			onAvatarChange(new File([blob], file.name, { type: 'image/jpeg' }));
		}
	}, [onAvatarChange]);

	return (
		<div className="space-y-4">
			<div className="w-48 h-48 mx-auto">
				<Avatar className="w-full h-full rounded-full">
					<AvatarImage
						src={previewUrl ?? avatarUrl}
						alt={fullname}
						className="object-cover"
					/>
					<AvatarFallback className="text-4xl">{fullname.charAt(0)}</AvatarFallback>
				</Avatar>
			</div>
			{isEditing && (
				<div className="text-center">
					<Label htmlFor="avatar" className="cursor-pointer">
						<div className="flex items-center justify-center space-x-2 text-sm text-blue-500">
							<Camera size={16} />
							<span>Change photo</span>
						</div>
					</Label>
					<Input
						id="avatar"
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleAvatarChange}
					/>
				</div>
			)}
		</div>
	);
}


import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const ProfilePicture = ({ 
  user, 
  size = 'md', 
  editable = false, 
  onUpdate = null,
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profilePicture) return user.profilePicture;
    if (user?.avatar) return user.avatar;
    return null;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) return;

    try {
      setIsUploading(true);
      const file = fileInputRef.current.files[0];
      
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('userId', user.id);

      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Profile picture updated successfully');
        onUpdate?.(response.data.profilePictureUrl);
        setIsDialogOpen(false);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUploading(true);
      await api.delete('/upload/profile-picture');
      toast.success('Profile picture removed');
      onUpdate?.(null);
      setIsDialogOpen(false);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setIsDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ProfileAvatar = ({ showEditButton = false }) => (
    <div className={`relative ${className}`}>
      <Avatar className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700`}>
        <AvatarImage 
          src={getAvatarUrl()} 
          alt={user?.name || 'User'} 
          className="object-cover"
        />
        <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold">
          {getInitials(user?.name)}
        </AvatarFallback>
      </Avatar>
      
      {showEditButton && editable && (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="absolute -bottom-1 -right-1 p-1 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
        >
          <Camera className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  if (!editable) {
    return <ProfileAvatar />;
  }

  return (
    <>
      <ProfileAvatar showEditButton={true} />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current/Preview Image */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700">
                  <AvatarImage 
                    src={getAvatarUrl()} 
                    alt={user?.name || 'User'} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-semibold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* File Input */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                
                {(user?.profilePicture || user?.avatar) && (
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              {/* Upload Actions */}
              {previewUrl && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Save'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-medium">Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use a clear, professional photo</li>
                <li>Square images work best</li>
                <li>Maximum file size: 5MB</li>
                <li>Supported formats: JPG, PNG, GIF</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePicture;

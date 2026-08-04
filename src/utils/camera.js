import { Capacitor } from "@capacitor/core";
import { Camera, CameraDirection } from "@capacitor/camera";

export const isNativeCameraAvailable = () => Capacitor.isNativePlatform();

export const takeBookmarkPhoto = async () => {
  const photo = await Camera.takePhoto({
    cameraDirection: CameraDirection.Rear,
    quality: 90,
    targetWidth: 1800,
    targetHeight: 1800,
    includeMetadata: true,
    saveToGallery: false,
  });

  return photo.webPath;
};

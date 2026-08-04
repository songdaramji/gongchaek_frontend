import { useState } from "react";
import ImageSelectionModal from "../modal/books/ImageSelectionModal";
import {
  isNativeCameraAvailable,
  takeBookmarkPhoto,
} from "../../utils/camera";

const BookmarkScanner = ({ onSuccessExtract, onCancel }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      setIsModalOpen(true);
    } else {
      setImageUrl(null);
      setIsModalOpen(false);
    }
  };

  const handleCameraClick = async () => {
    if (!isNativeCameraAvailable()) return;

    try {
      const photoUrl = await takeBookmarkPhoto();
      if (photoUrl) {
        setImageUrl(photoUrl);
        setIsModalOpen(true);
      }
    } catch (error) {
      if (error?.message?.toLowerCase().includes("cancel")) return;
      console.error("카메라 촬영 오류:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  const handleExtractedText = (text) => {
    onSuccessExtract(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-center text-und18 font-bold">사진으로 구절 입력</h2>
        <p className="mt-2 text-center text-und14 text-undtextgray">
          책을 평평하게 펴고 글자가 선명하게 보이도록 촬영해 주세요.
        </p>

        {isNativeCameraAvailable() ? (
          <button
            type="button"
            onClick={handleCameraClick}
            className="mt-6 h-12 w-full rounded-full bg-undpoint font-bold text-white"
          >
            카메라로 촬영
          </button>
        ) : (
          <label className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-undpoint font-bold text-white">
            카메라로 촬영
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 h-11 w-full rounded-full bg-undbgsub text-undtextgray"
        >
          취소
        </button>
      </div>

      {/* ImageSelectionModal 호출 */}
      {isModalOpen && imageUrl && (
        <ImageSelectionModal
          source={imageUrl}
          onClose={handleCloseModal}
          onExtractedText={handleExtractedText}
        />
      )}
    </div>
  );
};

export default BookmarkScanner;

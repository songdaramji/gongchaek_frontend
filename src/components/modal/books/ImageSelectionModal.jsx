import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

const ImageSelectionModal = ({ source, onClose, onExtractedText }) => {
  const imgRef = useRef();

  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const preprocessImage = (image, selection) => {
    const croppedCanvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    const sourceX = selection.x * scaleX;
    const sourceY = selection.y * scaleY;
    const sourceWidth = selection.width * scaleX;
    const sourceHeight = selection.height * scaleY;
    const outputScale = Math.min(2, Math.max(1, 1600 / sourceWidth));

    croppedCanvas.width = sourceWidth * outputScale;
    croppedCanvas.height = sourceHeight * outputScale;
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      croppedCanvas.width,
      croppedCanvas.height
    );

    // console.log("이미지 잘림 완료:", croppedCanvas);

    // const imageData = croppedCtx.getImageData(
    //   0,
    //   0,
    //   croppedCanvas.width,
    //   croppedCanvas.height
    // );
    // const data = imageData.data;

    // console.log("이미지 데이터 가져오기 완료");

    // // grayscale
    // for (let i = 0; i < data.length; i += 4) {
    //   const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    //   data[i] = avg;
    //   data[i + 1] = avg;
    //   data[i + 2] = avg;
    // }

    // // binarize
    // const threshold = 128;
    // for (let i = 0; i < data.length; i += 4) {
    //   const value = data[i] < threshold ? 0 : 255;
    //   data[i] = value;
    //   data[i + 1] = value;
    //   data[i + 2] = value;
    // }

    // croppedCtx.putImageData(imageData, 0, 0);

    // console.log("이미지 전처리 완료");

    return croppedCanvas;
  };

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = imgRef.current.getBoundingClientRect();
    setStartPosition({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setIsSelecting(true);
  };

  const handleMove = (e) => {
    if (!isSelecting || !startPosition) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = imgRef.current.getBoundingClientRect();
    const currentPosition = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    setSelection({
      x: Math.min(startPosition.x, currentPosition.x),
      y: Math.min(startPosition.y, currentPosition.y),
      width: Math.abs(currentPosition.x - startPosition.x),
      height: Math.abs(currentPosition.y - startPosition.y),
    });
  };

  const handleEnd = () => {
    setIsSelecting(false);
  };

  const handleRecognize = async () => {
    if (!selection || selection.width < 10 || selection.height < 10) return;

    setIsProcessing(true);
    setProgress(0);
    try {
      const processedCanvas = preprocessImage(imgRef.current, selection);
      const {
        data: { text },
      } = await Tesseract.recognize(processedCanvas, "kor+eng", {
        logger: ({ status, progress: nextProgress }) => {
          if (status === "recognizing text") setProgress(nextProgress);
        },
      });
      const normalizedText = text
        .replace(/\s*\n\s*/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 200);
      if (!normalizedText) throw new Error("인식된 글자가 없습니다.");
      onExtractedText(normalizedText);
      onClose();
    } catch (error) {
      console.error("텍스트 추출 오류:", error);
      window.alert("글자를 인식하지 못했습니다. 영역을 다시 선택해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black bg-opacity-90">
      <div className="flex items-center justify-between p-4 text-white">
        <div>
          <p className="font-bold">구절 영역 선택</p>
          <p className="text-und12 text-white/70">손가락으로 문장을 둘러싸 주세요.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/15 px-4 py-2"
          disabled={isProcessing}
        >
          닫기
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-3">
        <div
          className="relative max-h-full max-w-full select-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ touchAction: "none" }}
        >
          <img
            ref={imgRef}
            src={source}
            alt="Captured"
            className="max-h-[70vh] max-w-full rounded-lg object-contain"
            draggable={false}
          />
          {selection && (
            <div
              style={{
                position: "absolute",
                top: selection.y,
                left: selection.x,
                width: selection.width,
                height: selection.height,
                border: "2px solid #f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                pointerEvents: "none",
              }}
            ></div>
          )}
        </div>
      </div>
      <div className="bg-black p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {isProcessing && (
          <p className="mb-2 text-center text-und14 text-white">
            글자를 인식하고 있어요… {Math.round(progress * 100)}%
          </p>
        )}
        <button
          type="button"
          onClick={handleRecognize}
          disabled={!selection || isProcessing}
          className="h-12 w-full rounded-full bg-undpoint font-bold text-white disabled:bg-unddisabled disabled:text-undtextgray"
        >
          {isProcessing ? "인식 중" : "선택한 구절 인식"}
        </button>
      </div>
    </div>
  );
};

export default ImageSelectionModal;

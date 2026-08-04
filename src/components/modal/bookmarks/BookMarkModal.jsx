import React, { useEffect, useState } from "react";
import SlrModalLayout from "../../../layouts/SlrModalLayout";
import BookmarkPageInput from "../../bookmark/BookmarkPageInput";
import { PiCamera } from "react-icons/pi";
import BookmarkMarkInput from "../../bookmark/BookmarkMarkInput";
import {
  addBookmark,
  deleteBookmark,
  modifyBookmark,
} from "../../../api/book/bookMarkApi";
import TwoButtonModal from "../commons/TwoButtonModal";
import { useNavigate } from "react-router-dom";
import BookmarkScanner from "../../myBook/BookmarkScanner";

const BookMarkModal = ({
  modes,
  onClose,
  book = null,
  bookmark = null,
  setRefresh = null,
  socialAdd = null,
}) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [page, setPage] = useState(bookmark?.pageNumber || 0);
  const [mark, setMark] = useState(bookmark?.phrase || "");
  const [mode, setMode] = useState(modes || "READ");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (mark !== "") setIsReady(true);
    else {
      setIsReady(false);
    }
  }, [mark]);

  const fetchAddBookmark = async () => {
    if (mode !== "ADD") return;
    const data = {
      title: book.title,
      pageNumber: page,
      phrase: mark,
    };

    try {
      const res = await addBookmark(data);
      if (res.data.result === "success") {
        onClose();
        navigate("/myBook/list", {
          replace: true,
          state: { prevActiveTab: "책갈피" },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchModifyBookmark = async () => {
    if (mode !== "MODIFY") return;
    const data = {
      title: bookmark.title,
      pageNumber: page,
      phrase: mark,
    };

    try {
      const res = await modifyBookmark(bookmark.id, data);
      if (res.data.result === "success") {
        setRefresh();
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDeleteBookmark = async () => {
    try {
      const res = await deleteBookmark(bookmark.id);
      if (res.data.result === "success") {
        setRefresh();
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleModeChange = (mode) => {
    setMode(mode);
  };

  const handleConfirmDelete = (boolean) => {
    setIsOpenConfirmModal(boolean);
  };

  return (
    <SlrModalLayout onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <h1 className="text-start text-und16 font-bold text-undtextdark">
            책 제목
          </h1>
          <p className="text-start text-und14 text-undtextgray line-clamp-3">
            {book?.title || bookmark?.title}
          </p>
        </div>

        {(mode === "SOCIAL" || mode === "READ") && (
          <div className="w-full flex items-center justify-between mt-4">
            <h1 className="text-start text-und16 font-bold text-undtextdark">
              등록일
            </h1>
            <p className="text-und14 text-end text-undtextgray">
              {bookmark?.recordDate}
            </p>
          </div>
        )}

        <div className="w-full flex items-center justify-between mt-4">
          <h1 className="text-start text-und16 font-bold text-undtextdark">
            책갈피 위치
          </h1>

          <BookmarkPageInput
            mode={mode}
            page={page}
            setPage={setPage}
            totalPage={book?.itemPage || bookmark?.totalPageNumber}
          />
        </div>
      </div>

      <div className="w-full flex flex-col mt-6">
        {mode !== "SOCIAL" && mode !== "READ" && (
          <div
            className={`w-full flex ${
              // mode === "ADD" ? "justify-between" :
              "justify-end"
            } items-center`}
          >
            {(mode === "ADD" || mode === "MODIFY") && (
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="mr-auto flex min-h-11 items-center gap-2 rounded-full bg-undbgsub px-4 text-und14 font-bold text-undclickbrown"
                aria-label="사진으로 구절 입력"
              >
                <PiCamera size={23} />
                사진으로 입력
              </button>
            )}

            <p className="text-und14 text-end text-undtextgray justify-end">
              {"("}
              {mark.length}/200자{")"}
            </p>
          </div>
        )}

        <BookmarkMarkInput mode={mode} mark={mark} setMark={setMark} />
      </div>

      {mode !== "READ" ? (
        <div className="fixed px-6 w-full bottom-6 start-0 end-0 mt-4 flex justify-center items-center">
          <div className="w-full ">
            <button
              className={`w-full h-12 rounded-full text-und18 ${
                isReady
                  ? "bg-undpoint text-white"
                  : "bg-unddisabled text-undtextgray"
              } font-bold`}
              disabled={!isReady}
              onClick={
                mode === "ADD"
                  ? fetchAddBookmark
                  : mode !== "SOCIAL"
                  ? fetchModifyBookmark
                  : socialAdd
              }
            >
              {mode === "ADD"
                ? "책갈피 추가"
                : mode !== "SOCIAL"
                ? "수정하기"
                : "책갈피 담기"}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed px-6 w-full bottom-6 start-0 end-0 mt-4 flex justify-center items-center">
          <div className="w-full flex gap-5">
            <button
              className={`w-full h-12 rounded-lg text-und18 bg-unddisabled text-undtextgray font-bold`}
              onClick={() => handleConfirmDelete(true)}
            >
              {"삭제"}
            </button>
            <button
              className={`w-full h-12 rounded-lg text-und18 ${
                isReady
                  ? "bg-undpoint text-white"
                  : "bg-unddisabled text-undtextgray"
              } font-bold`}
              disabled={!isReady}
              onClick={() =>
                mode === "ADD" ? fetchAddBookmark() : handleModeChange("MODIFY")
              }
            >
              {"수정하기"}
            </button>
          </div>
        </div>
      )}

      {isOpenConfirmModal && (
        <TwoButtonModal
          onCancel={() => handleConfirmDelete(false)}
          onConfirm={fetchDeleteBookmark}
        >
          <p className="text-und16 text-undclickbrown font-bold">
            해당 책갈피를 정말로 삭제하시겠습니까?
          </p>
        </TwoButtonModal>
      )}
      {isScannerOpen && (
        <BookmarkScanner
          onCancel={() => setIsScannerOpen(false)}
          onSuccessExtract={(text) => {
            setMark(text);
            setIsScannerOpen(false);
          }}
        />
      )}
    </SlrModalLayout>
  );
};

export default BookMarkModal;

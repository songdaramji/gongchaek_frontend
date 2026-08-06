import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteBook, getBookDetail } from "../../api/book/bookApi";
import BasicLayout from "../../layouts/BasicLayout";
import { PrevTitleModifyDelete } from "../../layouts/TopLayout";
import BookCoverTitle from "../../components/book/BookCoverTitle";
import BookInformation from "../../components/book/BookInformation";
import useBookStatus from "../../hooks/useBookStatus";
import TwoButtonModal from "../../components/modal/commons/TwoButtonModal";
import MyBookModal from "../../components/modal/books/MyBookModal";
import BookCustomInformation from "../../components/book/BookCustomInformation";
import LoadingPage from "../LoadingPage";

const MyBookDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId } = useParams();
  const { getStatusInKorean } = useBookStatus();
  const [book, setBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {};

  useEffect(() => {
    console.log("prevScrollLeft: ", prevScrollLeft);

    let isMounted = true;

    const fetchBookDetail = async () => {
      try {
        const res = await getBookDetail(bookId);
        if (isMounted) setBook(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookDetail();

    return () => {
      isMounted = false;
    };
  }, [bookId, refresh]);

  const fetchDeleteBook = async () => {
    try {
      const res = await deleteBook(bookId);
      return res;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const handleClick = async (option) => {
    if (option === "back") {
      navigate("../list", {
        replace: true,
        state: {
          prevActiveTab,
          prevSearch,
          prevSort,
          prevScrollLeft,
        },
      });
    } else if (option === "modify") {
      setModifyModalOpen(true);
    } else if (option === "delete") {
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    const res = await fetchDeleteBook();
    if (res === "success") {
      navigate("../list");
    }
  };

  const handleCloseModifyModal = () => {
    setModifyModalOpen(false);
    setRefresh((prev) => !prev);
  };

  if (!book) {
    return (
      <BasicLayout>
        <LoadingPage />
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="fixed top-0 left-0 w-full z-50 bg-undbgmain">
        <PrevTitleModifyDelete
          title={getStatusInKorean(book.status)}
          onClick={handleClick}
        />
      </div>
      <div className="pt-20 pb-4">
        <BookCoverTitle book={book} />
      </div>

      {book.status !== "WISH" && (
        <div className="flex flex-col gap-4 px-6">
          <BookCustomInformation book={book} />
        </div>
      )}

      {book.status !== "WISH" && (
        <div className="w-full flex justify-center gap-3 py-4 px-6">
          <div className="w-full h-10 flex flex-col">
            <div className="w-full h-5"></div>
            <div className="w-full h-5 border-dashed border-t border-undpoint"></div>
          </div>
          <div className="w-36 h-10 flex items-center justify-center text-undpoint">
            책 정보
          </div>
          <div className="w-full h-10 flex flex-col">
            <div className="w-full h-5"></div>
            <div className="w-full h-5 border-dashed border-t border-undpoint"></div>
          </div>
        </div>
      )}

      <div className="py-2.5 pb-20">
        <BookInformation
          book={book}
          hasDescription={book.status !== "WISH" ? false : true}
        />
      </div>
      {deleteModalOpen && (
        <TwoButtonModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
        >
          {book.status !== "WISH" && (
            <p className="text-und16 text-undclickbrown font-bold">
              {"그동안 기록했던 내용이 모두 사라져요"}
            </p>
          )}
          <p className="text-und16 text-undclickbrown font-bold">
            {"정말로 삭제하시겠습니까?"}
          </p>
        </TwoButtonModal>
      )}
      {modifyModalOpen && (
        <MyBookModal
          mode={"MODIFY"}
          book={book}
          onClose={handleCloseModifyModal}
        />
      )}
    </BasicLayout>
  );
};

export default MyBookDetailPage;

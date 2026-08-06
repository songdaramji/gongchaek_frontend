import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BasicLayout from "../../layouts/BasicLayout";
import { PrevTitle } from "../../layouts/TopLayout";
import SearchBar from "../../components/commons/SearchBar";
import {
  ItemCount,
  SortDropdown,
} from "../../components/commons/ListSortAndCount";
import { getAllBook } from "../../api/book/bookMarkApi";
import ListNotice from "../../components/commons/ListNotice";
import BookList from "../../components/book/BookList";
import ScrollActionButtons from "../../components/commons/ScrollActionButtons";
import BookMarkModal from "../../components/modal/bookmarks/BookMarkModal";

const MyBookSearchPage = () => {
  const location = useLocation();
  const { title, prevActiveTab, pathname = "../list" } = location?.state || {};
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("최신순");
  const [data, setDate] = useState({});
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [openBookmarkModal, setOpenBookmarkModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  const observer = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    fetchAllBook();
  }, [search, sort]);

  useEffect(() => {
    if (sentinelRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !loading && data.hasNext) {
            setLoading(true);
            fetchAllBook(data.lastId);
          }
        },
        { threshold: 1.0 }
      );
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, data.hasNext]);

  const fetchAllBook = async (lastId = null) => {
    try {
      setLoading(true);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const res = await getAllBook(search, sorts, lastId);
      if (lastId) {
        setBooks((prevBooks) => [...prevBooks, ...res.content]);
      } else {
        setBooks(res.content);
      }
      setDate(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSort = (sort) => {
    setSort(sort);
  };

  const handleSearch = (search) => {
    setSearch(search);
  };

  const handleCardClick = (book) => {
    if (pathname === "../list") {
      handleOpenBookmarkModal(book);
    } else {
      navigate(
        { pathname: pathname },
        { replace: true, state: { prevActiveTab, book } }
      );
    }
  };

  const handleOpenBookmarkModal = (book) => {
    setOpenBookmarkModal(true);
    setCurrentBook(book);
  };

  const handleCloseBookmarkModal = () => {
    setOpenBookmarkModal(false);
    setCurrentBook(null);
  };

  return (
    <BasicLayout>
      <div className="w-full min-h-screen">
        <div className="w-full bg-undbgmain">
          <PrevTitle
            title={title}
            showLine={false}
            onClick={() => {
              navigate(
                { pathname: pathname },
                { replace: true, state: { prevActiveTab } }
              );
            }}
          />
        </div>
        <div className="py-4 px-6">
          <SearchBar
            placeholder={"책 제목, 저자로 검색"}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-2">
          <ItemCount count={data?.totalElements || 0} unit={"권"} />
          <SortDropdown
            onChange={handleSort}
            option1={"최신순"}
            option2={"오래된 순"}
            activeOption={sort}
          />
        </div>
        {/* 검색 결과가 없을 때 공지 표시 */}
        {!loading && data.totalElements === 0 && (
          <div className="w-full h-screen flex justify-center items-center">
            <ListNotice type={"noResult"} />
          </div>
        )}

        {/* 검색 목록 출력 */}
        {data.totalElements > 0 && (
          <div className="flex pb-16 justify-center px-6">
            <BookList
              books={books}
              onCardClick={handleCardClick} // 동작 추가
              infoOnly
              withIcon
            />
          </div>
        )}

        {/* Sentinel item - 마지막 아이템을 감지하는 요소 */}
        {data.totalElements > 0 && !loading && (
          <div ref={sentinelRef} className="h-1"></div>
        )}
      </div>
      <ScrollActionButtons onlyTop={true} />
      {openBookmarkModal && currentBook && (
        <BookMarkModal
          modes={"ADD"}
          onClose={handleCloseBookmarkModal}
          book={currentBook}
        />
      )}
    </BasicLayout>
  );
};

export default MyBookSearchPage;

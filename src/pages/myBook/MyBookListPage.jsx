import { useEffect, useRef, useState } from "react";
import BasicLayout from "../../layouts/BasicLayout";
import { OnlyTitle } from "../../layouts/TopLayout";
import { getBookList } from "../../api/book/bookApi";
import ScrollActionButtons from "../../components/commons/ScrollActionButtons";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/commons/SearchBar";
import {
  ItemCount,
  SortDropdown,
} from "../../components/commons/ListSortAndCount";
import ListNotice from "../../components/commons/ListNotice";
import BookList from "../../components/book/BookList";
import TabCondition from "../../components/commons/TabCondition";
import useBookStatus from "../../hooks/useBookStatus";
import BookMarkList from "../../components/bookmark/BookMarkList";
import { getBookmarkList } from "../../api/book/bookMarkApi";
import BookMarkModal from "../../components/modal/bookmarks/BookMarkModal";

const MyBookListPage = () => {
  const location = useLocation();
  const { prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {};
  const navigate = useNavigate();
  const { getStatusInEnglish } = useBookStatus();

  const [search, setSearch] = useState(prevSearch || "");
  const [sort, setSort] = useState(prevSort || "최신순");
  const [activeTab, setActiveTab] = useState(prevActiveTab || "읽고 있는 책");
  const [lastId, setLastId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [books, setBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const tabRef = useRef(null);
  const [tabScrollLeft, setTabScrollLeft] = useState(prevScrollLeft || 0);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [activeBookmark, setActiveBookmark] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [noResult, setNoResult] = useState(null);
  const [noSearchResult, setNoSearchResult] = useState(null);

  const observer = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (activeTab !== "책갈피") fetchBookList();
    else if (activeTab === "책갈피") fetchBookmarkList();
  }, [activeTab, sort, search, refresh]);

  // 스크롤 관리
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 120); // 100px 이상 스크롤 시 버튼 전환
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 스크롤 복원
  useEffect(() => {
    if (tabRef.current) {
      tabRef.current.scrollLeft = tabScrollLeft;
    }
  }, [tabScrollLeft]);

  useEffect(() => {
    if (sentinelRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !loading && hasNext) {
            setLoading(true);
            activeTab !== "책갈피" && fetchBookList(lastId);
            activeTab === "책갈피" && fetchBookmarkList(lastId);
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
  }, [loading, hasNext]);

  const fetchBookList = async (lastId = null) => {
    try {
      setLoading(true);
      const status = getStatusInEnglish(activeTab);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const res = await getBookList(status, sorts, search, lastId);
      if (lastId) {
        setBooks((prevBooks) => [...prevBooks, ...res.content]);
      } else {
        setBooks(res.content);
      }
      setLastId(res.lastId);
      setHasNext(res.hasNext);
      setTotalElements(res.totalElements);
      if (!search && res.totalElements === 0) {
        setNoResult(true);
        setNoSearchResult(null);
      } else if (search && res.totalElements === 0) {
        setNoSearchResult(true);
        setNoResult(null);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchBookmarkList = async (lastId = null) => {
    try {
      setLoading(true);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const res = await getBookmarkList(search, sorts, lastId);

      if (lastId) {
        setBookmarks((prevBookmarks) => [...prevBookmarks, ...res.content]);
      } else {
        setBookmarks(res.content);
      }
      setLastId(res.lastId);
      setHasNext(res.hasNext);
      setTotalElements(res.totalElements);
      if (!search && res.totalElements === 0) {
        setNoResult(true);
        setNoSearchResult(null);
      } else if (search && res.totalElements === 0) {
        setNoSearchResult(true);
        setNoResult(null);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    if (activeTab === "책갈피" && tab !== "책갈피") {
      setBookmarks([]);
      setLastId(null);
      setHasNext(false);
      setTotalElements(0);
      setSearch("");
      setNoResult(null);
      setNoSearchResult(null);
    } else if (activeTab !== "책갈피" && tab === "책갈피") {
      setBooks([]);
      setLastId(null);
      setHasNext(false);
      setTotalElements(0);
      setSearch("");
      setNoResult(null);
      setNoSearchResult(null);
    }
    setSort("최신순");
    setActiveTab(tab);

    // 현재 스크롤 위치 저장
    if (tabRef.current) {
      setTabScrollLeft(tabRef.current.scrollLeft);
    }
  };

  const handleSort = (sort) => {
    setSort(sort);
  };

  const handleSearch = (search) => {
    console.log(search);
    setSearch(search);
  };

  const moveToDetail = (book) => {
    const bookId = book.id;
    navigate(`../detail/${bookId}`, {
      replace: true,
      state: {
        prevActiveTab: activeTab,
        prevSearch: search,
        prevSort: sort,
        prevScrollLeft: tabScrollLeft,
      },
    });
  };

  const handleOpenBookmarkDetail = (bookmark) => {
    setIsBookmarkOpen(true);
    setActiveBookmark(bookmark);
  };

  const handleCloseBookmarkDetail = () => {
    setIsBookmarkOpen(false);
    setActiveBookmark(null);
  };

  return (
    <BasicLayout>
      <div className="w-full min-h-screen">
        <div className="fixed top-0 start-0 z-50 w-full bg-undbgmain">
          <OnlyTitle title="내 책장" showLine={false} />

          {!isScrolled && (
            <div className="py-4 px-6">
              <SearchBar
                placeholder={
                  activeTab !== "책갈피"
                    ? "책 제목, 저자로 검색"
                    : "책 제목, 구절로 검색"
                }
                onChange={handleSearch}
                searchHistory={search}
              />
            </div>
          )}

          <div className="px-0">
            <TabCondition
              ref={tabRef}
              tabs={[
                "읽고 있는 책",
                "읽고 싶은 책",
                "다 읽은 책",
                "중단한 책",
                "책갈피",
              ]}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              initialScrollLeft={tabScrollLeft}
            />
          </div>

          {!isScrolled && (
            <div className="flex items-center justify-between px-6 py-2">
              <ItemCount
                count={totalElements || 0}
                unit={activeTab === "책갈피" ? "개" : "권"}
              />
              <SortDropdown
                onChange={handleSort}
                option1={"최신순"}
                option2={"오래된 순"}
                activeOption={sort}
              />
            </div>
          )}
        </div>

        {/* 검색 결과가 없을 때 공지 표시 */}
        {!loading && activeTab !== "책갈피" && totalElements === 0 && (
          <div className="w-full h-screen flex justify-center items-center">
            {noResult && <ListNotice type={"emptyBook"} />}
            {noSearchResult && <ListNotice type={"noResult"} />}
          </div>
        )}

        {/* 검색 목록 출력 */}
        {activeTab !== "책갈피" && totalElements > 0 && (
          <div className="pt-52 pb-16 flex justify-center px-6">
            <BookList books={books} onCardClick={moveToDetail} />
          </div>
        )}

        {!loading && activeTab === "책갈피" && totalElements === 0 && (
          <div className="w-full h-screen flex justify-center items-center">
            {noResult && <ListNotice type={"emptyBookMark"} />}
            {noSearchResult && <ListNotice type={"noResult"} />}
          </div>
        )}

        {/* 검색 목록 출력 */}
        {activeTab === "책갈피" && totalElements > 0 && (
          <div className="pt-52 pb-16 flex justify-center px-6">
            <BookMarkList
              bookmarks={bookmarks}
              onCardClick={handleOpenBookmarkDetail}
            />
          </div>
        )}

        {/* Sentinel item - 마지막 아이템을 감지하는 요소 */}
        {totalElements > 0 && !loading && (
          <div ref={sentinelRef} className="h-1"></div>
        )}

        {isBookmarkOpen && (
          <BookMarkModal
            modes={"READ"}
            bookmark={activeBookmark}
            onClose={handleCloseBookmarkDetail}
            setRefresh={() => setRefresh((prev) => !prev)}
          />
        )}

        <ScrollActionButtons
          mainLabel={activeTab === "책갈피" ? "책갈피" : "책 담기"}
          mainAction={() =>
            activeTab === "책갈피"
              ? navigate("../search", {
                  replace: true,
                  state: {
                    title: "책갈피 추가",
                    prevActiveTab: activeTab,
                    prevSearch: search,
                    prevSort: sort,
                    prevScrollLeft: tabScrollLeft,
                  },
                })
              : navigate("/home/searchbook", {
                  replace: true,
                  state: {
                    prevActiveTab: activeTab,
                    prevSearch: search,
                    prevSort: sort,
                    prevScrollLeft: tabScrollLeft,
                  },
                })
          }
        />
      </div>
    </BasicLayout>
  );
};

export default MyBookListPage;

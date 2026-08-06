import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  getSocialInfo,
  patchFollow,
  getSocialBookList,
  getSocialBookmarkList,
  addSocialBookmarkToMyBook,
} from "../../api/social/socialBookShelfApi";
import BasicLayout from "../../layouts/BasicLayout";
import { PrevTitle } from "../../layouts/TopLayout";
import SocialProfile from "../../components/social/SocialProfile";
import SearchBar from "../../components/commons/SearchBar";
import TabCondition from "../../components/commons/TabCondition";
import {
  ItemCount,
  SortDropdown,
} from "../../components/commons/ListSortAndCount";
import BookList from "../../components/book/BookList";
import useBookStatus from "../../hooks/useBookStatus";
import ListNotice from "../../components/commons/ListNotice";
import BookMarkList from "../../components/bookmark/BookMarkList";
import ScrollActionButtons from "../../components/commons/ScrollActionButtons";
import BookMarkModal from "../../components/modal/bookmarks/BookMarkModal";
import useCustomLogin from "../../hooks/useCustomLogin";

// 소셜 유저 책장
const SocialBookListPage = () => {
  const location = useLocation(); // 전달받은 state를 가져옴
  const { prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {};
  const navigate = useNavigate();
  const { getStatusInEnglish } = useBookStatus();
  const { targetMemberId } = useParams();
  const { loginState } = useCustomLogin();

  const [search, setSearch] = useState(prevSearch || "");
  const [sort, setSort] = useState(prevSort || "최신순");
  const [activeTab, setActiveTab] = useState(prevActiveTab || "읽고 있는 책");
  const [lastId, setLastId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [books, setBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 상태 관리
  const tabRef = useRef(null);
  const [tabScrollLeft, setTabScrollLeft] = useState(prevScrollLeft || 0);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [activeBookmark, setActiveBookmark] = useState({});
  const { state } = location; // 기존 검색 상태
  const [socialProfile, setSocialProfile] = useState([]); // 유저 소셜 프로필 정보 상태
  const [myself, setMyself] = useState(false);
  const [noResult, setNoResult] = useState(null);
  const [noSearchResult, setNoSearchResult] = useState(null);

  const observer = useRef(null);
  const sentinelRef = useRef(null);

  // 소셜 유저 프로필 정보
  useEffect(() => {
    const fetchData = async () => {
      const socialInfo = await fetchSocialInfo();
      setSocialProfile(socialInfo); // 가져온 데이터를 상태로 설정
      setMyself(socialInfo.id === loginState.id);
    };
    fetchData();
  }, []);

  // 소셜 유저 책장 목록
  useEffect(() => {
    if (activeTab !== "책갈피") fetchSocialBooks();
    else if (activeTab === "책갈피") fetchSocialBookmarks();
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
            activeTab !== "책갈피" && fetchSocialBooks(lastId);
            activeTab === "책갈피" && fetchSocialBookmarks(lastId);
          }
        },
        { threshold: 0.5 }
      );
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasNext]);

  // 소셜 유저 정보 API
  const fetchSocialInfo = async () => {
    if (!targetMemberId) return;
    try {
      const response = await getSocialInfo(targetMemberId);
      console.log("***** 소셜 프로필 정보 :", response); // 여기서 응답 데이터 출력
      return response; // 응답 반환
    } catch (error) {
      console.error(error, "소셜 정보를 불러오는 데 실패하였습니다");
      return error;
    }
  };

  // 유저 소셜 책장 책 목록 출력 API 호출
  const fetchSocialBooks = async (lastId = null) => {
    try {
      setLoading(true);
      const status = getStatusInEnglish(activeTab);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const response = await getSocialBookList(
        targetMemberId,
        status,
        sorts,
        search,
        lastId
      );
      if (lastId) {
        setBooks((prevBooks) => [...prevBooks, ...response.content]);
      } else {
        setBooks(response.content);
      }
      console.log(response.content);

      setLastId(response.lastId);
      setHasNext(response.hasNext);
      setTotalElements(response.totalElements);
      if (!search && response.totalElements === 0) {
        setNoResult(true);
        setNoSearchResult(null);
      } else if (search && response.totalElements === 0) {
        setNoSearchResult(true);
        setNoResult(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("소셜 책 리스트를 불러오는 데 실패하였습니다:", error);
      setLoading(false);
    }
  };

  const fetchSocialBookmarks = async (lastId = null) => {
    try {
      setLoading(true);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const response = await getSocialBookmarkList(
        targetMemberId,
        search,
        sorts,
        lastId
      );

      if (lastId) {
        setBookmarks((prevBookmarks) => [
          ...prevBookmarks,
          ...response.content,
        ]);
      } else {
        setBookmarks(response.content);
      }
      setLastId(response.lastId);
      setHasNext(response.hasNext);
      setTotalElements(response.totalElements);
      if (!search && response.totalElements === 0) {
        setNoResult(true);
        setNoSearchResult(null);
      } else if (search && response.totalElements === 0) {
        setNoSearchResult(true);
        setNoResult(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("소셜 책갈피 리스트를 불러오는 데 실패하였습니다:", error);
      setLoading(false);
    }
  };

  const fetchAddBookmark = async () => {
    if (!activeBookmark) return;

    try {
      const res = await addSocialBookmarkToMyBook(activeBookmark.id);
      console.log("addSocialBookmark res: ", res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddBookmark = async () => {
    await fetchAddBookmark();
  };

  // 프로필 팔로워/팔로잉 클릭 시 상세 페이지로 이동
  const handleSocialTabClick = (tabCondition) => {
    navigate(`../list/${targetMemberId}`, {
      replace: true,
      state: {
        tabCondition, // "팔로워" 또는 "팔로잉"
        search: "", // 검색어 (기본값으로 null 전달)
        socialProfile, // 프로필 정보 전달
      },
    });
  };

  // 기존 검색 상태를 함께 navigate로 전달
  const handleBackClick = () => {
    navigate(
      "../",
      {
        state: state,
        replace: true,
      } // 기존 검색 상태를 그대로 전달
    );
  };

  // 팔로우 핸들러
  const handleFollowClick = async (id) => {
    await patchFollow(id);
    setSocialProfile((prev) => ({
      ...prev,
      isFollowing: true,
    }));
  };

  // 언팔로우 핸들러
  const handleUnfollowClick = async (id) => {
    await patchFollow(id);
    setSocialProfile((prev) => ({
      ...prev,
      isFollowing: false,
    }));
  };

  // 탭 선택 핸들러
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

    console.log("totalElements: ", totalElements);
  };

  // 책 목록 정렬 핸들러
  const handleSort = (sort) => {
    setSort(sort);
  };

  // 검색어 핸들러
  const handleSearch = (search) => {
    console.log(search);
    setSearch(search);
  };

  const moveToDetail = (book) => {
    const bookId = book.id;
    navigate(`book/${bookId}`, {
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
        <div className="fixed top-0 left-0 w-full z-50 bg-undbgmain">
          <PrevTitle
            title="소셜 책장"
            showLine={false}
            onClick={handleBackClick}
          />

          {!isScrolled && (
            <div className="px-6 py-3.5">
              <SocialProfile
                socialProfile={socialProfile}
                onFollowClick={async () => handleFollowClick(socialProfile.id)} // 팔로우 버튼 클릭
                onUnfollowClick={async () =>
                  handleUnfollowClick(socialProfile.id)
                } // 언팔로우 버튼 클릭
                onFollowerClick={() => handleSocialTabClick("팔로워")} // 팔로워 클릭
                onFollowingClick={() => handleSocialTabClick("팔로잉")} // 팔로잉 클릭
                myself={myself}
              />
            </div>
          )}
          {!isScrolled && (
            <div className="py-4 px-6">
              <SearchBar
                placeholder={
                  activeTab !== "책갈피"
                    ? "책 제목, 저자로 검색"
                    : "책 제목, 구절로 검색"
                }
                onChange={handleSearch}
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
          <div className="w-full h-screen flex flex-col justify-center items-center">
            <div className="h-80"></div>
            {noResult && <ListNotice type={"emptyBook"} />}
            {noSearchResult && <ListNotice type={"noResult"} />}
          </div>
        )}

        {/* 검색 목록 출력 */}
        {activeTab !== "책갈피" && totalElements > 0 && (
          <>
            <div className="h-8"></div>
            <div
              className={`pb-16 flex justify-center px-6 ${
                !isScrolled ? "pt-80" : "pt-52"
              }`}
            >
              <BookList
                books={books}
                onCardClick={moveToDetail}
                withIcon={true}
                isSocial={true}
              />
            </div>
            <div className="h-8"></div>
          </>
        )}

        {!loading && activeTab === "책갈피" && totalElements === 0 && (
          <div className="w-full h-screen flex flex-col justify-center items-center">
            <div className="h-80"></div>
            {noResult && <ListNotice type={"emptyBookMark"} />}
            {noSearchResult && <ListNotice type={"noResult"} />}
          </div>
        )}

        {/* 검색 목록 출력 */}
        {activeTab === "책갈피" && totalElements > 0 && (
          <div
            className={`${
              !isScrolled ? "pt-80" : "pt-52"
            } pb-16 flex flex-col justify-center px-6`}
          >
            <div className="h-8"></div>
            <BookMarkList
              bookmarks={bookmarks}
              onCardClick={handleOpenBookmarkDetail}
            />
            <div className="h-8"></div>
          </div>
        )}

        {/* Sentinel item - 마지막 아이템을 감지하는 요소 */}
        {totalElements > 0 && !loading && (
          <div ref={sentinelRef} className="h-1"></div>
        )}

        {isBookmarkOpen && (
          <BookMarkModal
            modes={"SOCIAL"}
            socialAdd={handleAddBookmark}
            bookmark={activeBookmark}
            onClose={handleCloseBookmarkDetail}
            setRefresh={() => setRefresh((prev) => !prev)}
          />
        )}

        <ScrollActionButtons onlyTop />
      </div>
    </BasicLayout>
  );
};

export default SocialBookListPage;

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSearchBookList } from "../../api/home/searchBookApi";
import BasicLayout from "../../layouts/BasicLayout";
import { PrevTitle } from "../../layouts/TopLayout";
import ISBNBookSearch from "../../components/home/ISBNBookSearch";
import {
  ItemCount,
  SortDropdown,
} from "../../components/commons/ListSortAndCount";
import ListNotice from "../../components/commons/ListNotice";
import ScrollActionButtons from "../../components/commons/ScrollActionButtons";
import BookList from "../../components/book/BookList";

// 책 전체 검색 페이지
const SearchBookPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { state } = location; // 기존 검색 상태

  const scrollPositionRef = useRef(0); // 스크롤 위치를 저장하기 위한 ref
  const [searchKeyword, setSearchKeyword] = useState(
    state?.searchKeyword || ""
  ); // 검색어 상태
  const [books, setBooks] = useState(state?.books || []); // 검색 결과 상태
  const [totalResults, setTotalResults] = useState(state?.totalResults || 0); // 총 검색 결과 수 상태
  const [isSearchExecuted, setIsSearchExecuted] = useState(
    state?.isSearchExecuted || false
  ); // 검색 실행 여부
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 상태

  const option1 = "관련도 순"; // 정렬 옵션1 지정
  const option2 = "출간일 순"; // 정렬 옵션2 지정
  const [sortOption, setSortOption] = useState(state?.sortOption || option1); // 정렬 기본값 설정

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [hasMore, setHasMore] = useState(true); // 추가 데이터 여부

  // 정렬 옵션에 따른 API 매핑
  const sortMappings = {
    [option1]: "Accuracy", // 관련도 순
    [option2]: "PublishTime", // 출간일 순
  };

  // 스크롤 관리
  useEffect(() => {
    if (state?.scrollPosition) {
      window.scrollTo(0, state.scrollPosition); // 스크롤 복원
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 740); // 100px 이상 스크롤 시 버튼 전환
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 책 상세에서 뒤로가기로 넘어왔을 때 검색어값 유지
  useEffect(() => {
    if (!isSearchExecuted && location?.state) {
      console.log(
        "**********뒤로가기 클릭 -> 기존값 넘겨받음 : ",
        location?.state
      );
      // location.state가 존재하면 검색어와 목록 복구
      setSearchKeyword(location?.state?.searchKeyword || "");
      setBooks(location?.state?.books || []);
      setTotalResults(location?.state?.totalResults || 0);
      setIsSearchExecuted(true);
    }
  }, [location?.state, location?.key]);

  // 검색어 또는 정렬 옵션 변경 시 데이터를 새로 가져옴
  useEffect(() => {
    if (searchKeyword) {
      fetchBooks(searchKeyword, sortMappings[sortOption], 1, true);
    }
  }, [searchKeyword, sortOption]);

  // 무한 스크롤
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;

      // 하단에 도달하면 다음 페이지 로드
      if (
        scrollHeight - scrollTop <= clientHeight + 200 &&
        hasMore &&
        !isLoading
      ) {
        loadMoreBooks();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  // 검색 버튼 클릭 시 실행
  const handleSearchSubmit = (keyword) => {
    setSearchKeyword(keyword); // 입력값 업데이트
    console.log("*****검색어:", keyword);
    fetchBooks(keyword, sortMappings[sortOption], 1, true); // isNew 플래그 설정
    setIsSearchExecuted(true);
  };

  // 정렬 변경 시 실행
  const handleSortChange = async (option) => {
    setSortOption(option); // 선택된 정렬 옵션 업데이트
    console.log("*****선택된 정렬 옵션:", option);
    if (searchKeyword) {
      console.log("*****정렬 옵션 변경으로 재검색 실행:", option);
      await fetchBooks(searchKeyword, sortMappings[option], 1, true); // API 재호출
    }
  };

  // 검색 결과
  const fetchBooks = async (
    keyword,
    sort = sortOption,
    page = 1,
    isNew = false // 기존 데이터를 초기화할지 여부
  ) => {
    try {
      setIsLoading(true);
      if (isNew) setBooks([]); // 새 데이터 요청 시 기존 데이터 초기화

      const response = await getSearchBookList(keyword, sort, page);
      const newBooks = response.data.items || []; // 데이터 목록
      const total = response.data.totalResults; // 검색 결과 수

      setBooks((prevBooks) => (isNew ? newBooks : [...prevBooks, ...newBooks])); // 기존 데이터 초기화 또는 추가
      setTotalResults(total);
      setHasMore(newBooks.length > 0); // 새로운 데이터가 없으면 무한 스크롤 종료
      setCurrentPage(page);
    } catch (error) {
      console.error("검색 결과를 불러오는 데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = (book) => {
    // 현재 스크롤 위치 저장
    scrollPositionRef.current =
      window.scrollY || document.documentElement.scrollTop;

    navigate(`detail/${book.isbn13}`, {
      replace: true,
      state: {
        searchKeyword, // 현재 검색어
        books, // 현재 검색 결과 목록
        totalResults, // 검색 결과 개수
        sortOption, // 정렬 옵션
        isSearchExecuted,
        scrollPosition: scrollPositionRef.current, // 스크롤 위치 저장
        state,
      },
    });
  };

  // 이전 버튼 클릭 관리
  const handleBackClick = () => {
    // 기존 검색 상태를 함께 navigate로 전달
    if (!location?.state) navigate("/home", { replace: true });
    else navigate("/myBook/list", { replace: true, state: state });
  };

  // 무한 스크롤 관리
  const loadMoreBooks = useCallback(() => {
    if (!searchKeyword || isLoading || !hasMore) return;
    fetchBooks(searchKeyword, sortMappings[sortOption], currentPage + 1);
  }, [searchKeyword, sortOption, currentPage, isLoading, hasMore]);

  return (
    <BasicLayout>
      <div className="w-full min-h-screen">
        <div className="fixed top-0 z-50 w-full bg-undbgmain">
          {/* 상단 제목 */}
          <PrevTitle
            title={"책 전체 검색"}
            showLine={isScrolled ? true : false}
            onClick={handleBackClick}
          />
          {/* 검색창 컴포넌트 */}
          {!isScrolled && (
            <div className="w-full px-6">
              <ISBNBookSearch
                onSearchSubmit={handleSearchSubmit}
                searchHistory={state?.searchKeyword || null}
              />
              {/* 개수 및 정렬 */}
              {isSearchExecuted && totalResults > 0 && (
                <div className="flex h-6 justify-center py-4 bg-undbgmain">
                  <div className="w-full h-full flex items-center justify-between">
                    <ItemCount count={totalResults} unit={"권"} />
                    <SortDropdown
                      onChange={handleSortChange}
                      option1={option1}
                      option2={option2}
                      activeOption={sortOption}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* 검색 결과가 없을 때 공지 표시 */}
        {searchKeyword && !isLoading && totalResults === 0 && (
          <div className="w-full h-full px-6 flex justify-center items-center">
            <ListNotice type="noResult" />
          </div>
        )}

        {/* 검색 목록 출력 */}
        {isSearchExecuted && totalResults > 0 && (
          <div className="pt-32 pb-16 px-6 flex justify-center">
            <BookList
              books={books}
              onCardClick={handleCardClick}
              infoOnly={true}
              withIcon={true}
            />
          </div>
        )}
      </div>
      <ScrollActionButtons onlyTop={true} />
    </BasicLayout>
  );
};

export default SearchBookPage;

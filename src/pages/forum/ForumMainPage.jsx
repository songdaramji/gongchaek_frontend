import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getForums } from "../../api/forum/forumApi";
import useForumStatus from "../../hooks/useForumStatus";
import BasicLayout from "../../layouts/BasicLayout";
import { OnlyTitle } from "../../layouts/TopLayout";
import SearchBar from "../../components/commons/SearchBar";
import TabCondition from "../../components/commons/TabCondition";
import {
  ItemCount,
  SortDropdown,
} from "../../components/commons/ListSortAndCount";
import ScrollActionButtons from "../../components/commons/ScrollActionButtons";
import ForumList from "../../components/forum/ForumList";
import ListNotice from "../../components/commons/ListNotice";

// 토론 메인 게시판 리스트
const ForumMainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {}; // state 상태
  const { getStatusInEnglish } = useForumStatus();
  const { state } = location; // 기존 검색 상태

  const [search, setSearch] = useState(prevSearch || ""); // 검색어 상태
  const [activeTab, setActiveTab] = useState(
    prevActiveTab || "진행 중" //
  );

  const [sort, setSort] = useState(prevSort || "최신순");
  const option1 = "최신순"; // 정렬 옵션1 지정
  const option2 = "오래된 순"; // 정렬 옵션2 지정
  const [lastId, setLastId] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalElements, setTotalElements] = useState(state?.totalElements || 0); // 총 검색 결과 수 상태
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [forums, setForums] = useState(state?.forums || []);

  const tabRef = useRef(null); // 탭
  const [tabScrollLeft, setTabScrollLeft] = useState(prevScrollLeft || 0);

  const observer = useRef(null); // 마지막 스크롤 감지
  const sentinelRef = useRef(null); // 마지막 스크롤 감지

  // 스크롤 관리
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // 100px 이상 스크롤 시 버튼 전환
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // API 호출
  useEffect(() => {
    fetchForums(); // 초기 데이터 로드
  }, [activeTab, sort, search, location]);

  // 마지막 게시물 체크, 스크롤
  useEffect(() => {
    if (sentinelRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !loading && hasNext) {
            setLoading(true);
            fetchForums(lastId);
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

  // 토론 목록 API 호출
  const fetchForums = async (lastId = null) => {
    try {
      setLoading(true);
      const status = getStatusInEnglish(activeTab);
      const sorts = sort === "최신순" ? "desc" : "asc";
      const res = await getForums(status, sorts, search, lastId);
      if (lastId) {
        setForums((prevForums) => [...prevForums, ...res.content]);
      } else {
        setForums(res.content);
      }
      console.log("*****res : ", res);
      setLastId(res.lastId);
      setHasNext(res.hasNext);
      setTotalElements(res.totalElements);
      setLoading(false);
    } catch (error) {
      console.error("토론 목록을 불러오는 데 실패했습니다:", error);
      setLoading(false);
    }
    return forums;
  };

  // 토론 게시판 탭 클릭 핸들러
  const handleTabChange = (tab) => {
    if (activeTab === tab) {
      // 같은 탭을 다시 클릭한 경우
      setLastId(null);
      setForums([]); // 상태 초기화
      fetchForums(); // API 호출 강제 실행
    } else {
      // 다른 탭으로 전환된 경우
      setActiveTab(tab);
      setLastId(null);
      setForums([]);
      setHasNext(false);
    }

    // 현재 스크롤 위치 저장
    if (tabRef.current) {
      setTabScrollLeft(tabRef.current.scrollLeft);
    }
  };

  // 목록 정렬 관리
  const handleSort = (sort) => {
    setSort(sort);
  };

  // 게시물 검색 관리
  const handleSearch = (search) => {
    console.log(search);
    setSearch(search);
  };

  // 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = (forum) => {
    const forumId = forum.discussionId;
    const forumStatus = forum.status;

    // 상태에 따라 경로 설정
    let path = "";
    if (forumStatus === "PROPOSED") {
      path = `../propose/${forumId}`;
    } else if (forumStatus === "SCHEDULED") {
      path = `../scheduled/${forumId}`;
    } else if (forumStatus === "IN_PROGRESS") {
      path = `../inprogress/${forumId}`;
    } else if (forumStatus === "COMPLETED") {
      path = `../completed/${forumId}`;
    }

    // 페이지 이동
    navigate(path, {
      replace: true,
      state: {
        prevActiveTab: activeTab,
        prevSearch: search,
        prevSort: sort,
        prevScrollLeft: tabScrollLeft,
      },
    });
  };

  return (
    <BasicLayout>
      <div className="w-full fixed top-0 bg-undbgmain z-20">
        <OnlyTitle title={"토론"} showLine={false} />

        {!isScrolled && (
          <div className="px-6">
            <SearchBar
              placeholder="책 제목, 글 제목으로 검색"
              onChange={handleSearch}
              searchHistory={search}
            />
          </div>
        )}
        <div className={`pt-${isScrolled ? "0" : "4"}`}>
          <TabCondition
            ref={tabRef}
            tabs={["주제 발의", "토론 예정", "진행 중", "종료된 토론"]}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            initialScrollLeft={tabScrollLeft}
          />
        </div>
        {!isScrolled && (
          <div className="flex justify-between px-6 py-4">
            <ItemCount count={totalElements} unit={"개"} />
            <SortDropdown
              onChange={handleSort}
              option1={option1}
              option2={option2}
              activeOption={sort}
            />
          </div>
        )}
      </div>
      <ScrollActionButtons onlyTop={true} />
      {activeTab === "주제 발의" ? (
        <ScrollActionButtons
          mainLabel={"글쓰기"}
          mainAction={() =>
            navigate({ pathname: "/forum/propose/write" }, { replace: true })
          }
          onlyTop={false}
        />
      ) : !loading ? (
        <ScrollActionButtons onlyTop={true} />
      ) : null}
      {forums && forums.length > 0 ? (
        <div className="px-6 pt-52 py-20 flex justify-center">
          <ForumList forums={forums} onCardClick={handleCardClick} />
        </div>
      ) : (
        <div className="px-6 flex justify-center items-center h-full">
          {activeTab === "주제 발의" && <ListNotice type="noProposed" />}
          {activeTab === "토론 예정" && <ListNotice type="noScheduled" />}
          {activeTab === "진행 중" && <ListNotice type="noInProgress" />}
          {activeTab === "종료된 토론" && <ListNotice type="noCompleted" />}
        </div>
      )}
      {/* Sentinel item - 마지막 아이템을 감지하는 요소 */}
      {totalElements > 0 && !loading && (
        <div ref={sentinelRef} className="h-1"></div>
      )}
    </BasicLayout>
  );
};

export default ForumMainPage;

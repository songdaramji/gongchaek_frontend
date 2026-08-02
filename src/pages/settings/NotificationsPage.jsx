import React, { useEffect, useState } from "react";
import NotificationsComponent from "../../components/settings/NotificationsComponent";
import { PrevTitle } from "../../layouts/TopLayout";
import NavBar from "../../layouts/NavBar";
import { useNavigate } from "react-router-dom";
import {
  getKakaoLoginLink,
  getMyInformation,
  modifyIsPublic,
  modifyKakaoMessage,
} from "../../api/settings/myPageApi";
import TwoButtonModal from "../../components/modal/commons/TwoButtonModal";

const NotificationsPage = () => {
  const [myInfo, setMyInfo] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [openSocializeModal, setOpenSocializeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookshelfNotifications, setBookshelfNotifications] = useState([
    {
      id: "bookshelf-1", // id 추가
      alertTitle: "독서 장려 알림",
      description: "한 달 이상 독서 활동 없을 시 알림",
      isEnabled: false,
    },
    {
      id: "bookshelf-2", // id 추가
      alertTitle: "책갈피 카카오톡 메시지",
      description: "카카오톡 메시지로 내 책갈피 랜덤 발송",
      isEnabled: false,
    },
  ]);

  const [snsNotifications, setSnsNotifications] = useState([
    {
      id: "sns-1", // id 추가
      alertTitle: "새로운 팔로워",
      description: "누군가 나를 팔로우했을 시 알림",
      isEnabled: false,
    },
    {
      id: "sns-2", // id 추가
      alertTitle: "내 책장 공개",
      description: "소셜 검색에서 내 계정 노출 여부",
      isEnabled: false,
    },
  ]);

  const [discussionNotifications, setDiscussionNotifications] = useState([
    {
      id: "discussion-1", // id 추가
      alertTitle: "발의 채택/기각",
      description: "내가 발의한 주제 채택/기각 여부",
      isEnabled: false,
    },
    {
      id: "discussion-2", // id 추가
      alertTitle: "토론 개최 예정",
      description: "토론 예정 시간 1시간 전 알림",
      isEnabled: false,
    },
    {
      id: "discussion-3", // id 추가
      alertTitle: "토론 댓글",
      description: "누군가 나를 멘션했을 시 알림",
      isEnabled: false,
    },
  ]);

  useEffect(() => {
    setBookshelfNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === "bookshelf-2"
          ? { ...notification, isEnabled: myInfo.messageToKakao }
          : notification
      )
    );
    setSnsNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === "sns-2"
          ? { ...notification, isEnabled: myInfo.public }
          : notification
      )
    );
  }, [myInfo]);

  // 초기 정보 로드
  useEffect(() => {
    fetchMyInfo();
  }, [refresh]);

  const fetchMyInfo = async () => {
    try {
      setIsLoading(true);
      const res = await getMyInformation();
      console.log("res at page: ", res);
      setMyInfo(res);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 핸들러 수정
  const handleBookshelfToggle = (id) => (checked) => {
    setBookshelfNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEnabled: checked } : item
      )
    );
    if (id === "bookshelf-2") {
      socialToggleController();
    }
  };

  const handleDiscussionToggle = (id) => (checked) => {
    setDiscussionNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEnabled: checked } : item
      )
    );
  };

  const handleSnsToggle = (id) => (checked) => {
    setSnsNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEnabled: checked } : item
      )
    );
    if (id === "sns-2") {
      toggleIsPublic();
    }
  };

  const socialToggleController = () => {
    if (!myInfo.social) {
      setOpenSocializeModal(true);
    } else if (!myInfo.kakaoMessageIsAgree) {
      console.log("동의받기");
      getKakaoAgreement();
    } else {
      toggleMessageToKakao();
    }
  };

  const toggleMessageToKakao = async () => {
    try {
      const res = await modifyKakaoMessage();
      console.log("res at page: ", res);
    } catch (error) {
      console.error(error);
    }
  };

  const socializeAccount = async () => {
    console.log("카카오 로그인 요청 시작");
    setOpenSocializeModal(false);
    const kakaoAuthUrl = getKakaoLoginLink();
    window.location.href = kakaoAuthUrl;
  };

  const getKakaoAgreement = async () => {
    console.log("카카오 동의");
    try {
      console.log("카카오 추가 동의 요청 시작");

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(
          import.meta.env.MODE === "development" // 실행 환경이
            ? import.meta.env.VITE_KAKAO_REST_API_KEY_LOCAL
            : import.meta.env.VITE_KAKAO_REST_API_KEY
        );

        window.Kakao.Auth.authorize({
          redirectUri: `${(
            import.meta.env.VITE_APP_URL || window.location.origin
          ).replace(/\/$/, "")}/settings/redirect`,
          scope: "talk_message",
          state: "agree",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleIsPublic = async () => {
    try {
      const res = await modifyIsPublic();
      console.log("res at page: ", res);
    } catch (error) {
      console.error(error);
    }
  };

  // 디버깅을 위한 콘솔 로그 추가
  const bookshelfItems = bookshelfNotifications.map((item) => ({
    ...item,
    onChange: handleBookshelfToggle(item.id),
  }));

  const snsItems = snsNotifications.map((item) => ({
    ...item,
    onChange: handleSnsToggle(item.id),
  }));

  const discussionItems = discussionNotifications.map((item) => ({
    ...item,
    onChange: handleDiscussionToggle(item.id),
  }));

  const navigate = useNavigate();

  return (
    <div>
      <PrevTitle
        title={"알림 설정"}
        showLine={false}
        onClick={() => navigate("/settings")}
      />
      {!isLoading && (
        <div className="px-7 flex flex-col gap-6">
          <NotificationsComponent
            subtitle={"책장"}
            notificationItems={bookshelfItems}
          />
          <NotificationsComponent
            subtitle={"소셜"}
            notificationItems={snsItems}
          />
          <NotificationsComponent
            subtitle={"토론"}
            notificationItems={discussionItems}
          />
        </div>
      )}
      {openSocializeModal && (
        <TwoButtonModal
          onConfirm={socializeAccount}
          onCancel={() => setOpenSocializeModal(false)}
        >
          <p className="text-und16 text-undclickbrown font-bold">
            카카오 연동이 필요한 기능입니다
          </p>
          <p className="text-und16 text-undclickbrown font-bold">
            카카오 계정과 연동하시겠습니까?
          </p>
        </TwoButtonModal>
      )}
      <NavBar />
    </div>
  );
};

export default NotificationsPage;

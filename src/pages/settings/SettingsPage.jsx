import { useState, useEffect } from "react";
import BasicLayout from "../../layouts/BasicLayout";
import { OnlyTitle } from "../../layouts/TopLayout";
import MenuBox from "../../components/settings/MenuBox";
import ProfileBox from "../../components/settings/ProfileBox";
import { useNavigate } from "react-router-dom";
import ProfileModifyingModal from "../../components/modal/settings/ProfileModifyingModal";
import useCustomLogin from "../../hooks/useCustomLogin";
import { useSelector } from "react-redux";
import { useMyInformation } from "../../hooks/useProfileQueries";

const SettingsPage = () => {
  const { loginState } = useCustomLogin();
  const navigate = useNavigate();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const refresh = useSelector((state) => state.refresh.refresh);
  const { data: myInfo = {}, refetch: refetchMyInfo } =
    useMyInformation(loginState);

  useEffect(() => {
    // roles에 ADMIN이 포함되어 있는지 확인하고 리다이렉션
    if (loginState.roles?.includes("ADMIN")) {
      navigate("/admin", { replace: true });
    }
  }, [loginState.roles, navigate]);

  useEffect(() => {
    if (refresh) refetchMyInfo();
  }, [refresh, refetchMyInfo]);

  const handleProfileModal = (boolean) => {
    setIsProfileModalOpen(boolean);
  };

  return (
    <BasicLayout>
      <div className="fixed top-0 left-0 right-0">
        <OnlyTitle title={"설정"} showLine={false} />
      </div>
      <div className="w-full flex flex-col px-6 pt-20 gap-4">
        <div className="w-full">
          <ProfileBox myInfo={myInfo} openModal={handleProfileModal} />
        </div>
        <div className="w-full">
          <MenuBox
            text={"마이페이지"}
            hasChild={false}
            childList={[]}
            link={"myPage"}
          />
        </div>
        <div className="w-full">
          <MenuBox
            text={"독서 기록"}
            hasChild={true}
            childList={["통계"]}
            link={["record"]}
          />
        </div>
        <div className="w-full">
          <MenuBox
            text={"알림 설정"}
            hasChild={false}
            childList={[]}
            link={"notifications"}
          />
        </div>
        <div className="w-full">
          <MenuBox
            text={"고객 지원"}
            hasChild={true}
            childList={["이용약관", "개인정보처리방침"]}
            link={["termsOfUse", "privacyPolicy"]}
          />
        </div>
      </div>
      {isProfileModalOpen && (
        <ProfileModifyingModal
          onClose={handleProfileModal}
          profile={loginState}
          myInfo={myInfo}
        />
      )}
    </BasicLayout>
  );
};

export default SettingsPage;

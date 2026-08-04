import { Link } from "react-router-dom";
import { getKakaoLoginLink, wakeKakaoBackend } from "../../api/kakaoApi";
import { PiChat, PiChatCircleFill } from "react-icons/pi";

const link = getKakaoLoginLink;

const KakaoLoginComponent = (props) => {
  const handleKakaoLogin = (e) => {
    e.preventDefault();
    wakeKakaoBackend();
    const kakaoAuthUrl = getKakaoLoginLink();
    window.location.href = kakaoAuthUrl;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-full py-2.5 flex justify-center bg-[#fae100] rounded-full"
    >
      <div className="flex gap-2 justify-between items-center">
        <PiChatCircleFill color={"#7D5C4D"} size={25} />
        <p className="text-und18 font-bold text-undpoint">카카오로 시작하기</p>
      </div>
    </button>
  );
};

export default KakaoLoginComponent;

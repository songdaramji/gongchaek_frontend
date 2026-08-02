import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { kakaoLoginAsync } from "../../slices/loginSlice";
import { useDispatch } from "react-redux";
import LoadingPage from "../LoadingPage";

function KakaoRedirectPage(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const authCode = searchParams.get("code");

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        const resultAction = await dispatch(kakaoLoginAsync(authCode));
        const payload = resultAction.payload;

        console.log("payload: ", payload);
        console.log("resultAction: ", resultAction);

        if (kakaoLoginAsync.rejected.match(resultAction) || !payload) {
          console.error("카카오 로그인 실패:", resultAction.error);
          navigate("/member/login", { replace: true });
          return;
        }

        if (payload.needsSignup) {
          // 신규 회원인 경우 회원가입 페이지로 이동
          navigate("/member/socialSignup", {
            state: { kakaoInfo: payload },
          });
        } else if (!payload.error) {
          // 로그인 성공 시 메인 페이지로 이동
          navigate("/home", { replace: true });
        } else {
          // 로그인 실패 시 로그인 페이지로 이동
          console.error("소셜 로그인 실패");
          navigate("/member/login", { replace: true });
        }
      } catch (error) {
        console.error("카카오 로그인 처리 중 에러 발생:", error);
        navigate("/member/login", { replace: true });
      }
    };
    if (authCode) {
      processKakaoLogin();
    }
  }, [authCode, dispatch, navigate]);

  return (
    <>
      <LoadingPage />
    </>
  );
}

export default KakaoRedirectPage;

import axios from "axios";
import { API_SERVER_HOST } from "./commonApi";

const rest_api_key =
  import.meta.env.MODE === "development" // 실행 환경이
    ? import.meta.env.VITE_KAKAO_REST_API_KEY_LOCAL
    : import.meta.env.VITE_KAKAO_REST_API_KEY;
const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
const redirect_uri = `${appUrl}/member/kakao`;
const auth_code_path = "https://kauth.kakao.com/oauth/authorize";

export const getKakaoLoginLink = () => {
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code&prompt=login`;
  return kakaoURL;
};

export const getToken = async (authCode) => {
  const res = await axios.post(`${API_SERVER_HOST}/api/member/kakao/token`, null, {
    params: { code: authCode, redirectUri: redirect_uri },
  });
  return res.data;
};

export const getMemberWithToken = async (accessToken, refreshToken) => {
  const res = await axios.get(`${API_SERVER_HOST}/api/member/kakao`, {
    params: {
      accessToken: accessToken, // 파라미터 이름을 정확히 일치시킴.
      refreshToken: refreshToken,
    },
  });
  return res.data;
};

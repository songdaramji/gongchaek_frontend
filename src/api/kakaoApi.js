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
    timeout: 90000,
  });
  return res.data;
};

export const getMemberWithToken = async (accessToken, refreshToken) => {
  const request = () =>
    axios.get(`${API_SERVER_HOST}/api/member/kakao`, {
      params: { accessToken, refreshToken },
      timeout: 30000,
    });
  try {
    return (await request()).data;
  } catch (error) {
    if (error.code !== "ECONNABORTED" && error.code !== "ERR_NETWORK") throw error;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return (await request()).data;
  }
};

export const wakeKakaoBackend = () => {
  fetch(`${API_SERVER_HOST}/api/health`, {
    method: "GET",
    mode: "cors",
    keepalive: true,
  }).catch(() => {});
};

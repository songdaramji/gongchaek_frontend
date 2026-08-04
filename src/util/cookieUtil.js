import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const setCookie = (name, value, days = 1) => {
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days);

  return cookies.set(name, value, {
    expires: expires,
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
};

export const getCookie = (name) => {
  return cookies.get(name);
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path: path });
};

export const removeKakaoCookie = () => {
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
  const redirectUri = encodeURIComponent(`${appUrl}/member/login`);
  const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_KAKAO_REST_API_KEY_LOCAL
      : import.meta.env.VITE_KAKAO_REST_API_KEY
  }&logout_redirect_uri=${redirectUri}`;

  window.location.href = kakaoLogoutUrl;
};

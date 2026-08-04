import { useQuery } from "@tanstack/react-query";
import { getMyInformation } from "../api/settings/myPageApi";
import { getMySocialInfo } from "../api/social/mySocialApi";

const profileFromLogin = (loginState = {}) => ({
  id: loginState.id,
  nickname: loginState.nickname || "",
  profileImage: loginState.profileImage || "defaultProfileImage.jpg",
  honorific: loginState.honorific || "",
  social: loginState.social,
});

export const useMyInformation = (loginState) =>
  useQuery({
    queryKey: ["myInformation"],
    queryFn: getMyInformation,
    placeholderData: () => profileFromLogin(loginState),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useMySocialProfile = (loginState) =>
  useQuery({
    queryKey: ["mySocialProfile"],
    queryFn: async () => (await getMySocialInfo()).data,
    placeholderData: () => ({
      ...profileFromLogin(loginState),
      followerCount: 0,
      followingCount: 0,
      isFollowing: null,
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

import { useEffect } from "react";
import { useSelector } from "react-redux";

const preloadCoreRoutes = () =>
  Promise.allSettled([
    import("../../pages/home/HomeMainPage"),
    import("../../pages/home/SearchBookPage"),
    import("../../pages/book/BookDetailPage"),
    import("../../pages/social/MySocialPage"),
    import("../../pages/social/SocialBookListPage"),
    import("../../pages/myBook/MyBookListPage"),
    import("../../pages/myBook/MyBookDetailPage"),
    import("../../pages/myBook/MyBookSearchPage"),
    import("../../pages/forum/ForumMainPage"),
    import("../../pages/settings/SettingsPage"),
  ]);

const CoreRoutePreloader = () => {
  const isLoggedIn = useSelector((state) => Boolean(state.loginSlice.username));
  useEffect(() => {
    if (!isLoggedIn) return;
    const start = () => preloadCoreRoutes();
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 500);
    return () => window.clearTimeout(id);
  }, [isLoggedIn]);
  return null;
};

export default CoreRoutePreloader;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import MemberRouter from "./MemberRouter";
import HomeRouter from "./HomeRouter";
import SocialRouter from "./SocialRouter";
import MyBookRouter from "./MyBookRouter";
import ForumRouter from "./ForumRouter";
import SettingsRouter from "./SettingsRouter";
import AdminRouter from "./AdminRouter";
import MainPage from "../pages/MainPage";
import { AuthContainer } from "../components/auth/AuthenticationWrapperComponent";
import CoreRoutePreloader from "../components/auth/CoreRoutePreloader";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <CoreRoutePreloader />
      <AuthContainer>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/home/*" element={<HomeRouter />} />
          <Route path="/social/*" element={<SocialRouter />} />
          <Route path="/myBook/*" element={<MyBookRouter />} />
          <Route path="/forum/*" element={<ForumRouter />} />
          <Route path="/settings/*" element={<SettingsRouter />} />
          <Route path="/admin/*" element={<AdminRouter />} />
          <Route path="/member/*" element={<MemberRouter />} />
        </Routes>
      </AuthContainer>
      {/* <Routes>
        <Route path="/member/*" element={<MemberRouter />} />
      </Routes> */}
    </BrowserRouter>
  );
};

export default AppRouter;

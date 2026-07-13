import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { CoursesPage } from "../modules/courses";
import { HomePage } from "../modules/home";
import { SigninPage, SignupPage } from "../modules/auth";

export const WebsiteRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

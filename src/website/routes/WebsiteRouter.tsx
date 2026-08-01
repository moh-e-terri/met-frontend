import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { RouteLoadingFallback } from "@/shared/components/RouteLoadingFallback";
import { lazyRoute } from "@/shared/routing/lazyRoute";

const HomePage = lazyRoute(
  () => import("../modules/home/views/HomePage"),
  "HomePage",
);
const SignupPage = lazyRoute(
  () => import("../modules/auth/views/SignupPage"),
  "SignupPage",
);
const SigninPage = lazyRoute(
  () => import("../modules/auth/views/SigninPage"),
  "SigninPage",
);
const CoursesPage = lazyRoute(
  () => import("../modules/courses/views/CoursesPage"),
  "CoursesPage",
);

export const WebsiteRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route element={<PublicLayout />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};

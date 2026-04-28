import { createBrowserRouter } from "react-router-dom";

import Mainlayout from "../layout/Mainlayout";
import Authlayout from "../layout/Authlayout";
import Dashboardlayout from "../layout/Dashboardlayout";
import AdminLayout from "../layout/AdminLayout";

import Signup from "../pages/auth/Signup";
import Verify from "../pages/auth/Verify";
import Login from "../pages/auth/Login";
import Forgotpassword from "../pages/auth/Forgotpassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import Features from "../pages/Features";
import Contact from "../pages/Contact";

import Dashboard from "../pages/dashboard/Dashboard";
import Subjects from "../pages/dashboard/Subjects";
import Bookmark from "../pages/dashboard/Bookmark";
import Settings from "../pages/Settings";
import PastQuestions from "../pages/dashboard/PastQuestions";
import ResourceViewer from "../pages/dashboard/ResourceView";
import DashboardProgress from "../pages/dashboard/Progress";
import ResourcesPage from "../pages/dashboard/ResourcePage";
import PastQuestionsBrowser from "../pages/dashboard/PastQuestionBrowser";
import PastQuestionViewer from "../pages/dashboard/PastQuestionViewer";

import AdminOverview from "../pages/Admin/AdminOverView";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminResources from "../pages/Admin/AdminResources";
import AdminPastQuestions from "../pages/Admin/AdminPastQuestions";
import AdminAnalytics from "../pages/Admin/AdminAnalytics";

import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";
import Forbidden403 from "../pages/error/Forbidden403";
import NotFound404 from "../pages/error/NotFound404";
import ServerError500 from "../pages/error/ServerError500";
import ResetOtp from "../pages/auth/ResetOtp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Mainlayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <AboutUs /> },
      { path: "features", element: <Features /> },
      { path: "contact", element: <Contact /> },
    ],
  },

  {
    path: "/auth",
    element: <Authlayout />,
    children: [
      { index: true, element: <Signup /> },
      { path: "verify", element: <Verify /> },
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <Forgotpassword /> },
      {path:"reset-otp",element:<ResetOtp/>},
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboardlayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "subjects", element: <Subjects /> },
      { path: "bookmarks", element: <Bookmark /> },
      { path: "settings", element: <Settings /> },
      { path: "past-questions", element: <PastQuestions /> },
      { path: "resource", element: <ResourceViewer /> },
      { path: "progress", element: <DashboardProgress /> },
      { path: "resource-view/:id", element: <ResourceViewer /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "past-question-browser", element: <PastQuestionsBrowser /> },
      { path: "past-question-viewer/:id", element: <PastQuestionViewer /> },
    ],
  },

  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: "users", element: <AdminUsers /> },
      { path: "resources", element: <AdminResources /> },
      { path: "past-questions", element: <AdminPastQuestions /> },
      { path: "analytics", element: <AdminAnalytics /> },
    ],
  },

  // Error routes
  { path: "/500", element: <ServerError500 /> },
  { path: "/403", element: <Forbidden403 /> },
  { path: "*", element: <NotFound404 /> },
]);
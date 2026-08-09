import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import StudentListPage from "../pages/Students/StudentListPage";

import TeacherDashboardPage from "../pages/Teacher/TeacherDashboardPage";
import CreatePostPage from "../pages/Teacher/CreatePostPage";
import TakeAttendancePage from "../pages/Teacher/TakeAttendancePage";
import TeacherPostsPage from "../pages/Teacher/TeacherPostsPage";

import ParentDashboardPage from "../pages/Parent/ParentDashboardPage";
import ParentExamResultsPage from "../pages/Parent/ParentExamResultsPage";
import ParentAllUpdatesPage from "../pages/Parent/ParentAllUpdatesPage";
import ViewPostPage from "../pages/Parent/ViewPostPage";

import CreateAnnouncementPage from "../pages/Admin/CreateAnnouncementPage";
import AllPostsPage from "../pages/Admin/AllPostsPage";
import ExamsPage from "../pages/Admin/ExamsPage";

import EnterMarksPage from "../pages/Teacher/EnterMarksPage";

import SchoolsManagementPage from "../pages/SuperAdmin/SchoolsManagementPage";
import CreateSchoolPage from "../pages/SuperAdmin/CreateSchoolPage";

import TeachersPage from "../pages/Admin/TeachersPage";
import ClassesPage from "../pages/Admin/ClassesPage";
import SubjectsPage from "../pages/Admin/SubjectsPage";
import ReportsPage from "../pages/Admin/ReportsPage";

import ProfilePage from "../pages/Profile/ProfilePage";
import SettingsPage from "../pages/Settings/SettingsPage";

function RoleHome() {

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user && user.role === "Super Admin") {

        return <Navigate to="/super-admin/schools" replace />;

    }

    if (user && user.role === "Teacher") {

        return <Navigate to="/teacher/dashboard" replace />;

    }

    if (user && user.role === "Parent") {

        return <Navigate to="/parent/dashboard" replace />;

    }

    return <Navigate to="/dashboard" replace />;

}

export default function AppRoutes() {

    return (

        <Routes>

            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
                element={

                    <ProtectedRoute>

                        <MainLayout />

                    </ProtectedRoute>

                }
            >

                <Route path="/" element={<RoleHome />} />

                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/students" element={<StudentListPage />} />

                <Route
                    path="/teachers"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin"]}>

                            <TeachersPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/classes"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin"]}>

                            <ClassesPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/subjects"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin"]}>

                            <SubjectsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/reports"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin"]}>

                            <ReportsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/create-announcement"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin", "Super Admin"]}>

                            <CreateAnnouncementPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/posts"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin", "Super Admin"]}>

                            <AllPostsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/exams"
                    element={

                        <ProtectedRoute allowedRoles={["School Admin", "Super Admin"]}>

                            <ExamsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/teacher/enter-marks"
                    element={

                        <ProtectedRoute allowedRoles={["Teacher"]}>

                            <EnterMarksPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/super-admin/schools"
                    element={

                        <ProtectedRoute allowedRoles={["Super Admin"]}>

                            <SchoolsManagementPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/super-admin/create-school"
                    element={

                        <ProtectedRoute allowedRoles={["Super Admin"]}>

                            <CreateSchoolPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/profile"
                    element={<ProfilePage />}
                />

                <Route
                    path="/settings"
                    element={<SettingsPage />}
                />

                <Route
                    path="/teacher/dashboard"
                    element={

                        <ProtectedRoute allowedRoles={["Teacher"]}>

                            <TeacherDashboardPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/teacher/create-post"
                    element={

                        <ProtectedRoute allowedRoles={["Teacher"]}>

                            <CreatePostPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/teacher/attendance"
                    element={

                        <ProtectedRoute allowedRoles={["Teacher"]}>

                            <TakeAttendancePage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/teacher/posts"
                    element={

                        <ProtectedRoute allowedRoles={["Teacher"]}>

                            <TeacherPostsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/parent/dashboard"
                    element={

                        <ProtectedRoute allowedRoles={["Parent"]}>

                            <ParentDashboardPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/parent/exam-results"
                    element={

                        <ProtectedRoute allowedRoles={["Parent"]}>

                            <ParentExamResultsPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/parent/all-updates"
                    element={

                        <ProtectedRoute allowedRoles={["Parent"]}>

                            <ParentAllUpdatesPage />

                        </ProtectedRoute>

                    }
                />

                <Route
                    path="/parent/post/:postType/:postId/:studentId"
                    element={

                        <ProtectedRoute allowedRoles={["Parent"]}>

                            <ViewPostPage />

                        </ProtectedRoute>

                    }
                />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

    );

}

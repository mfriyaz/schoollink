import {

    BrowserRouter,
    Routes,
    Route,
    Navigate

} from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";

import DashboardPage from "../pages/Dashboard/DashboardPage";

import StudentListPage from "../pages/Students/StudentListPage";

import MainLayout from "../layouts/MainLayout";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Login */}

                <Route

                    path="/"

                    element={<LoginPage />}

                />

                {/* ERP Layout */}

                <Route element={<MainLayout />}>

                    <Route

                        path="/dashboard"

                        element={<DashboardPage />}

                    />

                    <Route

                        path="/students"

                        element={<StudentListPage />}

                    />

                </Route>

                {/* Unknown Route */}

                <Route

                    path="*"

                    element={<Navigate to="/" replace />}

                />

            </Routes>

        </BrowserRouter>

    );

}

export default AppRoutes;
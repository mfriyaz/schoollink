import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import StudentListPage from "../pages/Students/StudentListPage";

export default function AppRoutes() {

    return (

        <Routes>

            <Route element={<MainLayout />}>

                <Route
                    path="/"
                    element={<DashboardPage />}
                />

                <Route
                    path="/students"
                    element={<StudentListPage />}
                />

            </Route>

        </Routes>

    );

}
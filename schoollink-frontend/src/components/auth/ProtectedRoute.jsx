import { Navigate } from "react-router-dom";

/**
 * Wraps a route so it can't be viewed without a valid login.
 * Optionally restricts to a set of allowed roles.
 *
 * Usage:
 *   <ProtectedRoute><DashboardPage /></ProtectedRoute>
 *   <ProtectedRoute allowedRoles={["Teacher"]}><CreatePostPage /></ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRoles }) {

    const token = localStorage.getItem("token");

    if (!token) {

        return <Navigate to="/login" replace />;

    }

    if (allowedRoles) {

        const storedUser = localStorage.getItem("user");

        const user = storedUser ? JSON.parse(storedUser) : null;

        const role = user ? user.role : null;

        if (!role || !allowedRoles.includes(role)) {

            return <Navigate to="/dashboard" replace />;

        }

    }

    return children;

}

export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../auth/authStore";

export default function PrivateRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}
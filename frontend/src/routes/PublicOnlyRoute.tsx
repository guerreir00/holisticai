import { Navigate, Outlet } from "react-router-dom";

function getToken() {
  return localStorage.getItem("token");
}

export default function PublicOnlyRoute() {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
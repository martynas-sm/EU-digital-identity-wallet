import { Navigate } from "react-router-dom";

function Protected({ children }: any) {
  const hasToken = sessionStorage.getItem("token");

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;

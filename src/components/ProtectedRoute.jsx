import { Navigate } from "react-router-dom"

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("abt_token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

// src/login/PrivateHeaderGuard.jsx
import { useAuth } from "./AuthContext";

export default function PrivateHeaderGuard({ children }) {
  const { loading } = useAuth();
  if (loading) return null;
  return children;
}

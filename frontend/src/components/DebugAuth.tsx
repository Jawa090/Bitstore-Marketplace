import { useAuth } from "../contexts/AuthContext";

const DebugAuth = () => {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User ID: {user?.id || 'null'}</div>
      <div>Email: {user?.email || 'null'}</div>
      <div>Roles: {JSON.stringify(user?.roles || [])}</div>
      <div>Token: {localStorage.getItem('accessToken') ? 'exists' : 'null'}</div>
    </div>
  );
};

export default DebugAuth;
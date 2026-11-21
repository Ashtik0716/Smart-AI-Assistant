import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.picture ? (
        <img
          src={user.picture}
          alt=""
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm text-gray-700 hidden sm:inline">{user.name}</span>
      <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600">
        Log out
      </button>
    </div>
  );
}
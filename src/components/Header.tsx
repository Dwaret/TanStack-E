import { Link } from '@tanstack/react-router'
import { useAuth } from '@/auth'

export default function Header() {
  const auth = useAuth()

  return (
    <header className="flex items-center justify-between p-4 text-gray-800 bg-white shadow-md">
      <nav className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          to="/products"
          className="p-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          Products
        </Link>
      </nav>

      {/* Unauthenticated Navigation */}
      <nav
        className="flex items-center space-x-4"
        hidden={auth.isAuthenticated}
      >
        <Link
          to="/login"
          className="p-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="p-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          Register
        </Link>
      </nav>

      {/* Authenticated Navigation */}
      <nav
        className="flex items-center space-x-4"
        hidden={!auth.isAuthenticated}
      >
        <Link
          to="/cart"
          className="relative flex items-center p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.638.707 1.638H19m-5 0a2 2 0 11-4 0 2 2 0 014 0zm-4 0a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Link>
        <Link
          to="/user"
          className="flex items-center space-x-2 p-1 rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <img
            src={auth.user?.image}
            className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-colors duration-200 object-cover"
            alt="User avatar"
          />
          <div className="font-semibold text-sm hidden sm:block">
            {auth.user?.username}
          </div>
        </Link>
      </nav>
    </header>
  )
}

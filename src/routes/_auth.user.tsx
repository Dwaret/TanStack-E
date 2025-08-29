import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/auth'

export const Route = createFileRoute('/_auth/user')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  const router = useRouter()
  const { email, username, image } = auth.user

  const handleLogout = () => {
    auth.logout()
    router.invalidate()
    router.navigate({ to: '/login' })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        <img
          src={image}
          alt={`${username}'s profile`}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{username}</h2>
        <div className="text-gray-600 mb-6">{email}</div>
        <button
          onClick={handleLogout}
          type="button"
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

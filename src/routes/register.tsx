import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth'

interface UserInfo {
  firstName: string
  lastName: string
  username: string
  password: string
}

export const Route = createFileRoute('/register')({
  component: register,
})

function register() {
  const auth = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [allFilled, setAllFilled] = useState(true)
  const navigate = useNavigate()

  console.log(Route.useLoaderData())

  const usernameValidation = useQuery({
    queryKey: ['usernameValidation', username],
    queryFn: () => checkUserName(username),
  })

  const addNewUserMutation = useMutation({
    mutationFn: () => addNewUser({ firstName, lastName, username, password }),
    onSuccess: async (data) => {
      await auth.login({
        id: data.id,
        email: data.email,
        username: data.username,
        image: data.image,
      })
      navigate({ to: '/' })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!(firstName && lastName && username && password)) {
      setAllFilled(false)
      return
    } else if (confirmPassword !== password) {
      return
    }
    addNewUserMutation.mutate()
    navigate({ to: '/' })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        className="flex flex-col space-y-4 rounded-lg bg-white p-8 shadow-lg"
        onSubmit={(e) => handleSubmit(e)}
      >
        <h1 className="text-center text-2xl font-bold text-gray-800">
          Register
        </h1>
        <div>
          <label className="block text-gray-700">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            className="w-full rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            className="w-full rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className="w-full rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div
            className="text-center text-xs text-red-500"
            hidden={
              !usernameValidation.data || usernameValidation.data.total === 0
            }
          >
            Username already exist
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Confirm Password</label>
          <input
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
            }}
            type="password"
            className="w-full rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div
            className="text-center text-xs text-red-500"
            hidden={confirmPassword === password}
          >
            Does not match password
          </div>
        </div>
        <div className="text-center text-s text-red-500" hidden={allFilled}>
          Please fill all fields
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 p-2 font-bold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Register
        </button>
      </form>
    </div>
  )
}

async function checkUserName(username: string) {
  const response = await fetch(
    `https://dummyjson.com/users/filter?key=username&value=${username}`,
  )
  if (!response.ok) {
    throw new Error('Error fetching username validation')
  }
  return response.json()
}

async function addNewUser({
  firstName,
  lastName,
  username,
  password,
}: UserInfo) {
  const response = await fetch('https://dummyjson.com/users/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: firstName,
      lastName: lastName,
      username: username,
      password: password,
    }),
  })
  if (!response.ok) {
    throw new Error('Error adding new user')
  }
  return response.json()
}

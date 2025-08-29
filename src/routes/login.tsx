import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useAuth } from '../auth'

interface getLoginInfoProp {
  name: string
  password: string
}

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const auth = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const loginInfo = useMutation({
    mutationFn: () => getLoginInfo({ name, password }),
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

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    console.log(name, password)
    loginInfo.mutate()
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="flex flex-col space-y-4 rounded-lg bg-white p-8 shadow-lg"
      >
        <h1 className="text-center text-2xl font-bold text-gray-800">Login</h1>
        {loginInfo.isError && (
          <p className="text-center font-bold text-red-500">
            Invalid username or password.
          </p>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Username"
          className="rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="rounded border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 p-2 font-bold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loginInfo.isPending}
        >
          {loginInfo.isPending ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

async function getLoginInfo({ name, password }: getLoginInfoProp) {
  const response = await fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: name,
      password: password,
    }),
    credentials: 'omit',
  })
  if (!response.ok) {
    throw new Error('Error fetching login info')
  }
  return response.json()
}

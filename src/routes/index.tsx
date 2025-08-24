import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <div className="flex justify-center items-center h-screen w-screen bg-gray-100 text-3xl font-bold">
        This is the Home
      </div>
    </>
  )
}

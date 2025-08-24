import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/products')({
  component: Products,
})

function Products() {
  const [currentCategory, setCurrentCategory] = useState('all')

  return (
    <>
      <CategorySelector
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />
    </>
  )
}

function CategorySelector({ currentCategory, setCurrentCategory }) {
  const listOfCategories = useQuery({
    queryKey: ['category'],
    queryFn: getCategories,
    staleTime: Infinity,
  })

  console.log(currentCategory)

  if (listOfCategories.isPending) {
    return (
      <>
        <select>
          <option key="loading">Loading...</option>;
        </select>
      </>
    )
  }

  return (
    <>
      <select
        value={currentCategory}
        onChange={(e) => setCurrentCategory(e.target.value)}
      >
        <option key="all" value="all">
          All
        </option>
        {listOfCategories.data.map((e) => {
          return (
            <option key={e.slug} value={e.slug}>
              {e.name}
            </option>
          )
        })}
      </select>
    </>
  )
}

async function getCategories() {
  const response = await fetch('https://dummyjson.com/products/categories')
  if (!response.ok) {
    throw new Error('Error fetching categories')
  }
  return response.json()
}

async function getProducts() {
  const response = await fetch('https://dummyjson.com/products')
  if (!response.ok) {
    throw new Error('Error fetching products')
  }
  return response.json()
}

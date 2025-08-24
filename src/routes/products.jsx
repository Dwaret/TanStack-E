import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
      <ListOfProducts />
    </>
  )
}

function ListOfProducts() {
  const queryClient = useQueryClient()
  const ListOfProducts = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => getProducts({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const morePagesExist = lastPage.total > allPages.length * 10
      if (!morePagesExist) return undefined
      return allPages.length + 1
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
  console.log(ListOfProducts.data.pages)
  return (
    <>
      {ListOfProducts.data?.pages.map((page, i) => (
        <div key={i}>
          {page.products.map((product) => (
            <div key={product.id}>
              <h3>{product.title}</h3>
              <p>${product.price}</p>
              <img src={product.thumbnail} alt={product.title} />
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => ListOfProducts.fetchNextPage()}>Load More</button>
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

async function getProducts({ page }) {
  console.log(page)
  const skip = page * 10 - 10
  const response = await fetch(
    `https://dummyjson.com/products?limit=10&skip=${skip}&select=title,price,thumbnail`,
  )
  if (!response.ok) {
    throw new Error('Error fetching products')
  }
  return response.json()
}

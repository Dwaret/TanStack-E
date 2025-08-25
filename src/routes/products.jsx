import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

const productSchema = z.object({
  category: z.string().optional().default('all'),
  sortOrder: z.string().optional().default('title-asc'),
  query: z.string().optional(),
})

export const Route = createFileRoute('/products')({
  component: Products,
  search: (search) => productSchema.parse(search),
})

function Products() {
  const { category, sortOrder, query } = Route.useSearch()
  const navigate = useNavigate()

  const handleCategoryChange = (newCategory) => {
    navigate({
      search: { category: newCategory, sortOrder: sortOrder, query: '' },
    })
  }

  const handleSortChange = (newSortOrder) => {
    navigate({
      search: { category: category, sortOrder: newSortOrder, query: query },
    })
  }

  const handleQueryChange = (newQuery) => {
    navigate({
      search: { category: 'all', sortOrder: 'title-asc', query: newQuery },
    })
  }

  return (
    <>
      <CategorySelector
        category={category}
        onCategoryChange={handleCategoryChange}
      />
      <SortSelector sortOrder={sortOrder} onSortChange={handleSortChange} />
      <SearchBox query={query} onQueryChange={handleQueryChange} />
      <ListOfProducts category={category} sortOrder={sortOrder} query={query} />
    </>
  )
}

function ListOfProducts({ category, sortOrder, query }) {
  const listOfProducts = useInfiniteQuery({
    queryKey: ['products', category, sortOrder, query],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ page: pageParam }, category, sortOrder, query),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.total >= allPages.length * 20
        ? allPages.length + 1
        : undefined
    },
  })
  return (
    <>
      {listOfProducts.data?.pages.map((page, i) => (
        <div key={i}>
          {page.products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-300 m-2.5 p-2.5 inline-block"
            >
              <h3>{product.title}</h3>
              <p>${product.price}</p>
              <img src={product.thumbnail} alt={product.title} />
            </div>
          ))}
        </div>
      ))}
      {listOfProducts.hasNextPage ? (
        <button
          onClick={() => listOfProducts.fetchNextPage()}
          className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 m-auto block"
          disabled={listOfProducts.isFetchingNextPage}
        >
          {listOfProducts.isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      ) : null}
    </>
  )
}

function CategorySelector({ category, onCategoryChange }) {
  const listOfCategories = useQuery({
    queryKey: ['category'],
    queryFn: getCategories,
    staleTime: Infinity,
  })
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
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option key="all" value="">
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

function SortSelector({ sortOrder, onSortChange }) {
  return (
    <>
      <select value={sortOrder} onChange={(e) => onSortChange(e.target.value)}>
        <option value="title-asc">Name: A to Z</option>
        <option value="title-desc">Name: Z to A</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </>
  )
}

function SearchBox({ query, onQueryChange }) {
  const [queryInput, setQueryInput] = useState('')

  return (
    <>
      <form>
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search products..."
        />
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault()
            setQueryInput('')
            onQueryChange(queryInput)
          }}
        >
          Search
        </button>
      </form>
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

async function getProducts(
  { page },
  category = '',
  sort = 'title-asc',
  query = '',
) {
  const skip = page * 20 - 20
  let response

  category = category ? `/category/${category}` : ''

  sort = sort.split('-')
  if (query) {
    response = await fetch(
      `https://dummyjson.com/products${`/search?q=${encodeURIComponent(query)}`}&limit=20&skip=${skip}&select=title,price,thumbnail&sortBy=${sort[0]}&order=${sort[1]}`,
    )
  } else {
    response = await fetch(
      `https://dummyjson.com/products${category}?limit=20&skip=${skip}&select=title,price,thumbnail&sortBy=${sort[0]}&order=${sort[1]}`,
    )
  }
  if (!response.ok) {
    throw new Error('Error fetching products')
  }
  return response.json()
}

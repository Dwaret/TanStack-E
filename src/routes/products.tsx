import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

interface Product {
  id: number
  title: string
  price: number
  thumbnail: string
}

interface ProductResponse {
  products: Array<Product>
  total: number
  skip: number
  limit: number
}

const productSearchSchema = z.object({
  category: z.string().optional().default('all'),
  sortOrder: z.string().optional().default('title-asc'),
  query: z.string().optional().default(''),
})

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  component: Products,
})

function Products() {
  const { category, sortOrder, query } = Route.useSearch()
  const navigate = useNavigate()

  const handleCategoryChange = (newCategory: string) => {
    navigate({
      search: { category: newCategory, sortOrder: sortOrder, query: '' },
    })
  }

  const handleSortChange = (newSortOrder: string) => {
    navigate({
      search: { category: category, sortOrder: newSortOrder, query: query },
    })
  }

  const handleQueryChange = (newQuery: string) => {
    navigate({
      search: { category: 'all', sortOrder: 'title-asc', query: newQuery },
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <CategorySelector
          category={category}
          onCategoryChange={handleCategoryChange}
        />
        <SortSelector sortOrder={sortOrder} onSortChange={handleSortChange} />
        <SearchBox onQueryChange={handleQueryChange} />
      </div>
      <ListOfProducts category={category} sortOrder={sortOrder} query={query} />
    </div>
  )
}

function ListOfProducts({
  category = 'all',
  sortOrder = 'title-asc',
  query = '',
}) {
  const listOfProducts = useInfiniteQuery<ProductResponse>({
    queryKey: ['products', category, sortOrder, query],
    queryFn: ({ pageParam = 1 }) => {
      return getProducts(
        { page: pageParam } as { page: number },
        category,
        sortOrder,
        query,
      )
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedItems = lastPage.skip + lastPage.products.length
      return fetchedItems < lastPage.total ? allPages.length + 1 : undefined
    },
  })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listOfProducts.data?.pages.map((page, i) => (
        <div key={i} className="contents">
          {page.products.map((product) => (
            <Link
              to="/$productId"
              params={{ productId: String(product.id) }}
              key={product.id}
            >
              <div className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {product.title}
                </h3>
                <p className="text-xl font-bold text-indigo-600 mt-2">
                  ${product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ))}
      {listOfProducts.hasNextPage ? (
        <button
          onClick={() => listOfProducts.fetchNextPage()}
          className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 col-span-full mx-auto my-8"
          disabled={listOfProducts.isFetchingNextPage}
        >
          {listOfProducts.isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      ) : null}
    </div>
  )
}

function CategorySelector({
  category,
  onCategoryChange,
}: {
  category: string
  onCategoryChange: (newCategory: string) => void
}) {
  const listOfCategories = useQuery({
    queryKey: ['category'],
    queryFn: getCategories,
    staleTime: Infinity,
  })
  if (listOfCategories.isPending) {
    return (
      <select className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option>Loading...</option>
      </select>
    )
  }

  return (
    <select
      value={category}
      onChange={(e) => onCategoryChange(e.target.value)}
      className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="all">All Categories</option>
      {listOfCategories.data.map((e: { name: string; slug: string }) => {
        return (
          <option key={e.slug} value={e.slug}>
            {e.name}
          </option>
        )
      })}
    </select>
  )
}

function SortSelector({
  sortOrder,
  onSortChange,
}: {
  sortOrder: string
  onSortChange: (newSortOrder: string) => void
}) {
  return (
    <select
      value={sortOrder}
      onChange={(e) => onSortChange(e.target.value)}
      className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="title-asc">Name: A to Z</option>
      <option value="title-desc">Name: Z to A</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  )
}

function SearchBox({
  onQueryChange,
}: {
  onQueryChange: (newQuery: string) => void
}) {
  const [queryInput, setQueryInput] = useState('')

  return (
    <form className="flex">
      <input
        type="text"
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
        placeholder="Search products..."
        className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          onQueryChange(queryInput)
          setQueryInput('')
        }}
        className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-r-md transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Search
      </button>
    </form>
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
  { page }: { page: number },
  category = 'all',
  sort = 'title-asc',
  query = '',
) {
  const skip = page * 20 - 20

  const sortSplit = sort.split('-')
  const params = new URLSearchParams({
    limit: '20',
    skip: skip.toString(),
    select: 'id,title,price,thumbnail',
    sortBy: sortSplit[0],
    order: sortSplit[1],
  })

  let endpoint = 'https://dummyjson.com/products'
  if (query) {
    endpoint += `/search`
    params.set('q', query)
  } else if (category !== 'all') {
    endpoint += `/category/${category}`
  }

  const response = await fetch(`${endpoint}?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error fetching products')
  }
  return response.json()
}

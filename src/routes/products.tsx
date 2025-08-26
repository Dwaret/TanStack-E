import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

interface ListOfProductsProps {
  category?: string
  sortOrder?: string
  query?: string
}

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
  component: Products,
  validateSearch: (search) => productSearchSchema.parse(search),
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
    <>
      <CategorySelector
        category={category}
        onCategoryChange={handleCategoryChange}
      />
      <SortSelector sortOrder={sortOrder} onSortChange={handleSortChange} />
      <SearchBox onQueryChange={handleQueryChange} />
      <ListOfProducts category={category} sortOrder={sortOrder} query={query} />
    </>
  )
}

function ListOfProducts({
  category = 'all',
  sortOrder = 'title-asc',
  query = '',
}: ListOfProductsProps) {
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
      <>
        <select>
          <option key="loading">Loading...</option>
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
        <option key="all" value="all">
          All
        </option>
        {listOfCategories.data.map((e: { name: string; slug: string }) => {
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

function SortSelector({
  sortOrder,
  onSortChange,
}: {
  sortOrder: string
  onSortChange: (newSortOrder: string) => void
}) {
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

function SearchBox({
  onQueryChange,
}: {
  onQueryChange: (newQuery: string) => void
}) {
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

import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'

interface ProductInCart {
  id: number
  title: string
  price: number
  quantity: number
  total: number
  discountPercentage: number
  discountedTotal: number
  thumbnail: string
}

export const Route = createFileRoute('/_auth/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  const cart = useQuery({
    queryKey: ['cart', auth.user?.id],
    queryFn: () => getCart(auth.user?.id || 1),
  })

  if (cart.isPending) {
    return <div>Loading...</div>
  }

  if (!cart.data?.carts?.length) {
    return <div>No items in cart</div>
  }

  return (
    <>
      <ListOfItemsInCart
        products={cart.data?.carts[0]?.products}
        cartId={cart.data?.carts[0]?.id}
      />
    </>
  )
}

function ListOfItemsInCart({
  products,
  cartId,
}: {
  products: Array<ProductInCart>
  cartId: number
}) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const updateItemAmount = useMutation({
    mutationFn: updateAmountInCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', auth.user?.id] })
    },
  })

  return (
    <ul className="divide-y divide-gray-200">
      {products.map((e) => (
        <li
          key={e.id}
          className="flex items-center space-x-4 py-4 px-2 hover:bg-gray-50 transition-colors duration-200"
        >
          <img
            src={e.thumbnail}
            alt="Product thumbnail"
            className="w-16 h-16 object-cover rounded-md shadow-sm flex-shrink-0"
          />
          <div className="flex-grow text-gray-800 font-medium">{e.title}</div>
          <button
            type="button"
            onClick={() => {
              const updatedItem = {
                newItemAmount: e.quantity - 1,
                itemId: e.id,
                cartId: cartId,
              }
              updateItemAmount.mutate(updatedItem)
            }}
          >
            -
          </button>
          <div className="text-gray-600 font-medium text-sm">
            Qty: {e.quantity}
          </div>
          <button
            type="button"
            onClick={() => {
              const updatedItem = {
                newItemAmount: e.quantity + 1,
                itemId: e.id,
                cartId: cartId,
              }
              updateItemAmount.mutate(updatedItem)
            }}
          >
            +
          </button>
          <div className="text-gray-800 font-semibold">
            ${e.price.toFixed(2)}
          </div>
          <div className="text-gray-700 text-sm">
            Subtotal: ${e.total.toFixed(2)}
          </div>
          {e.discountedTotal && e.discountedTotal !== e.total && (
            <div className="text-green-600 font-bold text-sm">
              Disc: ${e.discountedTotal.toFixed(2)}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

async function getCart(id: number) {
  const response = await fetch(`https://dummyjson.com/carts/user/${id}`)
  if (!response.ok) {
    throw new Error('Error fetching user cart')
  }
  return response.json()
}

async function updateAmountInCart({
  newItemAmount,
  itemId,
  cartId,
}: {
  newItemAmount: number
  itemId: number
  cartId: number
}) {
  const response = await fetch(`https://dummyjson.com/carts/${cartId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merge: true, // this will include existing products in the cart
      products: [
        {
          id: itemId,
          quantity: newItemAmount,
        },
      ],
    }),
  })
  if (!response.ok) {
    throw new Error('Error updating cart')
  }
  return response.json()
}

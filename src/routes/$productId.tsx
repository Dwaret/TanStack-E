import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export const Route = createFileRoute('/$productId')({
  component: ProductDisplay,
})

function ProductDisplay() {
  const [currentImage, setCurrentImage] = useState(0)
  const { productId } = Route.useParams()
  const product = useQuery({
    queryKey: [productId],
    queryFn: () => getProduct(productId),
  })
  if (product.isPending) {
    return <div>Loading...</div>
  }

  const { images } = product.data
  const { reviews } = product.data
  console.log(product.data)

  const handleNext = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length)
  }

  const handlePrev = () => {
    setCurrentImage(
      (prevImage) => (prevImage - 1 + images.length) % images.length,
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Slider Section */}
        <div className="lg:w-1/2">
          <div className="relative w-full max-w-2xl mx-auto overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentImage * 100}%)` }}
            >
              {images.map((imgSrc: string, index: number) => (
                <div key={index} className="w-full flex-shrink-0">
                  <img
                    src={imgSrc}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ))}
            </div>

            <button
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100"
              onClick={handlePrev}
            >
              &#10094;
            </button>
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100"
              onClick={handleNext}
            >
              &#10095;
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 mt-4 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">
            {product.data.title}
          </h1>

          <div className="flex items-center my-2 text-yellow-400">
            <span className="ml-2 text-gray-600 text-sm">
              {product.data.rating}
              <span className="text-yellow-400 ml-1">{'★'}</span>
            </span>
          </div>

          <p className="mt-4 text-gray-700">{product.data.description}</p>

          <div className="mt-6">
            <span className="text-2xl font-semibold text-gray-900">
              ${product.data.price}
            </span>
          </div>

          <button className="mt-6 w-full lg:w-1/2 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 p-6 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Customer Reviews
        </h2>
        <div className="space-y-6">
          {reviews.map((e: Review) => {
            return (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {e.reviewerName}
                  </span>
                  <span className="text-yellow-400 ml-3">
                    {'★'.repeat(e.rating)}
                    {'☆'.repeat(5 - e.rating)}
                  </span>
                </div>
                <p className="text-gray-700">{e.comment}</p>
                <span className="text-sm text-gray-500 mt-2 block">
                  Reviewed on {e.date.slice(0, 10)}
                </span>
              </div>
            )
          })}
          <button className="mt-8 py-2 px-4 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold transition-colors duration-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Write a Review
          </button>
        </div>
      </div>
    </div>
  )
}

async function getProduct(productId: string) {
  const response = await fetch(`https://dummyjson.com/products/${productId}`)
  if (!response.ok) {
    throw new Error('Unable to fetch products')
  }
  return response.json()
}

import { useSearchParams } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

function PaymentStatus() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const orderId = params.get('order_id')
  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbc2a6]/60 via-[#e8d8c0]/50 to-[#f8f2e7]/80 backdrop-blur-md px-4">
      <div className="bg-white/70 backdrop-blur-md border border-[#99744a]/30 shadow-xl rounded-3xl p-10 text-center max-w-md w-full transition-transform hover:scale-[1.02] duration-300">
        {isSuccess ? (
          <>
            <FaCheckCircle className="text-[#4CAF50] text-6xl mb-4 mx-auto animate-pulse drop-shadow-md" />
            <h2 className="text-3xl font-bold text-[#414a37] mb-2">
              Payment Successful!
            </h2>
            <p className="text-[#6b5b43] mb-6 font-medium">
              Order ID: <span className="font-semibold">{orderId}</span>
            </p>
            <div className="bg-green-100 text-green-800 font-semibold py-2 rounded-lg mb-6 shadow-inner">
              Thank you for your payment 💳
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mb-4 mx-auto animate-bounce drop-shadow-md" />
            <h2 className="text-3xl font-bold text-[#8b2e2e] mb-2">
              Payment Failed
            </h2>
            <p className="text-[#6b5b43] mb-6 font-medium">
              Order ID: <span className="font-semibold">{orderId}</span>
            </p>
            <div className="bg-red-100 text-red-800 font-semibold py-2 rounded-lg mb-6 shadow-inner">
              Please try again or contact support.
            </div>
          </>
        )}

        <a
          href="/"
          className="inline-block bg-[#99744a] hover:bg-[#b58a5c] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300"
        >
          ⬅ Back to Home
        </a>
      </div>
    </div>
  )
}

export default PaymentStatus

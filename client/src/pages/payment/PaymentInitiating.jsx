import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FaCreditCard,
  FaLock,
  FaPercentage,
  FaCalendarAlt,
  FaShieldAlt,
} from 'react-icons/fa'
import api from '../../service/api'
import Sidebar from '../../components/SideBar'

function PaymentInitiating() {
  const [params] = useSearchParams()
  const order_id = params.get('order_id')
  const baseAmount = parseFloat(params.get('amount'))
  const [amount, setAmount] = useState(baseAmount)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  //  Card format logic
  const formatCardNumber = value => {
    let digits = value.replace(/\D/g, '')
    if (!digits.startsWith('453')) digits = '453' + digits.slice(3)
    digits = digits.slice(0, 16)
    return digits.replace(/(.{4})/g, '$1-').replace(/-$/, '')
  }

  const handleCardNumberChange = e =>
    setCardNumber(formatCardNumber(e.target.value))
  const handleExpiryChange = e => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
    setExpiry(val)
  }
  const handleCvvChange = e =>
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))

  const applyDiscount = () => {
    if (discountApplied) return setError('Discount already applied.')
    if (discountCode.trim().toUpperCase() === 'NEXUS777') {
      setAmount(prev => Math.max(prev - 1000, 0).toFixed(2))
      setDiscountApplied(true)
      setError('')
    } else setError('Invalid discount code.')
  }

  const handlePayNow = () => {
    const rawCardNumber = cardNumber.replace(/-/g, '')
    if (!/^453\d{13}$/.test(rawCardNumber))
      return setError('Card number must be 16 digits and start with 453.')
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      return setError('Expiry must be in MM/YY format.')
    if (!/^\d{3,4}$/.test(cvv)) return setError('CVV must be 3 or 4 digits.')

    setIsProcessing(true)
    setError('')
    api
      .post('v1/payment/status/', { order_id, status: 'success' })
      .then(res => {
        if (res.data.redirect_url) window.location.href = res.data.redirect_url
      })
      .catch(() => setError('Failed to process payment. Please try again.'))
      .finally(() => setIsProcessing(false))
  }

  const showVisaIcon = cardNumber.replace(/-/g, '').startsWith('453')

  return (
    <div className="flex min-h-screen bg-[#dbc2a6] text-[#414a37]">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center px-6 py-10 ml-0 md:ml-64">
        <div className="w-full max-w-md bg-[#fffaf4] rounded-2xl shadow-xl p-8 border border-[#99744a]/30">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#414a37]">
            Complete Your Payment
          </h2>

          {/* Order info box */}
          <div className="bg-[#99744a] text-white rounded-xl px-6 py-4 mb-6 shadow-md">
            <p className="text-sm">
              Order ID: <strong>{order_id}</strong>
            </p>
            <p className="text-xl font-semibold mt-2">Amount: ₹{amount}</p>
          </div>

          {/* Input fields */}
          <div className="space-y-4">
            {/* Card Number */}
            <div className="relative">
              <FaCreditCard className="absolute left-3 top-3 text-[#99744a]/70" />
              {showVisaIcon && (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                  alt="Visa"
                  className="absolute right-3 top-2 w-10 h-6"
                />
              )}
              <input
                type="text"
                placeholder="Card Number (starts with 453)"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-full bg-[#dbc2a6]/40 px-10 py-3 rounded-lg outline-none border border-[#99744a]/30 focus:ring-2 focus:ring-[#99744a]/50 transition"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="flex gap-4">
              <div className="relative w-1/2">
                <FaCalendarAlt className="absolute left-3 top-3 text-[#99744a]/70" />
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  maxLength={5}
                  onChange={handleExpiryChange}
                  className="pl-10 bg-[#dbc2a6]/40 px-4 py-3 rounded-lg w-full border border-[#99744a]/30 outline-none focus:ring-2 focus:ring-[#99744a]/50 transition"
                />
              </div>
              <div className="relative w-1/2">
                <FaShieldAlt className="absolute left-3 top-3 text-[#99744a]/70" />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  maxLength={4}
                  onChange={handleCvvChange}
                  className="pl-10 bg-[#dbc2a6]/40 px-4 py-3 rounded-lg w-full border border-[#99744a]/30 outline-none focus:ring-2 focus:ring-[#99744a]/50 transition"
                />
              </div>
            </div>

            {/* Discount Code */}
            <div className="flex gap-2 items-center">
              <FaPercentage className="text-[#99744a]" />
              <input
                type="text"
                placeholder="Discount Code"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                disabled={discountApplied}
                className="flex-1 bg-[#dbc2a6]/40 px-4 py-2 rounded-lg outline-none border border-[#99744a]/30 focus:ring-2 focus:ring-[#99744a]/50 disabled:opacity-50 transition"
              />
              <button
                onClick={applyDiscount}
                disabled={discountApplied}
                className="bg-[#99744a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#82603c] transition disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            {/* Error message */}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            {/* Pay Now */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full bg-[#99744a] hover:bg-[#82603c] text-white py-3 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-[#5a4e3d] mt-6 text-center flex items-center justify-center gap-2">
            <FaLock /> Secured by <span className="font-semibold">N-Drive</span>
          </p>
        </div>
      </main>
    </div>
  )
}

export default PaymentInitiating

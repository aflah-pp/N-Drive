import React, { useEffect, useState } from 'react'
import api from '../../service/api'
import { useNavigate } from 'react-router-dom'

function BillingPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPackage, setCurrentPackage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await api.get('v1/package/')
        setPlans(plansRes.data)

        const currentRes = await api.get('v1/self/package/')
        setCurrentPackage(currentRes.data?.package?.toLowerCase() || null)
      } catch (error) {
        console.error('Failed to load plans or current package:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBuy = async plan => {
    try {
      const response = await api.post('v1/payment/initiate/', {
        package_id: plan.id,
        price: plan.price,
      })

      if (response.data?.order_id) {
        navigate(
          `/payment?order_id=${response.data.order_id}&amount=${plan.price}`
        )
      } else {
        alert('Error initiating payment: Missing order_id')
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Failed to start payment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-[#414a37] text-xl">
        Loading plans...
      </div>
    )
  }

  return (
    <section className="text-[#414a37] py-12 px-4">
      <div className="max-w-screen-xl mx-auto ">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight">
            Choose the Plan That Fits Your Needs
          </h2>
          <p className="mb-5 text-[#5a4e3d] sm:text-lg">
            Pick the right balance of features and value — start small or go all
            in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map(plan => {
            const planName = plan.name.toLowerCase()
            const isCurrent = planName === currentPackage

            const FEATURES_MAP = {
              free: [
                'Storage: 25MB',
                'Chat: Disabled',
                'Image generation: Disabled',
                'Premium support: None',
                'Updates: None',
              ],
              basic: [
                'Storage: 50MB',
                'Chat: Enabled',
                'Image generation: Disabled',
                'Premium support: Lifetime',
                'Updates: Lifetime',
              ],
              pro: [
                'Storage: 100MB',
                'Chat: Enabled',
                'Image generation: Enabled',
                'Premium support: Lifetime',
                'Updates: Lifetime',
              ],
            }

            const features = FEATURES_MAP[plan.name.toLowerCase()] || []

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-6 mx-auto max-w-lg text-center rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'border-[#99744a] bg-[#dbc2a6]/80 shadow-xl scale-[1.02]'
                    : 'border-[#99744a]/30 bg-[#dbc2a6]/60 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 bg-[#99744a] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    ⭐ Current Plan
                  </span>
                )}

                <h3 className="mb-4 text-2xl font-semibold capitalize">
                  {plan.name}
                </h3>

                <p className="mb-4 text-[#5a4e3d] sm:text-base">
                  {plan.name === 'free'
                    ? 'Perfect for trying out N-Drive with limited features.'
                    : plan.name === 'basic'
                    ? 'Great for small teams or personal workflows.'
                    : 'For pros who want full features and speed.'}
                </p>

                <div className="flex justify-center items-baseline my-6">
                  <span className="mr-2 text-5xl font-extrabold text-[#99744a]">
                    ₹{plan.price}
                  </span>
                </div>

                <ul className="mb-8 space-y-3 text-left">
                  {features.map((f, idx) => (
                    <Feature key={idx} text={f} />
                  ))}
                </ul>

                <button
                  onClick={() => handleBuy(plan)}
                  disabled={isCurrent}
                  className={`w-full font-medium rounded-xl text-sm px-5 py-3 text-center transition ${
                    isCurrent
                      ? 'bg-[#b0a190] text-white cursor-not-allowed'
                      : 'bg-[#99744a] text-white hover:bg-[#82603c] focus:ring-4 focus:ring-[#dbc2a6]'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Buy Now'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Feature({ text }) {
  return (
    <li className="flex items-center space-x-3 text-[#414a37]">
      <svg
        className="flex-shrink-0 w-5 h-5 text-[#99744a]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{text}</span>
    </li>
  )
}

export default BillingPage

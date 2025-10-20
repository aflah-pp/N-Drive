import React, { useState } from 'react'
import { FiImage, FiDownload, FiRefreshCcw, FiLoader } from 'react-icons/fi'
import api from '../service/api'

function ImgGenUI() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const imgGeneration = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first!')
      return
    }
    setError('')
    setLoading(true)
    setImageUrl('')

    try {
      const res = await api.post('v1/img/gen/', { prompt })
      setImageUrl(res.data.image_base64)
    } catch (err) {
      setError('Failed to generate image. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    window.open(imageUrl, '_blank')
  }

  const reset = () => {
    setPrompt('')
    setImageUrl('')
    setError('')
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#dbc2a6] to-[#b89a7c] min-h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center w-full">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <FiImage className="text-[#414a37] w-7 h-7" />
          <h1 className="text-2xl font-semibold text-[#414a37]">
            AI Image Generator
          </h1>
        </div>

        {/* Input & Button */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-6 w-full max-w-3xl">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your image (e.g., 'a futuristic city skyline at night')"
            className="flex-1 px-4 py-3 border border-[#99744a]/50 rounded-xl bg-[#dbc2a6]/50 focus:outline-none focus:ring-2 focus:ring-[#99744a] text-[#414a37] placeholder-[#99744a]"
          />
          <button
            onClick={imgGeneration}
            disabled={loading}
            className="flex items-center justify-center bg-[#99744a] hover:bg-[#b89a7c] text-white px-5 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? (
              <FiLoader className="animate-spin w-5 h-5" />
            ) : (
              'Generate'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#414a37]">
            <FiLoader className="animate-spin w-8 h-8 mb-2" />
            <p>AI is generating your image...</p>
          </div>
        )}

        {/* Image Result */}
        {imageUrl && !loading && (
          <div className="flex flex-col items-center mt-6">
            <div className="relative">
              <img
                src={imageUrl}
                alt="Generated"
                className="rounded-xl shadow-md max-h-[400px] object-contain border border-[#99744a]"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="bg-[#dbc2a6]/70 p-2 rounded-lg shadow hover:bg-[#dbc2a6]/90 transition"
                  title="Download"
                >
                  <FiDownload className="w-5 h-5 text-[#414a37]" />
                </button>
                <button
                  onClick={reset}
                  className="bg-[#dbc2a6]/70 p-2 rounded-lg shadow hover:bg-[#dbc2a6]/90 transition"
                  title="Reset"
                >
                  <FiRefreshCcw className="w-5 h-5 text-[#414a37]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!imageUrl && !loading && !error && (
          <div className="text-[#414a37]/80 mt-16 text-center">
            Describe something awesome and click <strong>Generate</strong>!
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-[#414a37]/70 text-sm mt-6 text-center">
        Built with ❤️ using N-Drive AI Engine
      </p>
    </div>
  )
}

export default ImgGenUI

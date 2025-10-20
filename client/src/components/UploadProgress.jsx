import React from 'react'

function UploadProgress({ progress, uploadedMB, totalMB }) {
  return (
    <div className="fixed bottom-5 right-5 bg-white/90 border border-[#99744a]/30 rounded-xl shadow-xl p-4 w-72 z-50">
      <h3 className="text-sm font-semibold text-[#414a37] mb-2">
        Uploading...
      </h3>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-[#99744a] h-3 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-[#5a4e3d]">
        {uploadedMB.toFixed(2)} MB / {totalMB.toFixed(2)} MB (
        {progress.toFixed(1)}%)
      </p>
    </div>
  )
}

export default UploadProgress

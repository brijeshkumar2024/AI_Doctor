import React from 'react'

const ReportStatusTracker = ({ status, stage, stageMessage, queuePosition, isLive }) => {
  const STEPS = [
    { key: 'queued', label: 'Queued', icon: '📋' },
    { key: 'ocr', label: 'Text Extraction', icon: '🔍' },
    { key: 'gemini', label: 'Gemini AI', icon: '✨' },
    { key: 'groq', label: 'LLaMA 3 AI', icon: '🦙' },
    { key: 'comparison', label: 'Comparison', icon: '⚖️' },
    { key: 'completed', label: 'Complete', icon: '✅' }
  ]

  const stageToStepIndex = {
    queued: 0,
    ocr_started: 1,
    ocr_completed: 1,
    gemini_started: 2,
    gemini_completed: 2,
    groq_started: 3,
    groq_completed: 3,
    comparison_started: 4,
    metrics_extraction: 4,
    completed: 5
  }

  const currentStepIndex = status === 'completed' ? 5 : status === 'failed' ? -1 : stageToStepIndex[stage] ?? -1

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Processing Status</h3>
        <div className="text-sm font-medium">
          {isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
              Live
            </span>
          ) : status !== 'completed' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              Polling
            </span>
          ) : null}
        </div>
      </div>

      {status === 'failed' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">❌ Analysis Failed</p>
          <p className="mt-1 text-sm">{stageMessage || 'The analysis could not be completed. Please try again.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stepper */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const isPast = index < currentStepIndex
              const isActive = index === currentStepIndex
              const isFuture = index > currentStepIndex

              return (
                <div key={step.key} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold transition-all ${
                      isPast
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'animate-spin bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isPast ? '✓' : step.icon}
                  </div>

                  {/* Label */}
                  <p className={`mt-2 text-xs font-medium text-center ${isPast ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </p>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute mt-6 h-1 w-12 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ transform: 'translateX(56px)' }}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Status message */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            {status === 'queued' ? (
              <p className="text-sm text-blue-800">
                <span className="font-medium">📋 Queued:</span> You are <strong>#{queuePosition}</strong> in the queue
              </p>
            ) : (
              <p className="text-sm text-blue-800">
                <span className="font-medium">⚙️ Processing:</span> {stageMessage && <span>{stageMessage}</span>}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportStatusTracker

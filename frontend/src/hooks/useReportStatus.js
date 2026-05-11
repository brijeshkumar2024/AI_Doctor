import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from './useSocket'

export const useReportStatus = (reportId, initialStatus) => {
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()

  const [status, setStatus] = useState(initialStatus)
  const [stage, setStage] = useState(null)
  const [stageMessage, setStageMessage] = useState(null)
  const [queuePosition, setQueuePosition] = useState(null)
  const [isLive, setIsLive] = useState(false)

  // Polling fallback — only runs if socket disconnected
  // AND report is not yet complete
  useEffect(() => {
    const isTerminal = ['completed', 'failed'].includes(status)
    if (isConnected || isTerminal || !reportId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
        const data = await res.json()
        if (data.success) {
          setStatus(data.data?.report?.processingStatus || data.data?.processingStatus)
        }
      } catch (err) {
        console.warn('Polling fallback error:', err)
      }
    }, 10000) // 10s fallback (not 5s — socket is primary)

    return () => clearInterval(interval)
  }, [isConnected, status, reportId])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !reportId) return

    // Subscribe to this specific report
    socket.emit('subscribe:report', reportId)
    setIsLive(true)

    const onQueued = (data) => {
      if (data.reportId !== reportId) return
      setStatus('queued')
      setQueuePosition(data.queuePosition)
      setStageMessage(data.message)
    }

    const onProcessing = (data) => {
      if (data.reportId !== reportId) return
      setStatus('processing')
      setStage(data.stage)
      setStageMessage(data.message)
      setQueuePosition(null)
    }

    const onCompleted = (data) => {
      if (data.reportId !== reportId) return
      setStatus('completed')
      setStage('completed')
      setStageMessage(data.message)
      // Invalidate React Query cache to refetch full report
      queryClient.invalidateQueries(['report', reportId])
      queryClient.invalidateQueries(['reports'])
    }

    const onFailed = (data) => {
      if (data.reportId !== reportId) return
      setStatus('failed')
      setStage('failed')
      setStageMessage(data.message)
    }

    socket.on('report:queued', onQueued)
    socket.on('report:processing', onProcessing)
    socket.on('report:completed', onCompleted)
    socket.on('report:failed', onFailed)

    return () => {
      socket.emit('unsubscribe:report', reportId)
      socket.off('report:queued', onQueued)
      socket.off('report:processing', onProcessing)
      socket.off('report:completed', onCompleted)
      socket.off('report:failed', onFailed)
      setIsLive(false)
    }
  }, [socket, reportId, queryClient])

  return { status, stage, stageMessage, queuePosition, isLive }
}

import { useState, useEffect } from 'react'
import { getSocket } from '../services/socket'

export const useSocket = () => {
  const socket = getSocket()
  const [isConnected, setIsConnected] = useState(
    socket?.connected ?? false
  )

  useEffect(() => {
    if (!socket) return

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  return { socket, isConnected }
}

import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => socket

export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
    auth: { token: accessToken },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  })

  socket.on('connect', () => {
    console.info('WebSocket connected:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('WebSocket connection error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.info('WebSocket disconnected:', reason)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

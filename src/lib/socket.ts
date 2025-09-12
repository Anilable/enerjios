import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      autoConnect: false, // Disable auto-connect to prevent polling overhead
    })
  }
  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
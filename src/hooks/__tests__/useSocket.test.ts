import { renderHook, act } from '@testing-library/react'
import { useSocket } from '../useSocket'
import { io } from 'socket.io-client'

// Mock socket.io-client
jest.mock('socket.io-client')
const mockIo = io as jest.MockedFunction<typeof io>

describe('useSocket Hook', () => {
  let mockSocket: any

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: 'test-socket-id'
    }
    
    mockIo.mockReturnValue(mockSocket)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('initializes socket connection', () => {
    const { result } = renderHook(() => useSocket('user-123'))
    
    expect(mockIo).toHaveBeenCalledWith({
      path: '/api/socket',
      autoConnect: true,
    })
    expect(result.current.connected).toBe(true)
  })

  it('joins user room on connection', () => {
    renderHook(() => useSocket('user-123'))
    
    // Simulate connection event
    const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'connect')
    if (onCall) {
      act(() => {
        onCall[1]() // Execute the connect callback
      })
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'user-123')
  })

  it('sends messages correctly', () => {
    const { result } = renderHook(() => useSocket('user-123'))
    
    act(() => {
      result.current.sendMessage('Hello', 'user-456', 'project-789')
    })
    
    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', {
      message: 'Hello',
      senderId: 'user-123',
      receiverId: 'user-456',
      projectId: 'project-789'
    })
  })

  it('handles incoming messages', () => {
    const { result } = renderHook(() => useSocket('user-123'))
    
    // Simulate receiving a message
    const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'new-message')
    if (onCall) {
      act(() => {
        onCall[1]({
          id: 'msg-1',
          message: 'Hello back',
          senderId: 'user-456',
          timestamp: new Date().toISOString()
        })
      })
    }
    
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].message).toBe('Hello back')
  })

  it('handles notifications', () => {
    const { result } = renderHook(() => useSocket('user-123'))
    
    // Simulate receiving a notification
    const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'notification')
    if (onCall) {
      act(() => {
        onCall[1]({
          id: 'notif-1',
          title: 'Test Notification',
          message: 'This is a test',
          type: 'info',
          timestamp: new Date().toISOString()
        })
      })
    }
    
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].title).toBe('Test Notification')
  })

  it('sends typing indicators', () => {
    const { result } = renderHook(() => useSocket('user-123'))
    
    act(() => {
      result.current.startTyping('user-456')
    })
    
    expect(mockSocket.emit).toHaveBeenCalledWith('typing-start', {
      userId: 'user-123',
      receiverId: 'user-456'
    })
  })

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useSocket('user-123'))
    
    unmount()
    
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })
})
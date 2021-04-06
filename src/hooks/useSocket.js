import { useEffect, useCallback,useRef } from 'react'
import io from 'socket.io-client'

export function useSocket (events) {
  const socketRef = useRef();
  useEffect(function () {
    socketRef.current = io.connect();
    for (const key in events) {
      socketRef.current.on(key, events[key])
    }
    return () => {
      socketRef.current.removeAllListeners()
      socketRef.current.close()
    }
  }, [events])

  const onSendMessage = useCallback((eventName, data) => {
    if(socketRef.current) {
      socketRef.current.emit(eventName, data)
    }
  }, [socketRef.current])

  return {
    socketRef,
    onSendMessage
  }
}
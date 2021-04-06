import { useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'

export function useSocket (events) {
  const [socket, setSocket] = useState(null)

  useEffect(function () {
    const newSocket = io.connect('/')
    setSocket(newSocket);
    console.log(newSocket)
    for (const key in events) {
        newSocket.on(key, events[key])
    }
    return () => {
      newSocket.removeAllListeners()
      newSocket.close()
    }
  }, [events])

  const onSendMessage = useCallback((eventName, data) => {
    debugger;
    if(socket) socket.emit(eventName, data)
  }, [socket])

  return {
    socket,
    onSendMessage
  }
}
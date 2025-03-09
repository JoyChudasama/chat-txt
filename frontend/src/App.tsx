import { useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  
  const getMessages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/')
      const data = await response.json()
      console.log(data)
      setMessages(data)  // Assuming data is an array of messages
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  return (
    <>
      <div className="card">
        <button onClick={getMessages}>
          Get Messages
        </button>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App

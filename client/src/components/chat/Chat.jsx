import React, {useState, useEffect} from 'react'
import "./chat.css"
import queryString from "query-string";
import io from 'socket.io-client';

let socket;


export default function Chat({ location }) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // This variable indicates where to connect to the server
  const ENDPOINT = 'localhost:5000';

  useEffect(() => {
    // This is how we are parsing the URL params.
    // Location is a built in react method passed via props. 
    const { name, room } = queryString.parse(location.search)
    // This initalizes the socket object. 
    socket = io(ENDPOINT);

    setName(name)
    setRoom(room)

    // A socket.io method that "emits" certain events
    socket.emit('join', { name, room });

    // When The component unmounts these socket methods will fire off
    // They simply sever the connection with that user
    return () => {
      socket.emit('disconnect');
      socket.off();
    }
  }, [ENDPOINT, location.search])

  // This useEffect handles messages
  useEffect(() => {
    // This listens for an incoming message and then pushes it to the overall messages state
    socket.on('message', (message) => {
      setMessages([...messages, message])
    })
  }, [messages])

  // This sends the messages created in the input. It's the emit that is described
  // on the backend method that is different from the others line: 49.
  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('sendMessage', message, () => {setMessage('')})
    }
  }

  console.log(message, messages)

  return (
    <div>
      <div>
        <input value={message} onChange={(e) => setMessage(e.target.value)}
        onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
        />
      </div>
    </div>
  )
}

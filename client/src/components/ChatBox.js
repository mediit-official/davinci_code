import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import './ChatBox.css';

function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketService.onNewMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketService.off('new-message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (inputMessage.trim()) {
      socketService.sendMessage(inputMessage, (response) => {
        if (response.success) {
          setInputMessage('');
        }
      });
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h4>채팅</h4>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <span className="message-author">{msg.playerName}:</span>
            <span className="message-text">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지 입력..."
          maxLength={200}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

export default ChatBox;

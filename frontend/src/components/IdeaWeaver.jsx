import React, { useState, useEffect, useRef } from 'react';
import './IdeaWeaver.css';

const IdeaWeaver = ({ idea, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const actions = [
    { type: 'EXPLAIN', label: '💡 Explain', icon: '📖' },
    { type: 'BUILD', label: '🛠️ Build Plan', icon: '🛠️' },
    { type: 'RISKS', label: '⚠️ Risks', icon: '⚠️' },
    { type: 'SIMILAR', label: '🔗 Similar', icon: '🔗' },
    { type: 'REFINE', label: '✨ Refine', icon: '✨' }
  ];

  const handleActionClick = async (actionType) => {
    if (!idea) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/weaver/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actionType,
          ideaContent: idea.title + '\n' + idea.description
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([
          ...messages,
          { role: 'user', content: `Action: ${actionType}`, action: actionType },
          { role: 'assistant', content: data.response }
        ]);
        setActiveTab('chat');
      } else {
        alert(`Error: ${data.error || 'Failed to process action'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process action: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    const newMessage = userInput;
    setUserInput('');

    try {
      const response = await fetch('http://localhost:5000/api/weaver/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userMessage: newMessage,
          conversationHistory: messages,
          currentIdea: idea ? idea.title + '\n' + idea.description : ''
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.conversationHistory);
      } else {
        alert(`Error: ${data.error || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  if (!idea) {
    return (
      <div className="weaver-container">
        <div className="weaver-empty">
          <p>Select an idea to start weaving!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weaver-container">
      <div className="weaver-header">
        <h3>💫 Idea Weaver {loading ? '...' : ''}</h3>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="clear-btn" onClick={clearHistory} disabled={messages.length === 0}>
            Clear
          </button>
          <button className="clear-btn" onClick={onClose} style={{background: 'rgba(255,0,0,0.2)', borderColor: 'rgba(255,0,0,0.3)'}}>
            ✕
          </button>
        </div>
      </div>

      <div className="weaver-tabs">
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Quick Actions
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
      </div>

      {activeTab === 'actions' && (
        <div className="actions-grid">
          {actions.map(action => (
            <button
              key={action.type}
              className="action-btn"
              onClick={() => handleActionClick(action.type)}
              disabled={loading}
              title={action.label}
            >
              {action.icon}
              <span>{action.type}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="chat-container">
          <div className="messages-box">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>Start a conversation! Use quick actions or type your question.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-content">
                    {msg.action && <span className="action-tag">{msg.action}</span>}
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              placeholder="Ask anything about this idea..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
              className="chat-input"
            />
            <button type="submit" disabled={loading || !userInput.trim()} className="send-btn">
              {loading ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IdeaWeaver;

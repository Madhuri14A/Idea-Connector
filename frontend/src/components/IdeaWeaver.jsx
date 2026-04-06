import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
  BookOpenIcon, WrenchIcon, AlertTriangleIcon,
  Share2Icon, SparkleIcon, WandIcon, ArrowRightIcon
} from './Icons';
import './IdeaWeaver.css';

const IdeaWeaver = ({ idea, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const actions = [
    { type: 'EXPLAIN', label: 'Explain', Icon: BookOpenIcon },
    { type: 'BUILD', label: 'Build Plan', Icon: WrenchIcon },
    { type: 'RISKS', label: 'Risks', Icon: AlertTriangleIcon },
    { type: 'SIMILAR', label: 'Similar', Icon: Share2Icon },
    { type: 'REFINE', label: 'Refine', Icon: SparkleIcon }
  ];

  const handleActionClick = async (actionType) => {
    if (!idea) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/weaver/action', {
        actionType,
        ideaContent: idea.title + '\n' + idea.description
      });

      if (data.success) {
        setMessages([
          ...messages,
          { role: 'user', content: `Action: ${actionType}`, action: actionType },
          { role: 'assistant', content: data.response }
        ]);
        setActiveTab('chat');
      } else {
        setError(data.error || 'Failed to process action');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Failed to process action');
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
    setError('');

    try {
      const { data } = await api.post('/weaver/chat', {
        userMessage: newMessage,
        conversationHistory: messages,
        currentIdea: idea ? idea.title + '\n' + idea.description : ''
      });

      if (data.success) {
        setMessages(data.conversationHistory);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Failed to send message');
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
        <h3><WandIcon size={16} /> Idea Weaver {loading ? '...' : ''}</h3>
        <div className="weaver-header-actions">
          <button className="clear-btn" onClick={clearHistory} disabled={messages.length === 0}>
            Clear
          </button>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="weaver-tabs">
        {error && (
            <p className="weaver-error">
            <AlertTriangleIcon size={14} /> {error}
          </p>
        )}
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
              <action.Icon size={16} />
              <span>{action.label}</span>
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
              {loading ? '...' : <ArrowRightIcon size={16} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IdeaWeaver;

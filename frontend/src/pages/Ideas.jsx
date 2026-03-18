import React, { useState } from 'react';
import './Ideas.css';
import IdeaWeaver from '../components/IdeaWeaver';

const getTypeLabel = (type) => {
  const labels = {
    'cross-pollination': '🔀 Cross-Pollination',
    'gap-analysis': '📊 Skill Gap Filler',
    'trend-fusion': '🔥 Trending',
    'problem-to-product': '🎯 Problem → Product',
    'skill-amplifier': '💪 Skill Amplifier',
    'portfolio-standout': '⭐ Portfolio Standout',
    'micro-saas': '💰 Micro-SaaS',
    'community': '🌐 Open Source',
    'extension': '🔧 Project Extension',
    'combination': '🧩 Combination',
    'solution': '✅ Solution',
    'strength': '🏆 Strength-Based'
  };
  return labels[type] || '💡 Idea';
};

function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleGenerateIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ideas/generate', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
      setGenerated(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate ideas. Make sure you have some notes!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ideas-container">
      <div className="ideas-header">
        <h1>Project Ideas Generator</h1>
        <p className="subtitle">Discover project ideas based on your notes</p>
        
        <button 
          onClick={handleGenerateIdeas} 
          disabled={loading}
          className="btn-generate"
        >
          {loading ? 'Generating...' : '✨ Generate Ideas'}
        </button>
      </div>

      {generated && ideas.length > 0 ? (
        <div className="ideas-content">
          <div className="ideas-grid">
            {ideas.map(idea => (
              <div 
                key={idea.id} 
                className={`idea-card idea-${idea.type || 'default'} ${selectedIdea?.id === idea.id ? 'selected' : ''}`}
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="idea-type-row">
                  <span className="idea-type-badge">{getTypeLabel(idea.type)}</span>
                  <span className="confidence-badge">
                    {Math.round(idea.confidence)}% match
                  </span>
                </div>

                <h3 className="idea-title">{idea.title}</h3>
                <p className="idea-description">{idea.description}</p>
                
                <div className="idea-tech">
                  <div className="tech-tags">
                    {idea.technologies.map(tech => (
                      <span key={tech} className="tech-tag">#{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="idea-footer">
                  {idea.reasoning && (
                    <p className="idea-reasoning">💡 {idea.reasoning}</p>
                  )}
                  {idea.relatedNoteIds?.length > 0 && (
                    <span className="related-count">
                      📎 {idea.relatedNoteIds.length} related note{idea.relatedNoteIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedIdea && (
            <IdeaWeaver idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
          )}
        </div>
      ) : generated && ideas.length === 0 ? (
        <div className="empty-state">
          <p>No ideas generated. Try adding more notes first!</p>
        </div>
      ) : (
        <div className="ideas-hero">
          <div className="hero-icon">💡</div>
          <p>Click the button above to generate creative project ideas based on your notes</p>
        </div>
      )}
    </div>
  );
}

export default Ideas;

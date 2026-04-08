import React, { useState } from 'react';
import './Ideas.css';
import IdeaWeaver from '../components/IdeaWeaver';
import { generateIdeas } from '../utils/api';
import { Link } from 'react-router-dom';
import GuestBanner from '../components/GuestBanner';
import { LightbulbIcon, SparkleIcon, PaperclipIcon } from '../components/Icons';

const getTypeLabel = (type) => {
  const labels = {
    'cross-pollination': 'Cross-Pollination',
    'gap-analysis': 'Skill Gap',
    'trend-fusion': 'Trending',
    'problem-to-product': 'Problem → Product',
    'skill-amplifier': 'Skill Amplifier',
    'portfolio-standout': 'Portfolio',
    'micro-saas': 'Micro-SaaS',
    'community': 'Open Source',
    'extension': 'Extension',
    'combination': 'Combination',
    'solution': 'Solution',
    'strength': 'Strength-Based'
  };
  return labels[type] || 'Idea';
};

function Ideas({ isGuest = false }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [copiedIdeaId, setCopiedIdeaId] = useState(null);

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateIdeas = async () => {
    setLoading(true);
    try {
      const { data } = await generateIdeas();
      setIdeas(data.ideas);
      setGenerated(true);
      localStorage.setItem('ideaGeneratorVisited', 'true');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate ideas. Make sure you have some notes!');
    } finally {
      setLoading(false);
    }
  };
  const handleCopyIdea = async (idea) => {
    try{
      const techText = idea.technologies?.length
     ? `\nTech: ${idea.technologies.join(', ')}`
      : '';
      const textToCopy = `${idea.title}\n\n${idea.description}${techText}`; 
      await navigator.clipboard.writeText(textToCopy);
      setCopiedIdeaId(idea.id);

      setTimeout(() => {
        setCopiedIdeaId(null);
      }, 1500);
    }
    catch(error) {
      console.error('copy failed:', error);
    }
  };

  return (
    <div className="ideas-container">
      <div className="ideas-header">
        <h1>Idea Suggestions</h1>
        <p className="subtitle">{isGuest ? 'Helpful suggestions from your saved notes' : 'Get practical improvements and meaningful note connections'}</p>

        {isGuest ? null : (
          <button
            onClick={handleGenerateIdeas}
            disabled={loading}
            className="btn-generate"
          >
            {loading ? 'Generating...' : <><SparkleIcon size={15} /> Get Suggestions</>}
          </button>
        )}
      </div>

      {isGuest && (
        <div style={{ padding: '0 0 1.5rem' }}>
          <GuestBanner currentPage="ideas" />
          <div className="ideas-guest-gate">
            <div className="ideas-gate-icon" aria-hidden="true"><SparkleIcon size={44} /></div>
            <h2>Personalized suggestions need a real account</h2>
            <p>Sign in, save a few notes, and we will suggest practical improvements and meaningful connections from your notes.</p>
            <Link to="/login" className="btn btn-primary">Sign in to try Suggestions</Link>
            <Link to="/try" className="gate-back-link" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to trial notes</Link>
          </div>
        </div>
      )}

      {generated && ideas.length > 0 ? (
        <div className="ideas-content">
          <div className="ideas-grid">
            {ideas.map(idea => (
              <div 
                key={idea.id} 
                className={`idea-card idea-${idea.type || 'default'} ${selectedIdea?.id === idea.id ? 'selected' : ''}`}
                onClick={() => handleSelectIdea(idea)}
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
                    <p className="idea-reasoning"><LightbulbIcon size={13} /> {idea.reasoning}</p>
                  )}
                  {idea.relatedNoteIds?.length > 0 && (
                    <span className="related-count">
                      <PaperclipIcon size={12} /> {idea.relatedNoteIds.length} related note{idea.relatedNoteIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <div className="idea-actions">
<button
    type="button"
    className={`btn-copy-idea ${copiedIdeaId === idea.id ? 'copied' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      handleCopyIdea(idea);
    }}
  >
    {copiedIdeaId === idea.id ? 'Copied' : 'Copy Idea'}
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedIdea && (
            <IdeaWeaver
              idea={selectedIdea}
              onClose={() => {
                setSelectedIdea(null);
              }}
            />
          )}
        </div>
      ) : generated && ideas.length === 0 ? (
        <div className="empty-state">
          <p>No suggestions yet. Try adding a few more notes first.</p>
        </div>
      ) : (
        <div className="ideas-hero">
          <div className="hero-icon"><LightbulbIcon size={48} className="hero-svg-icon" /></div>
          <p>Click the button above to get useful suggestions from your notes</p>
        </div>
      )}
    </div>
  );
}

export default Ideas;

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getNotes } from '../utils/api';
import './GraphView.css';

function GraphView() {
  const svgRef = useRef();
  const [selectedNote, setSelectedNote] = useState(null);
  const [hoveredNote, setHoveredNote] = useState(null);
  const [stats, setStats] = useState({ nodes: 0, connections: 0, clusters: 0 });

  const tagColors = {
    'react': '#fb61bdff',
    'javascript': '#F7DF1E',
    'node': '#339933',
    'go': '#00ADD8',
    'blockchain': '#627EEA',
    'css': '#1572B6',
    'python': '#3776AB',
    'database': '#4ECDC4',
    'api': '#FF6B6B',
    'default': '#D97706'
  };

  const hashToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getNodeColor = (note) => {
    if (!note.id) return tagColors.default;
    return hashToColor(note.id);
  };

  useEffect(() => {
    fetchAndRender();
  }, []);

  const fetchAndRender = async () => {
    try {
      const res = await getNotes();
      const notes = res.data;
      drawClearGraph(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const drawClearGraph = (notes) => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    const width = svgRef.current.clientWidth;
    const height = 700;

    svg.selectAll("*").remove();

    const nodes = notes.map(note => ({
      id: note.id,
      title: note.title,
      tags: note.tags || [],
      connections: note.connections?.length || 0,
      content: note.content,
      createdAt: note.createdAt
    }));

    const edges = [];
    const edgeSet = new Set();
    
    notes.forEach(note => {
      note.connections?.forEach(conn => {
        const edgeKey = [note.id, conn.note.id].sort().join('-');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            source: note.id,
            target: conn.note.id,
            strength: conn.strength || 0.5,
            createdBy: conn.createdBy || 'manual'
          });
        }
      });
    });

    // Update stats
    setStats({
      nodes: nodes.length,
      connections: edges.length,
      clusters: new Set(nodes.flatMap(n => n.tags)).size
    });

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(150)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody()
        .strength(-500)
        .distanceMax(400)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide()
        .radius(50)
        .strength(0.7)
      );

    const linkGroup = svg.append('g').attr('class', 'links');

    const links = linkGroup
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'connection-line')
      .attr('stroke', d => d.createdBy === 'auto' ? '#9CA3AF' : '#4B5563')
      .attr('stroke-width', d => 2 + (d.strength * 4))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', d => d.createdBy === 'auto' ? '5,3' : 'none')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', d => 3 + (d.strength * 4));
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => 2 + (d.strength * 4));
      });

    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const nodeGroups = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNote(d);
      })
      .on('mouseenter', function(event, d) {
        setHoveredNote(d);
        
        // Highlight this node
        d3.select(this).select('.main-circle')
          .transition()
          .duration(200)
          .attr('r', d => Math.max(16, d.connections * 3 + 16) * 1.2)
          .attr('stroke-width', 4);

        // Highlight connected lines
        links.attr('stroke-opacity', link => {
          return (link.source.id === d.id || link.target.id === d.id) ? 1 : 0.2;
        });

        // Fade unconnected nodes
        nodeGroups.attr('opacity', node => {
          if (node.id === d.id) return 1;
          const isConnected = edges.some(e => 
            (e.source.id === d.id && e.target.id === node.id) ||
            (e.target.id === d.id && e.source.id === node.id)
          );
          return isConnected ? 1 : 0.3;
        });
      })
      .on('mouseleave', function(event, d) {
        setHoveredNote(null);
        
        // Reset node
        d3.select(this).select('.main-circle')
          .transition()
          .duration(200)
          .attr('r', d => Math.max(16, d.connections * 3 + 16))
          .attr('stroke-width', 3);

        // Reset lines
        links.attr('stroke-opacity', 0.6);

        // Reset all nodes
        nodeGroups.attr('opacity', 1);
      })
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    nodeGroups
      .append('circle')
      .attr('class', 'main-circle')
      .attr('r', d => Math.max(16, d.connections * 3 + 16))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);

    nodeGroups
      .filter(d => d.connections > 0)
      .append('circle')
      .attr('class', 'badge-circle')
      .attr('r', 10)
      .attr('fill', '#4f44efff')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cx', d => Math.max(16, d.connections * 3 + 16) * 0.7)
      .attr('cy', d => -Math.max(16, d.connections * 3 + 16) * 0.7);

    nodeGroups
      .filter(d => d.connections > 0)
      .append('text')
      .attr('class', 'badge-text')
      .attr('x', d => Math.max(16, d.connections * 3 + 16) * 0.7)
      .attr('y', d => -Math.max(16, d.connections * 3 + 16) * 0.7)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.connections);

    const labelGroup = svg.append('g').attr('class', 'labels');

    const labelGroups = labelGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('pointer-events', 'none');

    labelGroups
      .append('rect')
      .attr('class', 'label-bg')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 1);

    const labelTexts = labelGroups
      .append('text')
      .attr('class', 'label-text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1F2937')
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title);

    labelGroups.each(function(d) {
      const text = d3.select(this).select('text').node();
      const bbox = text.getBBox();
      
      d3.select(this).select('rect')
        .attr('x', bbox.x - 6)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 12)
        .attr('height', bbox.height + 4);
    });

    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
      
      labelGroups.attr('transform', d => {
        const offset = Math.max(16, d.connections * 3 + 16) + 18;
        return `translate(${d.x},${d.y + offset})`;
      });
    });

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div className="graph-view">
      {/* Header with stats */}
      <div className="graph-header">
        <div className="header-content">
          <h1>Knowledge Graph</h1>
          <div className="graph-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.nodes}</span>
              <span className="stat-label">Notes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.connections}</span>
              <span className="stat-label">Connections</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.clusters}</span>
              <span className="stat-label">Topics</span>
            </div>
          </div>
        </div>
        <button onClick={() => fetchAndRender()} className="btn-refresh">
           Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="graph-legend-top">
        <div className="legend-section">
          <h4>Visual Guide:</h4>
          <div className="legend-items-inline">
            <div className="legend-item-inline">
              <div className="legend-example">
                <svg width="40" height="20">
                  <circle cx="10" cy="10" r="8" fill="#D97706" stroke="#fff" strokeWidth="2"/>
                  <circle cx="10" cy="10" r="3" fill="#EF4444"/>
                </svg>
              </div>
              <span>Size = connections</span>
            </div>
            <div className="legend-item-inline">
              <div className="legend-example">
                <svg width="40" height="20">
                  <line x1="0" y1="10" x2="40" y2="10" stroke="#4B5563" strokeWidth="3"/>
                </svg>
              </div>
              <span>Thick = strong link</span>
            </div>
            <div className="legend-item-inline">
              <div className="legend-example">
                <svg width="40" height="20">
                  <line x1="0" y1="10" x2="40" y2="10" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,3"/>
                </svg>
              </div>
              <span>Dashed = AI suggested</span>
            </div>
           
          </div>
        </div>
      </div>

      {/* Hover info */}
      {hoveredNote && (
        <div className="hover-info">
          <strong>{hoveredNote.title}</strong>
          <div className="hover-meta">
            {hoveredNote.connections} connection{hoveredNote.connections !== 1 ? 's' : ''}
            {hoveredNote.tags.length > 0 && (
              <> • {hoveredNote.tags.slice(0, 2).map(t => `#${t}`).join(', ')}</>
            )}
          </div>
        </div>
      )}

      {/* Graph canvas */}
      <div className="graph-container">
        <svg 
          ref={svgRef} 
          style={{ 
            width: '100%', 
            height: '700px', 
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '2px solid #FFD700'
          }}
        />
      </div>

      {/* Selected note sidebar */}
      {selectedNote && (
        <div className="note-sidebar">
          <button className="close-btn" onClick={() => setSelectedNote(null)}>
            ✕
          </button>
          
          <div className="sidebar-header">
            <h3>{selectedNote.title}</h3>
            <div className="connection-badge">
              {selectedNote.connections} connection{selectedNote.connections !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="sidebar-content">
            <p>{selectedNote.content}</p>
          </div>

          {selectedNote.tags.length > 0 && (
            <div className="sidebar-tags">
              <h4>Tags:</h4>
              <div className="tags">
                {selectedNote.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="tag"
                    style={{
                      backgroundColor: (tagColors[tag.toLowerCase()] || tagColors.default) + '20',
                      color: tagColors[tag.toLowerCase()] || tagColors.default,
                      border: `1px solid ${tagColors[tag.toLowerCase()] || tagColors.default}`
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-meta">
            <small>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.nodes === 0 && (
        <div className="graph-empty">
          <div className="empty-icon">🕸️</div>
          <h3>No notes yet</h3>
          <p>Create some notes and connect them to see your knowledge graph!</p>
        </div>
      )}
    </div>
  );
}

export default GraphView;
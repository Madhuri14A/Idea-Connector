import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getNotes, rebuildConnections } from '../utils/api';
import { parseDate } from '../utils/date';
import { NetworkIcon } from '../components/Icons';
import './GraphView.css';

function GraphView() {
  const svgRef = useRef();
  const [selectedNote, setSelectedNote] = useState(null);
  const [hoveredNote, setHoveredNote] = useState(null);
  const [stats, setStats] = useState({ nodes: 0, connections: 0, clusters: 0 });
  const [rebuilding, setRebuilding] = useState(false);

  const handleRebuildConnections = async () => {
    setRebuilding(true);
    try {
      await rebuildConnections();
      await fetchAndRender();
    } catch (err) {
      console.error('Rebuild failed:', err);
    } finally {
      setRebuilding(false);
    }
  };

  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84',
    '#6C5B7B', '#355C7D', '#F67280', '#C94B4B', '#A8E6CF',
    '#FFD3B6', '#FFAAA5', '#FF8B94', '#FFDAC1', '#A8DADC'
  ];

  const hashStringToIndex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % colorPalette.length;
  };

  const getNodeColor = (note) => {
    const colorIndex = hashStringToIndex(note.id);
    return colorPalette[colorIndex];
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

    setStats({
      nodes: nodes.length,
      connections: edges.length,
      clusters: new Set(nodes.flatMap(n => n.tags)).size
    });

    const getNodeRadius = (d) => Math.max(12, d.connections * 2 + 12);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(90)
        .strength(0.4)
      )
      .force('charge', d3.forceManyBody()
        .strength(-250)
        .distanceMax(300)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide()
        .radius(d => getNodeRadius(d) + 8)
        .strength(0.8)
      );

    const linkGroup = svg.append('g').attr('class', 'links');

    const links = linkGroup
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'connection-line')
      .attr('stroke', d => d.createdBy === 'auto' ? '#B0BEC5' : '#665761')
      .attr('stroke-width', d => 1 + (d.strength * 1.5))
      .attr('stroke-opacity', 0.65)
      .attr('stroke-dasharray', d => d.createdBy === 'auto' ? '5,4' : 'none')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', d => 2 + (d.strength * 1.5));
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.65)
          .attr('stroke-width', d => 1 + (d.strength * 1.5));
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
        
        d3.select(this).select('.main-circle')
          .transition()
          .duration(200)
          .attr('r', d => getNodeRadius(d) * 1.2)
          .attr('stroke-width', 3);

        d3.select(this).select('.glow-circle')
          .transition()
          .duration(200)
          .attr('opacity', 0.4);

        links.attr('stroke-opacity', link => {
          return (link.source.id === d.id || link.target.id === d.id) ? 0.9 : 0.15;
        });

        nodeGroups.attr('opacity', node => {
          if (node.id === d.id) return 1;
          const isConnected = edges.some(e => 
            (e.source.id === d.id && e.target.id === node.id) ||
            (e.target.id === d.id && e.source.id === node.id)
          );
          return isConnected ? 1 : 0.25;
        });
      })
      .on('mouseleave', function(event, d) {
        setHoveredNote(null);
        
        d3.select(this).select('.main-circle')
          .transition()
          .duration(200)
          .attr('r', d => getNodeRadius(d))
          .attr('stroke-width', 2);

        d3.select(this).select('.glow-circle')
          .transition()
          .duration(200)
          .attr('opacity', 0);

        links.attr('stroke-opacity', 0.5);
        nodeGroups.attr('opacity', 1);
      })
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    nodeGroups
      .append('circle')
      .attr('class', 'glow-circle')
      .attr('r', d => getNodeRadius(d) + 6)
      .attr('fill', d => getNodeColor(d))
      .attr('opacity', 0)
      .style('filter', 'blur(8px)');

    nodeGroups
      .append('circle')
      .attr('class', 'main-circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    nodeGroups
      .append('circle')
      .attr('r', d => Math.max(7, getNodeRadius(d) * 0.55))
      .attr('fill', 'white')
      .attr('opacity', 0.3);

    nodeGroups
      .filter(d => d.connections > 0)
      .append('circle')
      .attr('class', 'badge-circle')
      .attr('r', 8)
      .attr('fill', '#665761')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('cx', d => getNodeRadius(d) * 0.7)
      .attr('cy', d => -getNodeRadius(d) * 0.7)
      .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))');

    nodeGroups
      .filter(d => d.connections > 0)
      .append('text')
      .attr('class', 'badge-text')
      .attr('x', d => getNodeRadius(d) * 0.7)
      .attr('y', d => -getNodeRadius(d) * 0.7)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '9px')
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
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-width', 1)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))');

    const labelTexts = labelGroups
      .append('text')
      .attr('class', 'label-text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#2D3748')
      .text(d => d.title.length > 12 ? d.title.substring(0, 12) + '…' : d.title);

    labelGroups.each(function(d) {
      const text = d3.select(this).select('text').node();
      const bbox = text.getBBox();
      
      d3.select(this).select('rect')
        .attr('x', bbox.x - 8)
        .attr('y', bbox.y - 3)
        .attr('width', bbox.width + 16)
        .attr('height', bbox.height + 6);
    });

    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
      
      labelGroups.attr('transform', d => {
        const offset = getNodeRadius(d) + 14;
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
      <div className="graph-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Knowledge Graph</h1>
            <p className="header-subtitle">Visualize connections between your ideas</p>
          </div>
          <div className="graph-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.nodes}</span>
              <span className="stat-label">Notes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.connections}</span>
              <span className="stat-label">Links</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{stats.clusters}</span>
              <span className="stat-label">Topics</span>
            </div>
          </div>
        </div>
        <button onClick={() => fetchAndRender()} className="btn-refresh">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button onClick={handleRebuildConnections} className="btn-refresh" disabled={rebuilding} title="Recalculate all connections with updated logic">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {rebuilding ? 'Rebuilding...' : 'Rebuild Connections'}
        </button>
      </div>

      {hoveredNote && (
        <div className="hover-info">
          <div className="hover-header">
            <div 
              className="hover-color-indicator" 
              style={{ background: getNodeColor(hoveredNote) }}
            />
            <strong>{hoveredNote.title}</strong>
          </div>
          <div className="hover-meta">
            <span className="hover-meta-item">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {hoveredNote.connections} connection{hoveredNote.connections !== 1 ? 's' : ''}
            </span>
            {hoveredNote.tags.length > 0 && (
              <span className="hover-meta-item">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {hoveredNote.tags.slice(0, 2).map(t => `#${t}`).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="guide-panel">
        <div className="guide-title">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Graph Guide
        </div>
        <div className="guide-items">
          <div className="guide-item">
            <div className="guide-visual">
              <svg width="40" height="24">
                <circle cx="12" cy="12" r="10" fill={colorPalette[0]} opacity="0.9" stroke="#fff" strokeWidth="2"/>
                <circle cx="28" cy="12" r="6" fill={colorPalette[1]} opacity="0.9" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <span>Size = Connection count</span>
          </div>
          <div className="guide-item">
            <div className="guide-visual">
              <svg width="40" height="24">
                <line x1="4" y1="12" x2="36" y2="12" stroke="#667eea" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Solid = Manual link</span>
          </div>
          <div className="guide-item">
            <div className="guide-visual">
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                background: colorPalette[2],
                margin: '2px 10px'
              }}></div>
            </div>
            <span>Each note = Unique color</span>
          </div>
        </div>
      </div>

      <div className="graph-canvas-wrapper">
        <svg 
          ref={svgRef} 
          className="graph-canvas"
        />

        {stats.nodes === 0 && (
          <div className="graph-empty">
            <div className="empty-icon"><NetworkIcon size={48} className="empty-svg-icon" /></div>
            <h3>No notes in your graph yet</h3>
            <p>Create notes and connect them to visualize your knowledge network</p>
          </div>
        )}
      </div>

      {selectedNote && (
        <div className="note-sidebar">
          <button className="close-btn" onClick={() => setSelectedNote(null)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="sidebar-header">
            <div 
              className="sidebar-color-bar" 
              style={{ background: getNodeColor(selectedNote) }}
            />
            <h3>{selectedNote.title}</h3>
            <div className="sidebar-badges">
              <div className="connection-badge">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {selectedNote.connections} link{selectedNote.connections !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="sidebar-content">
            <p>{selectedNote.content}</p>
          </div>

          {selectedNote.tags.length > 0 && (
            <div className="sidebar-tags">
              <h4>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h4>
              <div className="tags">
                {selectedNote.tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-meta">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Created {parseDate(selectedNote.createdAt).toLocaleDateString('en-US', {
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default GraphView;
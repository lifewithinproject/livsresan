// app.js

const categoryColors = {
  "Krig": "#d9534f",
  "Revolution": "#f0ad4e",
  "Vetenskap": "#5bc0de",
  "Biografi": "#5cb85c",
  "Samhälle": "#428bca"
};

let timeline, cy;

async function init() {
  const response = await fetch('data.json');
  const data = await response.json();

  // Skapa items för vis-timeline
  const items = data.map(ev => ({
    id: ev.id,
    content: ev.title,
    start: ev.start,
    end: ev.end || undefined,
    style: `background-color: ${categoryColors[ev.categories?.[0]] || '#999'}; color: white;`
  }));

  // Initiera timeline i vänster div
  timeline = new vis.Timeline(document.getElementById('timeline'), items, {
    stack: true,
    verticalScroll: true,
    horizontalScroll: true,
    zoomKey: 'ctrlKey',
    margin: {item:10, axis:5}
  });

  // Skapa noder och kanter för Cytoscape i höger div (#graph)
  const nodes = data.map(ev => ({
    data: {
      id: ev.id,
      label: ev.title,
      category: ev.categories?.[0] || 'Okategoriserad'
    }
  }));

  const edges = [];
  data.forEach(ev => {
    (ev.connections || []).forEach(conn => {
      edges.push({
        data: {
          id: `${ev.id}_${conn.target}`,
          source: ev.id,
          target: conn.target,
          label: conn.type || ''
        }
      });
    });
  });

  cy = cytoscape({
    container: document.getElementById('graph'),
    elements: { nodes, edges },
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': ele => categoryColors[ele.data('category')] || '#999',
          'color': '#fff',
          'text-valign': 'center',
          'text-outline-width': 2,
          'text-outline-color': '#333',
          'width': 30,
          'height': 30,
          'font-size': 10
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#ccc',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 8,
          'text-rotation': 'autorotate',
          'color': '#666'
        }
      }
    ],
    layout: { name: 'cose', animate: true }
  });
}

window.addEventListener('DOMContentLoaded', init);

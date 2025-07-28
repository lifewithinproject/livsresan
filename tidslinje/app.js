// Läs JSON-data från extern fil
async function fetchData() {
  const response = await fetch('data.json');  // Ändra till din JSON-fil
  return await response.json();
}

function mapDataToItems(data) {
  return data.map(event => ({
    id: event.id,
    content: event.title,
    start: event.start,
    className: event.categories && event.categories.length > 0
      ? event.categories[0].toLowerCase()
      : ''
  }));
}

function createTimeline(items) {
  const container = document.getElementById('timeline');
  const options = {
    // Eventuella timeline-inställningar
    stack: false,
    maxHeight: '100%',
    editable: false,
  };
  return new vis.Timeline(container, items, options);
}

function createGraph(data) {
  const cy = cytoscape({
    container: document.getElementById('graph'),
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(title)',
          'background-color': '#666',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'width': 40,
          'height': 40,
          'font-size': 12,
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(type)',
          'font-size': 10,
          'text-rotation': 'autorotate',
          'color': '#555',
        }
      }
    ],
    elements: {
      nodes: data.map(event => ({
        data: { id: event.id, title: event.title }
      })),
      edges: data.flatMap(event =>
        event.connections.map(conn => ({
          data: { source: event.id, target: conn.target, type: conn.type }
        }))
      )
    },
    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 10
    }
  });
}

async function init() {
  const data = await fetchData();
  const items = mapDataToItems(data);
  createTimeline(items);
  createGraph(data);
}

init();

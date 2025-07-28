// Ladda data.json och initiera tidslinje och grafvy

async function loadData() {
  const response = await fetch('data.json');
  return await response.json();
}

function createTimelineItems(events) {
  return events.map(ev => ({
    id: ev.id,
    content: ev.title,
    start: ev.start,
    end: ev.end || undefined,
    title: ev.description,
    className: ev.categories ? ev.categories.join(' ') : ''
  }));
}

function createGraphElements(events) {
  const nodes = events.map(ev => ({
    data: { id: ev.id, label: ev.title }
  }));
  const edges = [];
  events.forEach(ev => {
    if (ev.connections) {
      ev.connections.forEach(conn => {
        edges.push({
          data: { source: ev.id, target: conn.target, label: conn.type }
        });
      });
    }
  });
  return { nodes, edges };
}

function showDetails(event) {
  const contentDiv = document.getElementById('details-content');
  if (!event) {
    contentDiv.innerHTML = 'Klicka på en händelse för mer info';
    return;
  }
  const imgHtml = event.image ? `<img src="${event.image}" alt="${event.title}" />` : '';
  const sourcesHtml = event.sources && event.sources.length
    ? `<p>Källor: ${event.sources.map(s => `<a href="${s}" target="_blank">${s}</a>`).join(', ')}</p>`
    : '';
  contentDiv.innerHTML = `
    <h3>${event.title}</h3>
    <p><strong>Datum:</strong> ${event.start}${event.end ? ' - ' + event.end : ''}</p>
    <p>${event.description}</p>
    ${imgHtml}
    ${sourcesHtml}
  `;
}

async function init() {
  const events = await loadData();

  // Initiera tidslinje
  const container = document.getElementById('timeline');
  const items = new vis.DataSet(createTimelineItems(events));
  const options = {
    stack: false,
    maxHeight: 400,
    selectable: true,
    zoomable: true,
    moveable: true,
    tooltip: {
      followMouse: true
    },
    orientation: 'top'
  };
  const timeline = new vis.Timeline(container, items, options);

  // Initiera Cytoscape-graf
  const cy = cytoscape({
    container: document.getElementById('graph'),
    elements: createGraphElements(events),
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'background-color': '#0074D9',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'width': 'label',
          'height': 'label',
          'padding': '10px',
          'font-size': '12px',
          'shape': 'roundrectangle',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'border-width': 1,
          'border-color': '#005fa3'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'label': 'data(label)',
          'font-size': '10px',
          'text-rotation': 'autorotate',
          'line-color': '#ccc',
          'target-arrow-color': '#ccc'
        }
      },
      {
        selector: ':selected',
        style: {
          'background-color': '#FF4136',
          'line-color': '#FF4136',
          'target-arrow-color': '#FF4136',
          'source-arrow-color': '#FF4136'
        }
      }
    ],
    layout: {
      name: 'cose',
      padding: 10
    }
  });

  // Klick på tidslinje väljer nod i grafen och visar detaljer
  timeline.on('select', properties => {
    if (properties.items.length === 1) {
      const id = properties.items[0];
      const ev = events.find(e => e.id === id);
      showDetails(ev);
      cy.$(`#${id}`).select();
      cy.fit(`#${id}`, 50);
    } else {
      showDetails(null);
      cy.elements().unselect();
    }
  });

  // Klick på nod i graf visar detaljer och markerar i tidslinjen
  cy.on('select unselect', 'node', evt => {
    const selected = evt.target.selected();
    if (selected) {
      const id = evt.target.id();
      const ev = events.find(e => e.id === id);
      showDetails(ev);
      timeline.setSelection(id, { focus: true });
    } else {
      showDetails(null);
      timeline.setSelection([]);
    }
  });
}

init();

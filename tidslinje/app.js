Papa.parse("data.csv", {
  header: true,
  download: true,
  complete: function(results) {
    const data = results.data;

    // --- TIDSLINJE ---
    const items = data.map((row, i) => ({
      id: i,
      content: row['Händelsetitel'],
      start: row['Datum'],
      title: row['Beskrivning'],
      group: row['Kategori']
    }));

    const container = document.getElementById('timeline');
    const timeline = new vis.Timeline(container, items);

    // --- NÄTVERK ---
    const nodes = data.map((row, i) => ({
      data: { id: row['Händelsetitel'], label: row['Händelsetitel'] }
    }));

    const edges = [];
    data.forEach(row => {
      if (row['Kopplingsdata']) {
        row['Kopplingsdata'].split(';').forEach(target => {
          edges.push({
            data: {
              source: row['Händelsetitel'],
              target: target.trim()
            }
          });
        });
      }
    });

    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: { nodes, edges },
      layout: { name: 'cose' },
      style: [
        { selector: 'node', style: { 'label': 'data(label)', 'background-color': '#0074D9', 'color': '#fff', 'text-valign': 'center', 'text-halign': 'center' } },
        { selector: 'edge', style: { 'line-color': '#ccc' } }
      ]
    });
  }
});

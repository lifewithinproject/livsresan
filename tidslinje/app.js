Papa.parse("data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    const data = results.data;

    const categoryColors = {
      "Krig": "red",
      "Revolution": "blue",
      "Vetenskap": "green"
    };

    // --- Skapa items för tidslinjen ---
    const timelineItems = data
      .filter(item =>
        item["Datum"] &&
        item["Händelsetitel"] &&
        /^\d{4}-\d{2}-\d{2}$/.test(item["Datum"])
      )
      .map((item, index) => ({
        id: index,
        content: item["Händelsetitel"],
        start: item["Datum"],
        title: item["Beskrivning"] || "",
        group: item["Kategori"] || "",
        description: item["Beskrivning"],
        source: item["Källor"],
        image: item["Bildlänk"],
        relations: item["Kopplingar"],
        style: `background-color: ${categoryColors[item["Kategori"]] || "#666"}; color: white; border-radius: 4px; padding: 4px;`
      }));

    // --- Initiera tidslinje ---
    const timelineContainer = document.getElementById("timeline");
    const timelineOptions = {
      tooltip: { followMouse: true },
      stack: true,
      zoomable: true,
      margin: {
        item: 10,
        axis: 5
      }
    };
    const timeline = new vis.Timeline(timelineContainer, timelineItems, timelineOptions);

    // --- Visa info-box vid klick på tidslinjens händelse ---
    timeline.on("select", function (props) {
      if(props.items.length === 0) return;
      const item = timelineItems.find(i => i.id === props.items[0]);
      if (!item) return;

      const box = document.getElementById("info-box");
      box.innerHTML = `
        <h3>${item.content}</h3>
        <p><strong>Beskrivning:</strong> ${item.description || "Ingen"}</p>
        ${item.image ? `<img src="${item.image}" alt="${item.content}">` : ""}
        ${item.source ? `<p><a href="${item.source}" target="_blank" rel="noopener">Källa</a></p>` : ""}
      `;
    });

    // --- Cytoscape: skapa noder och länkar utifrån kopplingar ---
    const cyContainer = document.getElementById('cy');

    // Skapa noder för varje händelse
    const cyNodes = timelineItems.map(item => ({
      data: { id: item.id.toString(), label: item.content, description: item.description, source: item.source, image: item.image },
      style: {
        'background-color': categoryColors[item.group] || '#666',
        'color': '#fff',
        'text-valign': 'center',
        'text-halign': 'center',
        'label': item.content,
        'text-wrap': 'wrap',
        'text-max-width': 80,
        'font-size': 12,
      }
    }));

    // Skapa länkar (edges) baserat på "Kopplingar" – som kommaseparerad lista av index (händelsetitlar)
    // Vi matchar kopplingar mot händelsetitel för att få id
    const titleToIdMap = {};
    timelineItems.forEach(item => {
      titleToIdMap[item.content.trim()] = item.id.toString();
    });

    const cyEdges = [];
    timelineItems.forEach(item => {
      if(item.relations){
        const relatedTitles = item.relations.split(",").map(s => s.trim()).filter(s => s.length > 0);
        relatedTitles.forEach(relTitle => {
          const targetId = titleToIdMap[relTitle];
          if(targetId){
            cyEdges.push({
              data: {
                id: `e${item.id}_${targetId}`,
                source: item.id.toString(),
                target: targetId
              }
            });
          }
        });
      }
    });

    const cy = cytoscape({
      container: cyContainer,
      elements: {
        nodes: cyNodes,
        edges: cyEdges
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(background-color)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 12,
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'shape': 'roundrectangle',
            'padding': '10px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#333',
            'background-color': '#f39c12'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true
      }
    });

    // --- Info-box vid klick på node ---
    cy.on('tap', 'node', function(evt){
      const node = evt.target;
      const box = document.getElementById('info-box');
      box.innerHTML = `
        <h3>${node.data('label')}</h3>
        <p><strong>Beskrivning:</strong> ${node.data('description') || "Ingen"}</p>
        ${node.data('image') ? `<img src="${node.data('image')}" alt="${node.data('label')}">` : ""}
        ${node.data('source') ? `<p><a href="${node.data('source')}" target="_blank" rel="noopener">Källa</a></p>` : ""}
      `;
    });

    // --- Växla mellan vyerna ---
    const toggleBtn = document.getElementById("toggleViewBtn");
    toggleBtn.addEventListener("click", () => {
      if(timelineContainer.style.display !== "none"){
        timelineContainer.style.display = "none";
        cyContainer.style.display = "block";
        toggleBtn.textContent = "Visa tidslinje";
      } else {
        cyContainer.style.display = "none";
        timelineContainer.style.display = "block";
        toggleBtn.textContent = "Visa grafvy";
      }
      // Rensa info-box vid vybyte
      document.getElementById("info-box").innerHTML = "<em>Klicka på en händelse för mer information.</em>";
    });
  }
});

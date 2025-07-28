Papa.parse("data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true, // <-- Viktigt!
  complete: function(results) {
    const data = results.data;

    const timelineItems = data
      .filter(item => item["Datum"] && item["Händelsetitel"])
      .map((item, index) => {
        if (!item["Datum"]) return null;

        return {
          id: index,
          content: item["Händelsetitel"],
          start: item["Datum"],
          title: item["Beskrivning"] || "",
          group: item["Kategori"] || "",
          description: item["Beskrivning"],
          source: item["Källor"],
          image: item["Bildlänk"],
          relations: item["Kopplingar"]
        };
      })
      .filter(Boolean); // <-- Tar bort ev. null

    const container = document.getElementById("timeline");

    const options = {
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      },
      stack: true,
      zoomable: true,
      selectable: true,
      margin: {
        item: 10,
        axis: 5
      }
    };

    const timeline = new vis.Timeline(container, timelineItems, options);
  }

  timeline.on("select", function (props) {
  const item = timelineItems.find(i => i.id === props.items[0]);
  if (!item) return;

  const container = document.getElementById("info-box");

  container.innerHTML = `
    <h3>${item.content}</h3>
    <p><strong>Beskrivning:</strong> ${item.description || "Ingen"}</p>
    ${item.image ? `<img src="${item.image}" style="max-width:100%; margin-top:10px;">` : ""}
    ${item.source ? `<p><a href="${item.source}" target="_blank">Källa</a></p>` : ""}
  `;
});

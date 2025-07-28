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

    const container = document.getElementById("timeline");

    const options = {
      tooltip: { followMouse: true },
      stack: true,
      zoomable: true,
      margin: {
        item: 10,
        axis: 5
      }
    };

    const timeline = new vis.Timeline(container, timelineItems, options);

    // Info-popup
    timeline.on("select", function (props) {
      const item = timelineItems.find(i => i.id === props.items[0]);
      if (!item) return;

      const box = document.getElementById("info-box");
      box.innerHTML = `
        <h3>${item.content}</h3>
        <p><strong>Beskrivning:</strong> ${item.description || "Ingen"}</p>
        ${item.image ? `<img src="${item.image}">` : ""}
        ${item.source ? `<p><a href="${item.source}" target="_blank">Källa</a></p>` : ""}
      `;
    });
  }
});

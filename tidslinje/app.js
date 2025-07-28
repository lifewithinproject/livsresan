// Ladda CSV och skapa vis-timeline
Papa.parse("data.csv", {
  download: true,
  header: true,
  complete: function(results) {
    const data = results.data;

    const timelineItems = data
      .filter(item => item["Datum"] && item["Händelsetitel"])
      .map((item, index) => ({
        id: index,
        content: item["Händelsetitel"],
        start: item["Datum"],
        title: item["Beskrivning"] || "",
        group: item["Kategori"] || "",
        // valfritt: man kan använda detta för mer info
        description: item["Beskrivning"],
        source: item["Källor"],
        image: item["Bildlänk"],
        relations: item["Kopplingar"]
      }));

    // Skapa timeline
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
});

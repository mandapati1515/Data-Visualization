const drawChart = async () => {
  // DATA
  const deathdays_data = await d3.csv("./data/deathdays.csv");
  const pumps_data = await d3.csv("./data/pumps.csv");
  const deaths_age_sex_data = await d3.csv("./data/deaths_age_sex.csv");
  const streets_data = await d3.json("./data/streets.json");

  // variables
  const margins = { top: 40, right: 20, bottom: 40, left: 20 };
  let hoverValue = null;
  const tooltip = d3
    .select(".container")
    .append("div")
    .attr("class", "tooltip");

  const dimensions = {
    barHeight: 300,
    barWidth: 700,
    mapHeight: 700,
    mapWidth: 700,
    pieHeight: 300,
    pieWidth: 350,
  };

  const ages = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5])
    .range(["0-10", "11-21", "21-40", "41-60", "61-80", ">80"]);

  const pieColors = d3.scaleOrdinal().range(d3.schemeAccent);

  const mapLabels = ["Male", "Female", "Pump", "Brewery", "Work House"];

  const mapLegendColorScale = d3
    .scaleOrdinal()
    .domain(mapLabels)
    .range(d3.schemeCategory10);

  //MAP CHART
  //svg
  const svg = d3
    .select("#chart-map")
    .append("svg")
    .attr("width", dimensions.mapWidth)
    .attr("height", dimensions.mapHeight);

  //scales
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(
        streets_data.reduce((acc, curr) => acc.concat(curr), []),
        (d) => d.x
      )
    )
    .range([0, dimensions.mapWidth]);

  const y = d3
    .scaleLinear()
    .domain(
      d3.extent(
        streets_data.reduce((acc, curr) => acc.concat(curr), []),
        (d) => d.y
      )
    )
    .range([dimensions.mapHeight - margins.top, 0]);

  const mapLines = d3
    .line()
    .x((d) => x(d.x))
    .y((d) => y(d.y));

  const mapLegend = svg
    .append("g")
    .attr("class", "map-legend")
    .attr("transform", `translate(10, ${margins.top / 2})`);

  mapLegend
    .selectAll("circle")
    .data(mapLabels)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => i * (dimensions.mapWidth / mapLabels.length))
    .attr("cy", 0)
    .attr("r", 8)
    .attr("fill", (d) => mapLegendColorScale(d));

  mapLegend
    .selectAll("text")
    .data(mapLabels)
    .enter()
    .append("text")
    .attr("x", (d, i) => 15 + i * (dimensions.mapWidth / mapLabels.length))
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text((d) => d);

  const mapContainer = svg
    .append("g")
    .attr("class", "map-container")
    .attr("transform", `translate(0, ${margins.top})`);

  streets_data.forEach((street) => {
    mapContainer
      .append("path")
      .attr("d", mapLines(street))
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2.5)
      .attr("fill", "none");
  });

  mapContainer
    .append("circle")
    .attr("class", "work-house-circle")
    .attr("cx", 150)
    .attr("cy", 200)
    .attr("r", "10px")
    .attr("fill", (d) => mapLegendColorScale("Work House"))
    .attr("stroke", "none")
    .style("pointer-event", "none");

  mapContainer
    .append("circle")
    .attr("class", "brewery-circle")
    .attr("cx", 300)
    .attr("cy", 500)
    .attr("r", "10px")
    .attr("fill", (d) => mapLegendColorScale("Brewery"))
    .attr("stroke", "none")
    .style("pointer-event", "none");

  mapContainer
    .append("text")
    .style("fill", "#aaa")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(459,400) rotate(-32)")
    .text("Broad Street");
  mapContainer
    .append("text")
    .style("fill", "#aaa")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(665,250) rotate(68)")
    .text("Dean Street");
  mapContainer
    .append("text")
    .style("fill", "#aaa")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(250,105) rotate(-12)")
    .text("Oxford Street");
  mapContainer
    .append("text")
    .style("fill", "#aaa")
    .style("font-size", "35px")
    .attr("opacity", 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(180,380) rotate(62)")
    .text("Regent Street");

  const pump = mapContainer
    .append("g")
    .selectAll(".pump-circle")
    .data(pumps_data);

  pump
    .enter()
    .append("circle")
    .attr("class", "pump-circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 6)
    .attr("fill", (d) => mapLegendColorScale("Pump"))
    .style("cursor", "pointer");

  const death = svg
    .append("g")
    .selectAll(".age-sex-circle")
    .data(deaths_age_sex_data);

  death
    .enter()
    .append("circle")
    .attr("class", "age-sex-circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 6)
    .attr("fill", (d) =>
      +d.gender === 0
        ? mapLegendColorScale("Male")
        : mapLegendColorScale("Female")
    )
    .style("cursor", "pointer")
    .on("mouseover", function (event, data) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Age: ${ages(data.age)}<br/>Sex: ${
            data.gender === "0" ? "Male" : "Female"
          }`
        )
        .style("left", `${event.pageX - 10}px`)
        .style("top", `${event.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (event, data) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function (event) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  //BAR CHART
  const barSvg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("viewBox", [0, 0, dimensions.barWidth, dimensions.barHeight])
    .append("g")
    .attr("transform", `translate(60, 0)`);

  const barYScale = d3
    .scaleLinear()
    .domain([0, d3.max(deathdays_data, (d) => +d.deaths)])
    .range([dimensions.barHeight - margins.bottom, margins.top])
    .nice();
    

  barSvg.append("g").attr("class", "y-axis").call(d3.axisLeft(barYScale));

  const barXScale = d3
    .scaleBand()
    .domain(deathdays_data.map((d) => d.date))
    .range([0, dimensions.barWidth - margins.left - margins.right])
    .padding(0.2);

  barSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${dimensions.barHeight - margins.bottom})`)
    .call(d3.axisBottom(barXScale))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  barSvg
    .append("text")
    .attr("y", -margins.left - 15)
    .attr("x", -dimensions.barHeight / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .style("font-weight", "semi-bold")
    .text("Number of Deaths");

  const bars = barSvg.selectAll("rect").data(deathdays_data);

  bars
    .enter()
    .append("rect")
    .attr("y", dimensions.barHeight - margins.bottom)
    .attr("x", (d) => barXScale(d.date))
    .attr("width", barXScale.bandwidth())
    .on("mouseover", function (event, data) {
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", (circle, i) => (i + 1 > data.deaths ? 0 : 1));

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(`Date: ${data.date}<br/>No. of Deaths: ${data.deaths}`)
        .style("left", `${event.pageX - 10}px`)
        .style("top", `${event.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (event, d) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function (event) {
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .merge(bars)
    .transition()
    .duration(1000)
    .attr("y", (d) => barYScale(+d.deaths))
    .attr("x", (d) => barXScale(d.date))
    .attr("width", barXScale.bandwidth())
    .attr(
      "height",
      (d) => dimensions.barHeight - margins.bottom - barYScale(+d.deaths)
    )
    .attr("fill", "red")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer");

  bars
    .enter()
    .append("text")
    .attr("y", dimensions.barHeight - margins.bottom)
    .attr("x", (d) => barXScale(d.date) + barXScale.bandwidth() / 2)
    .merge(bars)
    .transition()
    .delay(900)
    .duration(500)
    .attr("y", (d) => barYScale(+d.deaths) - 10)
    .attr("x", (d) => barXScale(d.date) + barXScale.bandwidth() / 2)
    .text((d) => d.deaths)
    .attr("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("fill", "#bbb")
    .attr("dy", "0.35em")
    .style("pointer-events", "none");

  // PIE CHART
  const pieSvgOne = d3
    .select("#second-pie")
    .append("svg")
    .attr("width", dimensions.pieWidth)
    .attr("height", dimensions.pieHeight);

  const pieSvgTwo = d3
    .select("#pie-chart")
    .append("svg")
    .attr("width", dimensions.pieWidth)
    .attr("height", dimensions.pieHeight);

  const ageArcGroups = d3.group(deaths_age_sex_data, (d) => +d.age);
  const sexArcGroup = d3.group(deaths_age_sex_data, (d) => +d.gender);

  const ageGroupContainer = pieSvgOne
    .append("g")
    .attr(
      "transform",
      `translate(${dimensions.pieWidth / 2}, ${dimensions.pieHeight / 2})`
    );

  pieSvgOne
    .append("text")
    .attr("x", dimensions.pieWidth / 2)
    .attr("y", margins.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .style("font-weight", "semi-bold")
    .text("Number of Deaths by Age Group");

  pieSvgTwo
    .append("text")
    .attr("x", dimensions.pieWidth / 2)
    .attr("y", margins.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .style("font-weight", "semi-bold")
    .text("Number of Deaths by Sex");

  const pie = d3
    .pie()
    .value((d) => d[1].length)
    .sort(null);

  const path = d3
    .arc()
    .outerRadius(dimensions.pieHeight / 2 - margins.top)
    .innerRadius(0);

  const ageArcs = ageGroupContainer
    .selectAll(".arcs")
    .data(pie(ageArcGroups))
    .enter()
    .append("g")
    .attr("class", "arcs");

  ageArcs
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => pieColors(d.data[0]))
    //opacity is set to 0 for all arcs except the one with the highest value
    .attr("opacity", 0.5)
    .attr("stroke", "#ddd")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer")
    .on("mouseover", function (event, data) {
      hoverValue = data.data[0];
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", (d) => (hoverValue === +d.age ? 1 : 0));
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Age Range: ${ages(data.data[0])}<br/>Percentage: ${
            (data.data[1].length / deaths_age_sex_data.length).toFixed(2) *
              100 +
            "%"
          }<br>No. of Deaths: ${data.data[1].length}`
        )
        .style("left", `${event.pageX - 10}px`)
        .style("top", `${event.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (event, data) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function (event) {
      hoverValue = "";
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  ageArcs
    .append("text")
    .attr("transform", (d) => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text((d) => ages(d.data[0]))
    .style("pointer-events", "none");

  const sexGroupContainer = pieSvgTwo
    .append("g")
    .attr(
      "transform",
      `translate(${dimensions.pieWidth / 2}, ${dimensions.pieHeight / 2})`
    );

  const sexArcs = sexGroupContainer
    .selectAll(".sex-arcs")
    .data(pie(sexArcGroup))
    .enter()
    .append("g")
    .attr("class", "sex-arcs");

  sexArcs
    .append("path")
    .attr("d", path)
    .attr("fill", (d) =>
      d.data[0] === 0
        ? mapLegendColorScale("Male")
        : mapLegendColorScale("Female")
    )
    .attr("opacity", 0.8)
    .attr("stroke", "#ddd")
    .attr("stroke-width", "0.5px")
    .style("cursor", "pointer")
    .on("mouseover", function (event, data) {
      hoverValue = data.data[0];
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", (d) => (hoverValue === +d.gender ? 1 : 0));
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `Sex: ${data.data[0] === 0 ? "Male" : "Female"}<br/>Deaths: ${
            data.data[1].length
          }`
        )
        .style("left", `${event.pageX - 10}px`)
        .style("top", `${event.pageY - 10}px`)
        .style("border", "1px solid #8A0100")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px");
    })
    .on("mousemove", function (event, data) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function (event) {
      hoverValue = "";
      d3.selectAll(".age-sex-circle")
        .transition()
        .duration(100)
        .attr("opacity", 1);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  sexArcs
    .append("text")
    .attr(
      "transform",
      (d) => `translate(${path.centroid(d)[0]}, ${path.centroid(d)[1] - 25})`
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text((d) => (+d.data[0] === 0 ? "Male" : "Female"));

  sexArcs
    .append("text")
    .attr("transform", (d) => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .text(
      (d) =>
        Math.round((d.data[1].length / deaths_age_sex_data.length) * 100) + "%"
    )
    .style("pointer-events", "none");
};

drawChart();

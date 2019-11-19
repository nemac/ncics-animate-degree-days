// year, sum_cdd, sum_hdd, diff_cdd, diff_hdd
// diff values are percentages
let data = d3.csvParse(rawData);

let lineStrokeWidth = "2.5";

let cicsRed = "#E4191C";
let cicsBlue = "#1E78B4";

data = data.map(d => {
  return {
    year: d.year,
    sum_cdd: +d.sum_cdd,
    sum_hdd: +d.sum_hdd
  };
});

let years = data.map(d => d.year);

let margin = { top: 120, right: 100, bottom: 60, left: 100 },
    chartWidth = 1200 - margin.left - margin.right,
    chartHeight = 850 - margin.top - margin.bottom;

// x is a scale with domain as years
let x = d3.scaleLinear()
    .domain([ 1895, 2018 ])
    .range([0, chartWidth])

// Min/max values across heating and cooling degree days
let cddMax = d3.max(data, d => +d.sum_cdd)
let cddMin = d3.min(data, d => +d.sum_cdd)

let hddMax = d3.max(data, d => +d.sum_hdd)
let hddMin = d3.min(data, d => +d.sum_hdd)

let y_cdd = d3.scaleLinear()
    .domain([0, 1600])
    .range([chartHeight, 0])

let y_hdd = d3.scaleLinear()
    .domain([3000, 7000])
    .range([chartHeight, 0])

// Sum cooling degree days line
let sum_cdd_line = d3.line()
    .x(d => x(+d.year))
    .y(d => y_cdd(+d.sum_cdd))

// Sum heating degree days line
let sum_hdd_line = d3.line()
    .x(d => x(+d.year))
    .y(d => y_hdd(+d.sum_hdd))

let xAxis = d3.axisBottom(x)
    .tickFormat(d3.format("0"))
    .tickPadding(5)
    .tickValues([1895, 1905, 1915, 1925, 1935, 1945, 1955, 1965, 1975, 1985, 1995, 2005, 2015])

let yAxisCdd = d3.axisRight(y_cdd).ticks(8)

let yAxisHdd = d3.axisLeft(y_hdd).ticks(5)

let chartContainer = d3.selectAll(".chart-container")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)

// Chart title
chartTitle = chartContainer.append("g")
  .attr("class", "title")
  .attr("transform", `translate(${chartWidth/2 - margin.left - 55}, 25)`)
  .append("text")

chartTitle.append("tspan")
  .text("Annual Heating and Cooling Degree Days")
  .attr("x", "0")

chartTitle.append("tspan")
  .attr("y", "45")
  .attr("x", "60")
  .text("in the Contiguous United States")

chartContainer.append("g")
  .attr("class", "axis-label hdd-label")
  .append("text")
    .text("Heating Degree Days")
    .attr("transform", `rotate(-90) translate(-${chartHeight/2 + margin.top + 60}, 20)`)

chartContainer.append("g")
  .attr("class", "axis-label cdd-label")
  .append("text")
    .text("Cooling Degree Days")
    .attr("transform", `rotate(90) translate(${chartHeight/2}, -${chartWidth + margin.right + 75} )`)


let chart = chartContainer.append("g")
  .attr("class", "chart")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// x axis - year
chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(xAxis)
//    .selectAll("text")
//      .attr("x", 20)
//      .attr("y", -4)
//      .attr("transform", "rotate(90)")

// y axis - cooling degree days
chart.append("g")
    .attr("class", "y axis cdd")
    .attr("transform", `translate(${chartWidth}, 0)`)
    .call(yAxisCdd)

// y axis - heating degree days
chart.append("g")
    .attr("class", "y axis hdd")
    .call(yAxisHdd)

let t = d3.transition()
  .duration(6000)
  .ease(d3.easeLinear)

// cooling degree-days svg path
let cdd_path = chart.append("path")
    .attr("d", sum_cdd_line(data))
    .attr("fill", "white")
    .attr("stroke", cicsRed)
    .attr("stroke-width", lineStrokeWidth)


// heating degree days svg path
let hdd_path = chart.append("path")
    .attr("d", sum_hdd_line(data))
    .attr("fill", "white")
    .attr("stroke", cicsBlue)
    .attr("stroke-width", lineStrokeWidth)


// Hack for animating the data lines.
// An invisible rectangle initially covers the graph,
// then gradually reduces its width to 0 in such a way
// that the graph collapses from the left to the right.
let rect = chart.append("g")
    .append("rect")
    .attr("fill", "white")
    .attr("height", chartHeight)
    .attr("width", chartWidth)
    .attr("x", 0)
    .transition(t)
      .attr("width", 0)
      .attr("x", chartWidth)

// Legend bits come last so they draw over the "animation" rect
let legend = chart.append("g")
  .attr("class", "legend wrapper")
  .attr("transform", `translate(${margin.left - 20}, ${chartHeight - 120})`) 
let legendLineLength = "50"
let legendLabelBufferLength = "10"

let legendHeating = legend.append("g")
  .attr("class", "legend row")

legendHeating.append("line")
  .attr("x1", "0")
  .attr("x2", legendLineLength)
  .attr("y1", "-9")
  .attr("y2", "-9")
  .attr("stroke", cicsBlue)
  .attr("stroke-width", lineStrokeWidth)

legendHeating.append("text")
  .text("Heating")
  .attr("class", "legend label")
  .attr("x", `${parseInt(legendLineLength) + parseInt(legendLabelBufferLength)}`)

let legendCooling = legend.append("g")
  .attr("class", "legend element")
  .attr("transform", "translate(0, 38)")

legendCooling.append("text")
  .text("Cooling")
  .attr("class", "legend label")
  .attr("x", `${parseInt(legendLineLength) + parseInt(legendLabelBufferLength)}`)

legendCooling.append("line")
  .attr("x1", "0")
  .attr("x2", legendLineLength)
  .attr("y1", "-9")
  .attr("y2", "-9")
  .attr("stroke", cicsRed)
  .attr("stroke-width", lineStrokeWidth)


/*
// cooling degree days points
chart.append("g")
  .attr("class", "points")
  .selectAll("circle")
    .data(data)
    .enter()
      .append("circle")
        .attr("cx", (d) => x(new Date(d.year, 0, 1)))
        .attr("cy", (d) => y(d.sum_cdd))
        .attr("r", "3")
        .attr("fill", cicsBlue)
        .attr("stroke", cicsBlue)

// heating degree days points
chart.append("g")
  .attr("class", "points")
  .selectAll("circle")
    .data(data)
    .enter()
      .append("circle")
        .attr("cx", (d) => x(new Date(d.year, 0, 1)))
        .attr("cy", (d) => y(d.sum_hdd))
        .attr("r", "3")
        .attr("fill", cicsRed)
        .attr("stroke", cicsRed)
*/




// year, sum_cdd, sum_hdd, diff_cdd, diff_hdd
// diff values are percentages
let data = d3.csvParse(rawData);

data = data.map(d => {
  return {
    year: d.year,
    sum_cdd: +d.sum_cdd,
    sum_hdd: +d.sum_hdd
  };
});

let years = data.map(d => d.year);

let margin = { top: 20, right: 70, bottom: 60, left: 100 },
    chartWidth = 1000 - margin.left - margin.right,
    chartHeight = 600 - margin.top - margin.bottom;

// x is a scale with domain as years
let x = d3.scaleTime()
    .domain([new Date(d3.min(years), 0, 1), new Date(d3.max(years), 0, 1)])
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
    .x(d => x(new Date(d.year, 0, 1)))
    .y(d => y_cdd(+d.sum_cdd))

// Sum heating degree days line
let sum_hdd_line = d3.line()
    .x(d => x(new Date(d.year, 0, 1)))
    .y(d => y_hdd(+d.sum_hdd))

let xAxis = d3.axisBottom(x)
    .tickArguments([d3.timeYear.every(10)])
    .tickFormat(d3.timeFormat("%Y"))

let yAxisCdd = d3.axisRight(y_cdd).ticks(8)

let yAxisHdd = d3.axisLeft(y_hdd).ticks(5)

let chart = d3.selectAll(".chart")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
  // Add an svg 'div' that offsets chart elements by the top and left margin
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(xAxis)
    .selectAll("text")
      .attr("x", 20)
      .attr("y", -4)
      .attr("transform", "rotate(90)")

chart.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${chartWidth}, 0)`)
    .call(yAxisCdd)

chart.append("g")
    .attr("class", "y axis")
    .call(yAxisHdd)

let t = d3.transition()
  .duration(4000)
  .ease(d3.easeLinear)

let data_inc = [];

// cooling degree-days svg path
let cdd_path = chart.append("path")
    .attr("d", sum_cdd_line(data))
    .attr("fill", "white")
    .attr("stroke", "red")
    .attr("stroke-width", "2")


// heating degree days svg path
let hdd_path = chart.append("path")
    .attr("d", sum_hdd_line(data))
    .attr("fill", "white")
    .attr("stroke", "blue")
    .attr("stroke-width", "2")


let rect = chart.append("g")
    .append("rect")
    .attr("fill", "white")
    .attr("height", chartHeight)
    .attr("width", chartWidth)
    .attr("x", 0)
    .transition(t)
      .attr("width", 0)
      .attr("x", chartWidth)

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
        .attr("fill", "blue")
        .attr("stroke", "blue")

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
        .attr("fill", "red")
        .attr("stroke", "red")
*/

chart.append("g")
  .attr("class", "axis-label hdd-label")
  .append("text")
    .text("Heating Degree Days")
    .attr("transform", `rotate(-90) translate(-${chartHeight/2 + margin.top + margin.bottom}, -${margin.left - 30} )`)

chart.append("g")
  .attr("class", "axis-label cdd-label")
  .append("text")
    .text("Cooling Degree Days")
    .attr("transform", `rotate(90) translate(${chartHeight/2 - margin.top - margin.bottom}, ${-chartWidth - margin.right/2 - 10} )`)

chart.append("g")
  .attr("class", "axis-label")
  .append("text")
    .text("Year")
    .attr("transform", `translate(${chartWidth/2}, ${chartHeight + margin.bottom})`)




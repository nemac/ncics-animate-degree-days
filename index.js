// year, sum_cdd, sum_hdd, diff_cdd, diff_hdd
// diff values are percentages
let data = d3.csvParse(rawData);

let lineStrokeWidth = "2.5";

let cicsRed = "#E4191C";
let cicsBlue = "#1E78B4";

let startAnimationYear = 1980

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


let main = () => {
  let chartNote = appendChartNote(chartContainer, "Warmer winters led to a reduction in heating demand since 1980.")
  let chart = appendChart(chartContainer);

  let hddAxisLabel = appendChartLabelHdd(chartContainer);
  let hddAxisSvg = appendAxisYHdd(chart);
 
  // Append the axes
  let xAxisSvg = appendAxisX(chart);

  // Draw the data paths
  let hddPath = appendHddPath(chart);

  // Add a dotted line at 1980
  let startYearLine = appendStartYearLine(chart);

  let coverRect = appendCoverRect(chart, "cover");
  let animatingRect = appendCoverRect(chart, "animate");

  let legend = addLegendToChart(chart);
  let hddLegend = legend.selectAll(".hdd-legend");
  let cddLegend = legend.selectAll(".cdd-legend");

  hideElements([cddLegend]);

  // Re-order elements to hide one path behind covering rect
  coverRect.raise()
  hddPath.raise()
  animatingRect.raise()
  startYearLine.raise()

  // Start the animation
  let animateRectTransition = animateAnimatingRect(animatingRect, 2000);
  let newAnimateRectTransition;

  let cddAxisSvg = appendAxisYCdd(chart);
  cddAxisSvg.call(yAxisCdd.ticks(0));

  animateRectTransition.end().then(function(d, i) {

    setTimeout(() => {

      // Change the text of the chart note
      chartNote.selectAll("text").text("Air conditioning use increased in recent years due to rising summer temperatures.")
  
      // Draw the other path
      let cddPath = appendCddPath(chart);

      coverRect.raise()
      cddPath.raise()
      startYearLine.raise()

      animatingRect.remove()
      
      cddAxisSvg.call(yAxisCdd.ticks(8));

      // Add other axis
      let cddAxisLabel = appendChartLabelCdd(chartContainer);

      // Hide the existing axis
      hddAxisSvg.call(yAxisCdd.ticks(0))
      hideElements([hddAxisLabel, hddPath, hddLegend]);
      unhideElements([cddLegend]);

      // Setup another animation rect
      // (having issues trying to reset the original, so we just build another one)
      let newAnimatingRect = appendCoverRect(chart, "animate");
      newAnimateRectTransition = animateAnimatingRect(newAnimatingRect, 2000);

      cddAxisSvg.raise()
      // After the second path draws, wait a moment and then unhide the other path
      newAnimateRectTransition.end().then(function(d, i) {
        setTimeout(() => {
          coverRect.lower()
          unhideElements([hddLegend, hddAxisSvg, hddAxisLabel, hddPath])
          chartNote.selectAll("text").text("")
          // Reset the axis ticks
          cddAxisSvg.call(yAxisCdd.ticks(8))
          hddAxisSvg.call(yAxisHdd.ticks(5))
          //hideElements([startYearLine])
        }, 2000);
      })
    }, 2000);
  })

}

let hideElements = list => {
  list.forEach(e => e.classed("hidden", true));
}

let unhideElements = list => {
  list.forEach(e => e.classed("hidden", false));
}

let resetAnimatingRect = rectContainer => {

  let rect = rectContainer.selectAll("rect")

  rect.attr("x", x(startAnimationYear))
      .attr("width", chartWidth - x(startAnimationYear))

  console.log(rect)

}

let appendChartNote = (chartContainer, text) => {

  // Chart note
  let chartTitle = chartContainer.append("g")
    .attr("class", "chart-note")
    .attr("transform", `translate(${margin.left*1.5}, ${margin.top/3})`)

  chartTitle.append("text")
    .text(text)

  return chartTitle; 
}

let appendChartLabelHdd = chartContainer => {

  let label = chartContainer.append("g")
    .attr("class", "axis-label hdd-label")
    .append("text")
      .text("Heating Degree Days")
      .attr("transform", `rotate(-90) translate(-${chartHeight/2 + margin.top + 60}, 20)`)

  return label;

}

let appendChartLabelCdd = chartContainer => {

  let label = chartContainer.append("g")
    .attr("class", "axis-label cdd-label")

  label.append("text")
    .text("Cooling Degree Days")
    .attr("transform", `rotate(90) translate(${chartHeight/2}, -${chartWidth + margin.right + 75} )`)

  return label;

}


let appendChart = chartContainer => {

  let chart = chartContainer.append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return chart;

}

let appendAxisX = chart => {

  let xAxisSvg = chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxis)

  return xAxisSvg 
}


let appendAxisYCdd = chart => {

  // y axis - cooling degree days
  let yAxisCddSvg = chart.append("g")
      .attr("class", "y axis cdd")
      .attr("transform", `translate(${chartWidth}, 0)`)
      .call(yAxisCdd)

  return yAxisCddSvg;

}

let appendAxisYHdd = chart => {

  // y axis - heating degree days
  let yAxisHddSvg = chart.append("g")
      .attr("class", "y axis hdd")
      .call(yAxisHdd)

  return yAxisHddSvg;

}

let appendCddPath = chart => {

  // cooling degree-days svg path
  let cddPath = chart.append("path")
      .attr("d", sum_cdd_line(data))
      .attr("fill", "white")
      .attr("stroke", cicsRed)
      .attr("stroke-width", lineStrokeWidth)

  return cddPath;

}

let appendHddPath = chart => {

  // heating degree days svg path
  let hddPath = chart.append("path")
      .attr("d", sum_hdd_line(data))
      .attr("fill", "white")
      .attr("stroke", cicsBlue)
      .attr("stroke-width", lineStrokeWidth)

  return hddPath;

}


let appendStartYearLine = chart => {

  let startYearLine = chart.append("g")
    .attr("class", "start-year-line")

  startYearLine.append("text")
    .attr("class", "start-year-line-label")
    .attr("x", x(startAnimationYear))
    .attr("y", "-5")
    .attr("fill", "gray")
    .attr("text-anchor", "middle")
    .text(startAnimationYear)
  
  startYearLine.append("line")
    .attr("x1", x(startAnimationYear))
    .attr("x2", x(startAnimationYear))
    .attr("y1", "0")
    .attr("y2", chartHeight)
    .attr("stroke", "gray")
    .attr("stroke-width", ".5")
    .attr("stroke-dasharray", "5")

  return startYearLine; 

}


// Hack for animating the data lines.
// An invisible rectangle initially covers the graph,
// then gradually reduces its width to 0 in such a way
// that the graph collapses from the left to the right.

let appendCoverRect = (chart, className) => {

  let rect = chart.append("g")

  rect.append("rect")
    .attr("class", className)
    .attr("fill", "white")
    .attr("height", chartHeight)
    .attr("width", chartWidth - x(startAnimationYear) + 10)
    .attr("x", x(startAnimationYear))
  
  return rect;

}

let animateAnimatingRect = (rect, duration, delay=0) => {

  let t = d3.transition()
    .ease(d3.easeLinear)
    .duration(duration)
    .delay(delay)

  rect.selectAll("rect").transition(t)
      .attr("width", 0)
      .attr("x", chartWidth)

  return t;

}



// Legend bits come last so they draw over the "animation" rect

let addLegendToChart = chart => {

  let legendLineLength = "50"
  let legendLabelBufferLength = "10"

  let legend = chart.append("g")
    .attr("class", "legend wrapper")
    .attr("transform", `translate(${margin.left - 20}, ${chartHeight - 120})`) 

  let legendHeating = legend.append("g")
    .attr("class", "legend row hdd-legend")

  legendHeating.append("line")
    .attr("x1", "0")
    .attr("x2", legendLineLength)
    .attr("y1", "-9")
    .attr("y2", "-9")
    .attr("stroke", cicsBlue)
    .attr("stroke-width", lineStrokeWidth)

  legendHeating.append("text")
    .text("Heating Degree Days")
    .attr("class", "legend label")
    .attr("x", `${parseInt(legendLineLength) + parseInt(legendLabelBufferLength)}`)

  let legendCooling = legend.append("g")
    .attr("class", "legend row cdd-legend")
    .attr("transform", "translate(0, 38)")

  legendCooling.append("text")
    .text("Cooling Degree Days")
    .attr("class", "legend label")
    .attr("x", `${parseInt(legendLineLength) + parseInt(legendLabelBufferLength)}`)

  legendCooling.append("line")
    .attr("x1", "0")
    .attr("x2", legendLineLength)
    .attr("y1", "-9")
    .attr("y2", "-9")
    .attr("stroke", cicsRed)
    .attr("stroke-width", lineStrokeWidth)

  return legend;

}


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



main();

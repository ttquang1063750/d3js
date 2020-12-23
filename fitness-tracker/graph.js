const margin = {top: 40, right: 20, bottom: 50, left: 100};
const outerWidth = 560;
const outerHeight = 400;
const graphWidth = outerWidth - margin.left - margin.right;
const graphHeight = outerHeight - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', outerWidth)
    .attr('height', outerHeight);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// Axes groups
const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');

// d3 line path generator
const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.distance));

// Line path element
const path = graph.append('path');

// Create dotted line group
const dottedLines = graph.append('g')
    .attr('class', 'lines')
    .style('opacity', 0);

const xDottedLine = dottedLines.append('line')
    .attr('class', 'x-line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);

const yDottedLine = dottedLines.append('line')
    .attr('class', 'y-line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);

const update = (data) => {

    // Filter data based on activity
    data = data.filter(d => d.activity === activity);

    // Sort data based on date object
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Set scale domain
    // d3.extent call min/max
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([0, d3.max(data, d => d.distance)]);

    // Update path data
    path.data([data])
        .attr('fill', 'none')
        .attr('stroke', '#00bfa5')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Create circle
    const circles = graph.selectAll('circle')
        .data(data);

    circles.exit().remove();

    // Add new point
    circles.enter()
        .append('circle')
        .attr('r', 4)
        .attr('fill', '#ccc')
        .merge(circles)
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance));

    graph.selectAll('circle')
        .on('mouseover', (d, i, a) => {
            d3.select(a[i])
                .transition('mouseover').duration(100)
                .attr('r', 8)
                .attr('fill', '#fff');

            xDottedLine
                .attr('x1', x(new Date(d.date)))
                .attr('y1', graphHeight)
                .attr('x2', x(new Date(d.date)))
                .attr('y2', y(d.distance));

            yDottedLine
                .attr('x1', 0)
                .attr('y1', y(d.distance))
                .attr('x2', x(new Date(d.date)))
                .attr('y2', y(d.distance));

            dottedLines.style('opacity', 1);
        })
        .on('mouseleave', (d, i, a) => {
            d3.select(a[i])
                .transition('mouseleave').duration(100)
                .attr('r', 4)
                .attr('fill', '#ccc');

            dottedLines.style('opacity', 0);
        });

    // Create axes
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm');

    // Call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Rotate axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end');
};


let data = [];
db.collection('activities').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id};
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id === doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });

    update(data);
});

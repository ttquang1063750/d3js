const dims = {height: 300, width: 300, radius: 150};
const cent = {x: (dims.width / 2 + 5), y: (dims.height / 2 + 5)};
const colour = d3.scaleOrdinal(d3['schemeSet3']);
const tAngle = d3.transition().duration(750);

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150);

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`);

const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 40}, 10)`);


const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(colour);

const convertToSI = (value, base, unity) => {
    let tableUnit = [ ' ', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
    if (value === 0 || value === null) return '0.00 ' + unity;
    let n = parseInt(Math.floor(Math.log(value) / Math.log(base)), 10);
    let valueSized = value / Math.pow(base, n);
    if (valueSized >= base) {
        n++;
        valueSized = 1;
    }
    return valueSized.toFixed(1) + tableUnit[n] + ' ' + unity;
};

const tooltip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        return `
            <div class="name" style="text-transform: capitalize;">${d.data.name}</div>
            <div class="cost">${convertToSI(d.data.cost, 1000, 'đồng')}</div>
            <div class="delete">Click slice to delete</div>
`;
    });

graph.call(tooltip);

const pie = d3.pie()
    .sort(null)
    .value(d => d.cost);

const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);


const update = (data) => {
    tooltip.hide();

    // Update colour scale domain
    colour.domain(data.map(d => d.name));

    // Update and call legend
    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('fill', 'white');

    // Join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));

    // Handler delete
    paths.exit()
        // .transition(tAngle)
        // .attrTween('d', (d) => {
        //     // Chart remove from startAngle to endAngle
        //     const i = d3.interpolate(d.startAngle, d.endAngle);
        //     return (t) => {
        //         d.startAngle = i(t);
        //
        //         return arcPath(d);
        //     };
        // })
        .remove();

    // handler update
    paths.attr('d', arcPath)
        .attr('fill', d => colour(d.data.name))
        .transition(tAngle)
        .attrTween('d', (d, i, a) => {
            // Should only update from current to the new state
            // Interpolate between the two objects
            const interpolate = d3.interpolate(a[i].__current, d);

            // Update the current prop with the new updated data
            a[i].__current = interpolate(1);

            return (t) => arcPath(interpolate(t));
        });


    // handler create
    paths.enter().append('path')
        .attr('class', 'arc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
        .each((d, i, a) => {
            a[i].__current = d;
        })
        .transition(tAngle)
        .attrTween('d', (d) => {
            // Chart start from endAngle to startAngle
            const i = d3.interpolate(d.endAngle, d.startAngle);
            return (t) => {
                d.startAngle = i(t);

                return arcPath(d);
            };
        });

    // Add events
    graph.selectAll('path')
        .on('mouseover', (d, i, a) => {
            d3.select(a[i])
                // Prevent transition interrupt we should give it a named
                .transition('mouseover').duration(300)
                .attr('fill', 'white');

            tooltip.show(d, a[i]);
        })
        .on('mouseout', (d, i, a) => {
            d3.select(a[i])
                // Prevent transition interrupt we should give it a named
                .transition('mouseout').duration(300)
                .attr('fill', colour(d.data.name));

            tooltip.hide();
        })
        .on('click', d => {
            const id = d.data.id;
            db.collection('expenses').doc(id).delete();
        })
};


// Fetch data from firestore
let data = [];
bindDb(db, 'expenses', rows => {
    data = rows;
    update(data);
});

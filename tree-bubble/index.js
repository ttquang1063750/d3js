const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', document.body.clientWidth)
    .attr('height', 700);

const left = (document.body.clientWidth - 600) / 2;
const graph = svg.append('g')
    .attr('transform', `translate(${left}, 50)`);


const stratify = d3.stratify()
    .id(d => d.id)
    .parentId(d => d.parent);

// Create ordinal scale
const colour = d3.scaleOrdinal(d3['schemeSet3']);

const update = (data) => {
    // Remove nodes
    graph.selectAll('g').remove();

    const rootNodes = stratify(data)
        .count(d => d.department);


    const pack = d3.pack()
        .size([600, 600])
        .padding(5);

    const bubbleData = pack(rootNodes).descendants();

    // Join data and add group for each node
    const nodes = graph.selectAll('g')
        .data(bubbleData)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);


    nodes.append('circle')
        .attr('r', d => d.r)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', d => colour(d.depth));

   //  Add text to the node don't have any children
    nodes.filter(node => !node.children)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', d => getContrast(colour(d.depth)))
        .style('font-size', d => (d.r * 2) / d.data.name.length)
        .text(d => d.data.name);
};

let data = [];
bindDb(db, 'tree', rows => {
    data = rows;
    update(data);
});

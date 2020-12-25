const margin = {left: 100, top: 100};
const dims = {width: document.body.clientWidth, height: 700};
const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height);

const graph = svg.append('g')
    .attr('transform', `translate(0, ${margin.top / 2})`);

const tooltip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        return `
            <div class="name" style="text-transform: capitalize;">${d.data.name}</div>
            <div class="department">${d.data.department}</div>
            <div class="delete">Click to delete node</div>
`;
    });

graph.call(tooltip);

// Stratify
const stratify = d3.stratify()
    .id(d => d.id)
    .parentId(d => d.parent);

const tree = d3.tree()
    .size([dims.width - margin.left, dims.height - margin.top]);


const colour = d3.scaleOrdinal(d3['schemeSet3']);

// Update
const update = (data) => {
    // Remove elements
    tooltip.hide();
    graph.selectAll('.node').remove();
    graph.selectAll('.link').remove();
    if (data.length === 0) {
        return;
    }

    const rootNodes = stratify(data);
    const treeData = tree(rootNodes);

    const nodes = graph.selectAll('.node')
        .data(treeData.descendants());


    colour.domain(data.map(d => d.department));

    // Get link selection
    const links = graph.selectAll('.link')
        .data(treeData.links());

    // Enter new links
    links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#aaa')
        .attr('stroke-width', 2)
        .attr('d',
            d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
        );

    // Create enter node groups
    const enterNodes = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

    enterNodes
        .append('rect')
        .attr('fill', d => colour(d.data.department))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2)
        .attr('height', 30)
        .attr('width', d => d.data.name.length * 12)
        .attr('transform', d => {
            const x = d.data.name.length * 12;
            return `translate(${-x / 2}, -15)`;
        });

    // Append Text
    enterNodes
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', d => getContrast(colour(d.data.department)))
        .attr('dy', '7px')
        .text(d => d.data.name);


    enterNodes
        .on('mouseover', (d, i, n) => {
            tooltip.show(d, n[i]);
        })
        .on('mouseout', () => {
            tooltip.hide();
        })
        .on('click', d => {
            const ids = d.descendants().map(node => node.data.id).reverse();
            ids.forEach(id => {
                db.collection('tree').doc(id).delete();
            });
        });

};

let data = [];
bindDb(db, 'tree', rows => {
    data = rows;
    const select = document.querySelector('select');
    select.querySelectorAll('option').forEach(o => o.remove());
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Select Parent';
    select.appendChild(option);

    for(const d of data) {
        const option = document.createElement('option');
        option.value = d.id;
        option.textContent = d.name;
        select.appendChild(option);
    }
    update(data);
});

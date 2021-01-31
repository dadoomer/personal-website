// Note to future self. I did this by combining these two:
// https://observablehq.com/@d3/force-directed-graph?collection=@d3/d3-force
// https://stackoverflow.com/questions/60746090/can-d3-js-visualizations-be-served-using-hugo
// You will figure it out.
// d3 = require("d3@6");
function graph(data, color_function, target_div_class) {

	height = 600;
	width = 600;

	drag = simulation => {
		
		function dragstarted(event) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}
		
		function dragged(event) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}
		
		function dragended(event) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
		
		return d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended);
	};

	const links = data.links.map(d => Object.create(d));
	const nodes = data.nodes.map(d => Object.create(d));

	const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2));

	//const simulation = d3.forceSimulation(nodes)
	//	.force("link", d3.forceLink(links).id(d => d.id))
	//	.force("charge", d3.forceManyBody())
	//	.force("x", d3.forceX())
	//	.force("y", d3.forceY());

	const svg = d3.select(target_div_class).append("svg")
			.attr("viewBox", [0, 0, width, height])
			.call(d3.zoom()
				.extent([[0, 0], [width, height]])
				.scaleExtent([0.5, 4])
				.on("zoom", zoomed));

	function zoomed({transform}) {
		link.attr("transform", transform);
		node.attr("transform", transform);
	}

	const link = svg.append("g")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(links)
		.join("line")
			.attr("stroke-width", d => (d.weight*2));

	const node = svg.append("g")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1.5)
		.selectAll("circle")
		.data(nodes)
		.join("circle")
			.attr("r", 5)
			.attr("fill", d => color_function(d))
			.call(drag(simulation));

	node.append("title")
			.text(d => d.id);

	simulation.on("tick", () => {
		link
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);

		node
				.attr("cx", d => d.x)
				.attr("cy", d => d.y);
	});

	//invalidation.then(() => simulation.stop());
}

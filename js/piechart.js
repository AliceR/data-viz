function createpiechart(){
	var distances = [0,0,0];

	for (var i = 0; i < dataset.length; i++) {

		var A = L.latLng(dataset[i].origin);
		var B = L.latLng(dataset[i].destination);

		var d = A.distanceTo(B);
		console.log(d);

		if (d <= 5000) {
			distances[0] = distances[0] +1;
		} else if (d > 5000 && d <= 15000) {
			distances[1] = distances[1] +1;
		} else {
			distances[2] = distances[2] +1;
		}
	}

	// TODO: update size on window change
	var w = document.getElementById('piechart').clientWidth-20;
	var h = document.getElementById('piechart').clientHeight-20;
	var padding = 20;

	var pie = d3.layout.pie();

	var outerRadius = w / 2;
	var innerRadius = 0;
	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var svg = d3.select('#piechart')
		.append('svg')
		.attr({
			width: w,
			height: h
		});

	var arcs = svg.selectAll("g.arc")
        .data(pie(distances))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");

    // TODO: choose nicer colors for pie
	var color = d3.scale.linear()
	    .domain([1,2,3])
	    .range(['#a33acf','#cf3ab1', '#3acfa3']);

    arcs.append("path")
		.attr("fill", function(d, i) {
		    return color(i);
		})
		.attr("d", arc);

	// TODO: better labels
	arcs.append('text')
		.attr('transform', function(d) {
			return 'translate(' + arc.centroid(d) + ')';
		})
		.attr('text-anchor', 'middle')
		.text(function(d) {
			return d.value;
		})

}
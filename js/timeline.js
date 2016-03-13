function createtimeline(){
	var everyhour = [], hours = [], counts = {}, prev;

	for (var i = 0; i < subset.length; i++) {
		var at = new Date(subset[i].at);
		var t = at.getHours();
		everyhour.push(t);
	}

	// TODO: create data object in a format I can use directly in .data()
	//		{'key': 0, 'value': 42},...	
	for(var i = 0; i< everyhour.length; i++) {
	    var num = everyhour[i];	
	    // TODO: understand this
	    counts[num] = counts[num] ? counts[num]+1 : 1;
	}
	for (var k in counts) hours.push([counts[k]]);

	// TODO: update on window change
	var w = document.getElementById("timeline").clientWidth;
	var h = document.getElementById("timeline").clientHeight-30;
	var barPadding = 1;

	var xScale = d3.scale.ordinal()
		.domain(d3.range(hours.length))
		.rangeRoundBands([0, w],0.05);

	var yScale = d3.scale.linear()
		.domain([0, Math.max( ...hours ) + 20])
		.range([0, h]);

	var svg = d3.select('#timeline')
		.append('svg')
		.attr('width', w)
		.attr('height', h);

	svg.selectAll('rect')
		.data(hours)
		.enter()
		.append('rect')
		.attr({
			// TODO: color according to object key (hour)
			fill: 'teal',
			x: function(d, i){ return xScale(i); },
			y: function(d){ return h - yScale(d); },
			width: xScale.rangeBand(),
			height: function(d){ return yScale(d); }
		});

	svg.selectAll('text')
		.data(hours)
		.enter()
		.append('text')
		.text(function(d){
			return d;
		})
		.attr({
			// TODO: color according to object key (hour)
			fill: 'teal',
			x: function(d, i){ return xScale(i) + xScale.rangeBand() / 2; },
			y: function(d){ return h - yScale(d) - 3; },
			'text-anchor': 'middle'
		})

	// TODO: lable axis
}
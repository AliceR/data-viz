function createtimeline(){

	// TODO: click on bar selects filters data for this hour

	var everyhour = [], hours = [], counts = {}, prev;

	for (var i = 0; i < dataset.length; i++) {
		// invalid date in safari, therefore replace - with /
		var h = new Date(dataset[i].at.replace(/-/g, "/")).getHours();
		everyhour.push(h);
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
	var w = document.getElementById('timeline').clientWidth-20;
	var h = document.getElementById('timeline').clientHeight-30;
	var padding = 20;

	var color = d3.scale.linear()
	    .domain([0, 6, 12, 18, 24])
	    .range(['#1693a5', '#aec297', '#fbb829', '#d7a9a8', '#1693a5'])
	    .interpolate(d3.interpolateRgb);

	var xScale = d3.scale.ordinal()
		.domain(d3.range(hours.length))
		.rangeRoundBands([padding, w - padding],0.05);

	var barWidth = xScale.rangeBand();

	var yScale = d3.scale.linear()
		.domain([0, Math.max( ...hours )])
		.range([0, h - padding]);

	var svg = d3.select('#timeline')
		.append('svg')
		.attr('width', w)
		.attr('height', h + padding*2);

	svg.selectAll('rect')
		.data(hours)
		.enter()
		.append('rect')
		.attr({
			// color according to hour
			fill: function(d, i){ return color(i); },
			x: function(d, i){ return xScale(i); },
			y: function(d){ return h - yScale(d); },
			width: barWidth,
			height: function(d){ return yScale(d); }
		});

	svg.selectAll('text')
		.data(hours)
		.enter()
		.append('text')
		.text(function(d){ return d; })
		.attr({
			// color according to hour
			fill: function(d, i){ return color(i); },
			x: function(d, i){ return xScale(i) + barWidth / 2; },
			y: function(d){ return h - yScale(d) - 3; },
			'text-anchor': 'middle'
		});

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient('bottom')
		.tickFormat(function(d) { return d + ':00'; })
		.outerTickSize([]);

	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate('+ -barWidth/2 +',' + h + ')')
		.call(xAxis)
	  .selectAll('.tick text')
		.style('text-anchor', 'start')
		.attr('x', 2)
		.attr('y', 7);

	svg.append('text')
	    .attr({
	    	'class': 'x label',
	    	'text-anchor': 'end',
	    	'x': w - padding,
	    	'y': h + padding*1.5
	    })
	    .text('...time of the day');

}
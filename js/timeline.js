function createtimeline(){

	var everyhour = [], hours = [], counts = {};

	for (var i = 0; i < dataset.length; i++) {
		// invalid date in safari, therefore replace - with /
		var h = new Date(dataset[i].at.replace(/-/g, "/")).getHours();
		everyhour.push(h);
	}

	// TODO: create data object in a format I can use directly in .data(), like this :{'key': 0, 'value': 42},...	
	for(var i = 0; i< everyhour.length; i++) {
	    var num = everyhour[i];	
	    // TODO: understand this :-)
	    counts[num] = counts[num] ? counts[num]+1 : 1;
	}
	for (var k in counts) hours.push([counts[k]]);

	var w = document.getElementById('timeline').clientWidth;
	var h = document.getElementById('timeline').clientHeight;
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
		.append('div')
	   .classed('svg-container', true) // container class to make it responsive
	   .append('svg')
		// responsive SVG needs these 2 attributes and no width and height attr
	   .attr('preserveAspectRatio', 'xMinYMin meet')
	   .attr('viewBox', '0 0 '+ (w + padding) +' '+ (h + padding*2) +'')
	   // class to make it responsive
	   .classed('svg-content-responsive', true);

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
		})
		.on('click', function() {
			// TODO: only show markers (and routes) of that time 
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
			'text-anchor': 'middle',
			'font-size': barWidth/2
		});

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient('bottom')
		.tickFormat(function(d) { return d + ':00'; })
		.outerTickSize([]);

	svg.append('g')
		.attr('class', 'xaxis')
		.attr('transform', 'translate('+ -barWidth/2 +',' + h + ')')
		.call(xAxis)
	  .selectAll('.tick text')
		.style('text-anchor', 'start')
		.attr('x', 2)
		.attr('y', 7)
		.attr('font-size', barWidth/3);

	svg.append('text')
	    .attr({
	    	'class': 'axislabel',
	    	'text-anchor': 'start',
	    	'x': padding*1.5,
	    	'y': padding*1.5
	    })
	    .text('Total number of requests');

	svg.append('text')
	    .attr({
	    	'class': 'axislabel',
	    	'text-anchor': 'end',
	    	'x': w - padding*1.5,
	    	'y': h + padding*1.5
	    })
	    .text('...during the hours of a day');

}
function createViz(){
	
	// var spinner = 0;

	var map = L.map('map', {
		// crs: L.CRS.EPSG4326
	});
	map.setView([52.501943, 13.421628], 12);

	var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: 'Basemap: &#169; OpenStreetMap contributors, &#169; CartoDB',
	}).addTo(map);

	var ext_data = new L.OverPassLayer({
		endpoint: "http://overpass.osm.rambler.ru/cgi/",
		query: "node(BBOX)['railway'='station'];out;",
		callback: function(data) {
			// TODO: loading data waiting time spinner
			// if (spinner > 0) spinner -= 1;
			// if (spinner == 0) $('#spinner').hide();
			for(var i=0; i<data.elements.length; i++) {
				var e = data.elements[i];

				if (e.id in this.instance._ids) return;
				this.instance._ids[e.id] = true;
				var pos = new L.LatLng(e.lat, e.lon);
				var m = L.marker(pos, 25, {
					// TODO: insert custom icon
					icon : new L.Icon.Default(),
					// TODO: find out why title is not transmitted
					title: e.tags.name
				})
				this.instance.addLayer(m);
			}	
		},
		minzoom: 13,
		beforeRequest: function() {
			console.log('about to query the OverPassAPI');
		},
		afterRequest: function() {
			console.log('all queries have finished!');
		},
		minZoomIndicatorOptions: {
			position: 'topright',
			minZoomMessageNoLayer: 'no layer assigned',
			minZoomMessage: 'current Zoom-Level: CURRENTZOOM, external data loads at: MINZOOMLEVEL',
		}
	});
	map.addLayer(ext_data);

	// TODO: check why CRS won't fit
	// var cyclingWMSLayer = L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_radverkehrsanlagen", {
	//     layers: '0',
	//     format: 'image/png',
	//     version: '1.1.1',
	//     styles: 'default',
	//     // crs: 'EPSG:4326',
	//     attribution: "Geoportal Berlin / Radverkehrsanlagen",
	//     transparent: true
	// }).addTo(map);

	// color according to time
	var color = d3.scale.linear()
		.domain([0, 6, 12, 18, 24])
		.range(['#1693a5', '#aec297', '#fbb829', '#d7a9a8', '#1693a5'])
		.interpolate(d3.interpolateRgb);

	var markerLayerGroup = new L.FeatureGroup();
	var directionsLayerGroup = new L.FeatureGroup();
	var subset = dataset;
	var everyhour = [], hours = [], counts = {};

	function createMarkers(){

		for (var i = 0; i < subset.length; i++) {
			var datarow = subset[i];
			
			var origin = subset[i].origin;
			L.circleMarker([origin.lat,origin.lon],
			{
				radius: 5,
				className: 'mapMarker origin',
				datarow: datarow
			})
			.addTo(markerLayerGroup)
			.on('click', onClick)
			.on('mouseover', function(){
				this.setRadius(10);
			})
			.on('mouseout', function(){
				this.setRadius(5);
			});

			var destination = subset[i].destination;
			L.circleMarker([destination.lat,destination.lon], 
			{
				radius: 5,
				className: 'mapMarker destination',
				datarow: datarow
			})
			.addTo(markerLayerGroup).on('click', onClick)
			.on('mouseover', function(){
				this.setRadius(10);
			})
			.on('mouseout', function(){
				this.setRadius(5);
			});
		}
		return markerLayerGroup;
	}
	createMarkers().addTo(map);

	var legend = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'legend');

			container.innerHTML =
			'<div><i style="background: #3AB1CF"></i> Origin</div>' + '<br>' +
			'<div><i style="background: #434343"></i> Destination </div>';
			return container;
		}
	});

	map.addControl(new legend());

	L.mapbox.accessToken = 'pk.eyJ1IjoiY2FydG9saWNlIiwiYSI6ImNpZmR3cGExeDAwZXJ0amx5ZTZpbDR6bjYifQ.dhipV0B_b9422-ArK5e04Q';

	function onClick() {
		var A = L.latLng(this.options.datarow.origin);
		var B = L.latLng(this.options.datarow.destination);
		var C = new Date(this.options.datarow.at.replace(/-/g, "/")).getHours();
		calculateRoute(A, B, C);
	}

	map.on('boxzoomend', function(e) {
		for (var i = 0; i < markerLayerGroup.length; i++) {
			if (e.boxZoomBounds.contains(markerLayerGroup[i])) {
				console.log(markerLayerGroup[i]);
			}
		}
	});

	function calculateRoute(A, B, C){

		var routeStyle = {
			className: 'connection',
			color: color(C),
			weight: 4,
			opacity: 1};

		var directions = new L.mapbox.directions({
			profile: 'mapbox.cycling',
			units: 'metric'});
		var directionsLayer = new L.mapbox.directions.layer(directions, {
			readonly:true,
			routeStyle
		}).addTo(directionsLayerGroup);

		map.addLayer(directionsLayerGroup);
		// TODO: zoom to selected route. Uncaught TypeError: e.getBounds is not a function ?
		// map.fitBounds(directionsLayerGroup.getBounds());

		// for some reason (?) this is required to draw the route line
		var directionsRoutes = L.mapbox.directions.routesControl('routes', directions).addTo(map);

		directions.setOrigin(A).setDestination(B).query();

		// TODO: replace standard A and B icons with custom ones
		/*var myLayer = L.mapbox.featureLayer().addTo(map);
		myLayer.on('layeradd', function(e) {
	  		var marker = e.layer,
	      	feature = marker.feature;
	  		marker.setIcon(L.divIcon(feature.properties.icon));
		});
		myLayer.setGeoJSON(routeMarker);*/
	}

	L.Control.ClearRoutes = L.Control.extend(
	{
		options:
		{
			position: 'bottomleft',
		},
		onAdd: function (map) {
			var controlDiv = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
			L.DomEvent
			.addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
			.addListener(controlDiv, 'click', L.DomEvent.preventDefault)
			.addListener(controlDiv, 'click', function () {
				directionsLayerGroup.clearLayers();
			});

			var controlUI = L.DomUtil.create('a', 'leaflet-draw-edit-remove', controlDiv);
			controlUI.title = 'Clear map';
			controlUI.href = '#';
			controlUI.innerHTML = '<i class="fa fa-trash-o"></i>';
			return controlDiv;
		}
	});

	var clearRoutesControl = new L.Control.ClearRoutes();
	map.addControl(clearRoutesControl);

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

	var xScale = d3.scale.ordinal()
		.domain(d3.range(hours.length))
		.rangeRoundBands([padding, w - padding],0.05);

	var barWidth = xScale.rangeBand();

	var yScale = d3.scale.linear()
		.domain([0, Math.max( ...hours )])
		.range([0, h - padding]);

	var svg = d3.select('#timeline')
		.append('div')
		.classed('chart-container', true) // container class to make it responsive
		.append('svg')
		// responsive SVG needs these 2 attributes and no width and height attr
		.attr('preserveAspectRatio', 'xMinYMin meet')
		.attr('viewBox', '0 0 '+ (w + padding) +' '+ (h + padding*2) +' ')
		// class to make it responsive
		.classed('chart-content-responsive', true);

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
			height: function(d){ return yScale(d); },
			hour: function(d, i){ return i; }
		})
	   .on('click', function() {
			console.log('filter map markers');
			// clear subset and create new based on selected hour
			subset = [];
			for (var i = 0; i < dataset.length; i++) {
				var hd = new Date(dataset[i].at.replace(/-/g, "/")).getHours();
				var hs = d3.select(this).attr('hour');
				if( hd == hs){
					subset.push(dataset[i]);				
				}
			}
			d3.selectAll('rect').attr('stroke', 'none');
			d3.select(this).attr({'stroke': 'orange', 'stroke-width': '2px'});
			directionsLayerGroup.clearLayers();
			markerLayerGroup.clearLayers();
			createMarkers();
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
	   	'text-anchor': 'end',
	   	'x': w - padding*1.5,
	   	'y': h + padding*1.5
	   })
	   .text('...during the hours of a day');
}
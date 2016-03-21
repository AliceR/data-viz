function createViz(){

	var map = L.map('map', {
		// crs: L.CRS.EPSG4326
	});
	map.setView([52.501943, 13.421628], 12);

	var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: 'Basemap: &#169; OpenStreetMap contributors, &#169; CartoDB',
	}).addTo(map);

	//////////////////////////////
	/////// EXTERNAL DATA ////////
	//////////////////////////////

	// var spinner = 0;

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
				var m = L.marker(pos, {
					icon : L.divIcon({className: 'fa fa-subway ext_icon'}),
					title: e.tags.name
				});
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
			minZoomMessage: 'current Zoom-Level: CURRENTZOOM, external data loads at: MINZOOMLEVEL'
		}
	});

	map.addLayer(ext_data);
	ext_data.bringToBack();

	map.on('zoomend', function () {
		if (map.getZoom() < 13 && map.hasLayer(ext_data)) {
			map.removeLayer(ext_data);
		}
		if (map.getZoom() > 13 && map.hasLayer(ext_data) === false) {
			map.addLayer(ext_data);
		}
	});

	// TODO: check why CRS won't fit
	/*	var cyclingWMSLayer = L.tileLayer.wms("http://fbinter.stadt-berlin.de/fb/wms/senstadt/wmsk_radverkehrsanlagen", {
		layers: '0',
		format: 'image/png',
		version: '1.1.1',
		styles: 'default',
		// crs: 'EPSG:4326',
		attribution: "Geoportal Berlin / Radverkehrsanlagen",
		transparent: true
	}).addTo(map); */

	// color according to time
	var color = d3.scale.linear()
		.domain([0, 6, 12, 18, 24])
		.range(['#1693a5', '#aec297', '#fbb829', '#d7a9a8', '#1693a5'])
		.interpolate(d3.interpolateRgb);

	//////////////////////////////
	/////// CREATE MARKERS ///////
	//////////////////////////////

	var subset = dataset;
	var markerLayerGroup = new L.FeatureGroup();
	var directionsLayerGroup = new L.FeatureGroup();

	function createMarkers(){

		markerLayerGroup.clearLayers();
		$('#onbtn').addClass("active");
		$('#offbtn').removeClass("active");

		var originCluster = L.markerClusterGroup({
			showCoverageOnHover: false,
			iconCreateFunction: function(cluster) {
				var childCount = cluster.getChildCount();
				var s = Math.sqrt(3*childCount) + 10;

				return L.divIcon({
					className: 'mapMarker origin',
					iconSize: new L.Point(s, s)
				});
			},
			maxClusterRadius: function(zoom) {
				if(zoom > 7 ) {
					return 20;
				} else if (zoom > 12) {
					return 5;
				}
				return 50;
	       }
		});
		var destinationCluster = L.markerClusterGroup({
			showCoverageOnHover: false,
			iconCreateFunction: function(cluster) {
				var childCount = cluster.getChildCount();
				var s = Math.sqrt(2*childCount) + 10;

				return L.divIcon({
					className: 'mapMarker destination',
					iconSize: new L.Point(s, s)
				});
			},
			maxClusterRadius: function(zoom) {
				if(zoom > 7 ) {
					return 20;
				} else if (zoom > 12) {
					return 5;
				}
				return 50;
			}	
		});

		for (var i = 0; i < subset.length; i++) {
			var datarow = subset[i];

			var origin = subset[i].origin;
			L.marker([origin.lat,origin.lon],{
				icon: L.divIcon({
					className: 'mapMarker origin',
					iconSize: new L.Point(10, 10)
				}),
				datarow: datarow
			})
			.addTo(originCluster)
			.on('click', onClick);

			var destination = subset[i].destination;
			L.marker([destination.lat,destination.lon],{
				icon: L.divIcon({
					className: 'mapMarker destination',
					iconSize: new L.Point(10, 10)
				}),
				datarow: datarow
			})
			.addTo(destinationCluster)
			.on('click', onClick);
		}

		originCluster.addTo(markerLayerGroup);
		destinationCluster.addTo(markerLayerGroup);

		return markerLayerGroup;
	}
	createMarkers().addTo(map);

	//////////////////////////////
	// LEGEND AND MAP CONTROLS ///
	//////////////////////////////

	var legend = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'legend');

			container.innerHTML =
				'<div><i class="origin" ></i> Origin</div> <br>' +
				'<div><i class="destination" ></i> Destination </div>';
			return container;
		}
	});

	map.addControl(new legend());

	map.addControl(L.control.scale({imperial: false}));

	//////////////////////////////
	////////// ROUTING ///////////
	//////////////////////////////

	L.mapbox.accessToken = 'pk.eyJ1IjoiY2FydG9saWNlIiwiYSI6ImNpZmR3cGExeDAwZXJ0amx5ZTZpbDR6bjYifQ.dhipV0B_b9422-ArK5e04Q';

	function onClick() {
		var A = L.latLng(this.options.datarow.origin);
		var B = L.latLng(this.options.datarow.destination);
		var C = new Date(this.options.datarow.at.replace(/-/g, "/")).getHours();
		calculateRoute(A, B, C);
	}

	function calculateRoute(A, B, C){

		var routeStyle = {
			className: 'connection',
			color: color(C),
			weight: 4,
			opacity: 1};

			var directions = new L.mapbox.directions({
				profile: 'mapbox.cycling',
				units: 'metric'
			});
			var directionsLayer = new L.mapbox.directions.layer(directions, {
				readonly:true,
				routeStyle
			});
			directionsLayer.originMarker = L.circleMarker([0,0],{
					radius: 1,
					className: 'mapMarker origin',
			});
			directionsLayer.destinationMarker = L.circleMarker([0,0],{
					radius: 1,
					className: 'mapMarker destination',
			});

			directionsLayer.addTo(directionsLayerGroup);

			map.addLayer(directionsLayerGroup);

		// for some reason (?) this is required to draw the route line
		var directionsRoutes = L.mapbox.directions.routesControl('routes', directions).addTo(map);

		directions.setOrigin(A).setDestination(B).query();

		// Enabled button:
		$('#clearbtn').disable(false);

		// TODO: does not seem to work on mapbox.directions.layer
		// map.fitBounds(directionsLayerGroup.getBounds());

	}	
	//////////////////////////////
	////// CONTROL BUTTONS ///////
	//////////////////////////////

	$('#clearbtn').on('click', function(){
		directionsLayerGroup.clearLayers();
		$('#clearbtn').disable(true);
	});
	$('#extendbtn').on('click', function(){
		try {
			map.fitBounds(markerLayerGroup.getBounds());
		} catch (error) {
			console.log('layer not loaded');
		}
	});
	$('#onbtn').on('click', function(){
		createMarkers().addTo(map);
	});
	$('#offbtn').on('click', function(){
		markerLayerGroup.clearLayers();
	});

	// Disable function
	jQuery.fn.extend({
		disable: function(state) {
			return this.each(function() {
				this.disabled = state;
			});
		}
	});  

	/*$('#slider').slider({
		min:0,
		max:1,
		value: 0.4,
		step: 0.1,
		slide: function( event, ui ) {
			// does not work on FeatureGroups :(
			basemap.setOpacity(ui.value);
		}
	});*/

	//////////////////////////////
	//// TIMELINE STARTS HERE ////
	//////////////////////////////

	var everyhour = [], hours = [], counts = {};

	for (var i = 0; i < dataset.length; i++) {
		// invalid date in safari, therefore replace - with /
		var t = new Date(dataset[i].at.replace(/-/g, "/")).getHours();
		everyhour.push(t);
	}

	// TODO: create data object in a format I can use directly in .data(), like this :{'key': 0, 'value': 42},..	
	for(var i = 0; i< everyhour.length; i++) {
		var num = everyhour[i];
		// a ? b : c is the same as if a then b else c
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

			if (this.attributes.length > 6 && this.attributes[6].value == 'orange'){
				subset = dataset;
				d3.select(this).classed('selected', false);
			} else {
				// clear subset and create new based on selected hour
				subset = [];
				for (var i = 0; i < dataset.length; i++) {
					var hd = new Date(dataset[i].at.replace(/-/g, "/")).getHours();
					var hs = d3.select(this).attr('hour');
					if( hd == hs){
						subset.push(dataset[i]);
					}
				}
				d3.selectAll('rect').classed('selected', false);
				d3.select(this).classed('selected', true);
			}
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

	/* color scheme for documentation */
	var wc = document.getElementById('colorscheme').clientWidth;

	var colorscheme = d3.select('#colorscheme')
		.append('svg')
		.attr('width', wc)
		.attr('height', wc);

	var pseudocolor = [];
	for (var i = 0; i < 24; i++) { pseudocolor.push(1); }

	var pie = d3.layout.pie();
	pie.sort(null);
	var outerRadius = (wc/2);
	var innerRadius = ((wc/2)-40);
	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var colorarcs = colorscheme.selectAll('g.arc')
		.data(pie(pseudocolor))
		.enter()
		.append('g')
		.attr('class', 'arc')
		.attr('transform', 'translate(' + outerRadius + ', ' + outerRadius + ')');

	colorarcs.append('path')
		.attr('fill', function(d, i) {
			return color(i);
		})
		.attr('d', arc);
}
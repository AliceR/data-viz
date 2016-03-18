function createmap(){

	var map = L.map('map');
	map.setView([52.501943, 13.421628], 12);

	var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: '&#169; OpenStreetMap contributors, &#169; CartoDB'
	}).addTo(map);

	for (var i = 0; i < dataset.length; i++) {
		var datarow = dataset[i];
		
		var origin = dataset[i].origin;
		L.circleMarker([origin.lat,origin.lon],
		{
			radius: 5,
			className: 'mapMarker origin',
			datarow: datarow
		})
		.addTo(map)
		.on('click', onClick)
		.on('mouseover', function(){
			this.setRadius(10);
		})
		.on('mouseout', function(){
			this.setRadius(5);
		});

		var destination = dataset[i].destination;
		L.circleMarker([destination.lat,destination.lon], 
		{
			radius: 5,
			className: 'mapMarker destination',
			datarow: datarow
		})
		.addTo(map).on('click', onClick)
		.on('mouseover', function(){
			this.setRadius(10);
		})
		.on('mouseout', function(){
			this.setRadius(5);
		});
	}

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

	var directionsLayerGroup = new L.FeatureGroup();
	function calculateRoute(A, B, C){

	  	// color according to time
		var color = d3.scale.linear()
	    .domain([0, 6, 12, 18, 24])
	    .range(['#1693a5', '#aec297', '#fbb829', '#d7a9a8', '#1693a5'])
	    .interpolate(d3.interpolateRgb);

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

	L.Control.RemoveAll = L.Control.extend(
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
	var removeAllControl = new L.Control.RemoveAll();
	map.addControl(removeAllControl);

}
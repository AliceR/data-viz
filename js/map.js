function createmap(){

	var map = L.map('map');
	map.setView([52.501943, 13.421628], 12);

	var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: '&#169; OpenStreetMap contributors, &#169; CartoDB'
	}).addTo(map);

	for (var i = 0; i < dataset.length; i++) {
		var origin = dataset[i].origin;
		var datarow = dataset[i];
		L.circleMarker([origin.lat,origin.lon],
		{
			radius: 5,
			className: 'mapMarker origin',
			datarow: datarow
		})
		.addTo(map).on('click', onClick);

		var destination = dataset[i].destination;
		L.circleMarker([destination.lat,destination.lon], 
		{
			radius: 5,
			className: 'mapMarker destination',
			datarow: datarow
		})
		.addTo(map).on('click', onClick);
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
    	calculateRoute(A, B);
	}

	function calculateRoute(A, B){

	  	// TODO: color according to time
	  	var routeStyle = {color: 'teal', weight: 4, opacity: .75};

	   	var directions = new L.mapbox.directions({
	  		profile: 'mapbox.cycling',
	  		units: 'metric'});
		var directionsLayer = new L.mapbox.directions.layer(directions, {routeStyle}).addTo(map);
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

		

}
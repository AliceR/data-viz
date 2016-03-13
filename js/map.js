function createmap(){

	var map = L.map('map');
	map.setView([52.501943, 13.421628], 12);

	var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: '&#169; OpenStreetMap contributors, &#169; CartoDB'
	});

	layer.addTo(map);

	for (var i = 0; i < subset.length; i++) {
		var origin = subset[i].origin;
		L.circleMarker([origin.lat,origin.lon],
		{
			radius: 5,
			className: 'originMarker'
		})
		.addTo(map);

		var destination = subset[i].destination;
		L.circleMarker([destination.lat,destination.lon], 
		{
			radius: 5,
			className: 'destinationMarker'
		})
		.addTo(map);
	}

	var legend = L.Control.extend({
		options: {
			position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'legend');

			container.innerHTML =
			'<div><i style="background: #1693A5"></i> Origin</div>' + '<br>' +
			'<div><i style="background: #FBB829"></i> Destination </div>';
			return container;
		}
	});

	map.addControl(new legend());

  	L.mapbox.accessToken = 'pk.eyJ1IjoiY2FydG9saWNlIiwiYSI6ImNpZmR3cGExeDAwZXJ0amx5ZTZpbDR6bjYifQ.dhipV0B_b9422-ArK5e04Q';

  	// TODO: bind to user input
  	var o = new L.latLng(52.414398, 13.363054);
  	var d = new L.latLng(52.486399, 13.397615);

  	// TODO: color according to time
  	var routeStyle = {color: 'teal', weight: 4, opacity: .75};

   	var directions = new L.mapbox.directions({
  		profile: 'mapbox.cycling',
  		units: 'metric'});
	var directionsLayer = new L.mapbox.directions.layer(directions, {routeStyle}).addTo(map);
	var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions).addTo(map);
	directions.setOrigin(o).setDestination(d).query();
  	
}
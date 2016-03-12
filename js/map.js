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

}
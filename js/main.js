var subset = [];

//Papa.SCRIPT_PATH = "papaparse.min.js";

Papa.parse("../data/searches.csv", {
	delimiter: ",", // "" for auto-detect
	newline: "\n",	// "" for auto-detect
	header: true,
	download: true,
	worker: true,
	step: function(row) {
		convert(row);
	},
	complete: function() {
		console.log("Papaparse complete!");
		createmap();
	}
});

function convert(row){

	// TODO: catch errors (like empty rows)

	// convert the origin coordinates from WKT to JSON
	var wkt_o = new Wkt.Wkt();
	var origin = wkt_o.read(row.data[0].origin);
	row.data[0].origin = {"lat": origin.components[0].y, "lon": origin.components[0].x};
	// convert the destination coordinates from WKT to JSON
	var wkt_d = new Wkt.Wkt();
	var destination = wkt_d.read(row.data[0].destination);
	row.data[0].destination = {"lat": destination.components[0].y, "lon": destination.components[0].x};

	subset.push(row.data[0]);
}

function createmap(){

	var map = L.map("map");
	map.setView([52.501943, 13.421628], 12);

	var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
		attribution: '&#169; OpenStreetMap contributors, &#169; CartoDB'
	});

	layer.addTo(map);

	for (var i = subset.length - 1; i >= 0; i--) {
		var origin = subset[i].origin;
		L.marker([origin.lat,origin.lon]).addTo(map);
	}

}


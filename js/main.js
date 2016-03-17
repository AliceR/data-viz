var dataset = [];

//Papa.SCRIPT_PATH = 'papaparse.min.js';

Papa.parse('../data/searches.csv', {
	delimiter: ',', // ' for auto-detect
	newline: '\n',	// ' for auto-detect
	header: true,
	download: true,
	worker: true,
	step: function(row) {
		convert(row);
	},
	complete: function() {
		console.log('Papaparse complete!');
		createtimeline();
		createmap();
		createpiechart();
	}
});

function convert(row){

	// TODO: catch errors (like empty rows)

	// convert the origin coordinates from WKT to JSON
	var wkt_o = new Wkt.Wkt();
	var origin = wkt_o.read(row.data[0].origin);
	row.data[0].origin = {'lat': origin.components[0].y, 'lon': origin.components[0].x};
	// convert the destination coordinates from WKT to JSON
	var wkt_d = new Wkt.Wkt();
	var destination = wkt_d.read(row.data[0].destination);
	row.data[0].destination = {'lat': destination.components[0].y, 'lon': destination.components[0].x};

	dataset.push(row.data[0]);
}
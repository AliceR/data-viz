# Documentation

## Libraries</h3>
The following external libraries are used to create this visualisation:</p>

[Papa Parse](http://papaparse.com/)	to parse the data from csv to json
[Wicket](http://arthur-e.github.io/Wicket/) to transform the coordinates from WKT to json objects containing lat and lon
[Leaflet](http://leafletjs.com/) for the map
[Mapbox](https://www.mapbox.com/api-documentation/#directions) for calculation of routes between the points
[Bootstrap](http://getbootstrap.com/) for a responsive layout


## Testing and Known Bugs
The page was tested in Chrome, Safari, and Firefox.
Work on the JavaScript code... 
 * filtering markers is super slow. find a better way!
 * handle overlapping markers... clustering?
 * zoom to extend button
 * check why CRS won't fit when using EPSG:4326 and WMS layer
 * zoom to selected route. Uncaught TypeError: e.getBounds is not a function ?
 * replace standard A and B icons with custom ones
 * create data object in a format I can use directly in d3.data(), like this: {'key': 0, 'value': 42},...
 * understand this: counts[num] = counts[num] ? counts[num]+1 : 1;


## Further Ideas






## Data Description
The file [searches.csv](data/searches.csv) contains a random selection of route searches done by users in Berlin on one day.

## Task
##### 1. Visualise the data using Javascript in at least one spatial representation and one non-spatial representation
##### 2. Enrich the visualisation by adding external data
##### 3. Deliver the final representation in a single product

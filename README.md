# Documentation

## Libraries</h3>
The following external libraries are used to create this visualisation:</p>

[Papa Parse](http://papaparse.com/)	to parse the data from csv to json
[Wicket](http://arthur-e.github.io/Wicket/) to transform the coordinates from WKT to json objects containing lat and lon
[Leaflet](http://leafletjs.com/) for the map
[Mapbox.directions](https://www.mapbox.com/api-documentation/#directions) for calculation of routes between the points
[D3](https://d3js.org/) for the interactive visualisation
[L.OverPassLayer](https://github.com/kartenkarsten/leaflet-layer-overpass) for external data via Overpass API
[Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster/tree/leaflet-0.7) for cluster markers at same location
[Bootstrap](http://getbootstrap.com/) for a responsive layout


## Testing and Known Bugs
The page was tested in Chrome, Safari, and Firefox.
Some bugs are known and not yet fixed: 
 * check why CRS won't fit when using EPSG:4326 and WMS layer
 * zoom to selected route. Uncaught TypeError: e.getBounds is not a function ?
 * timeline does not scale correctly on small screens
 * ...

## Further Ideas
 * after filtering, all routes should show up for that time slot
 * select multiple markers at once to show routes
 * replace standard A and B icons with custom ones
 * buttons to change routing profile (driving / cycling / walking)
 * check out <a href="https://square.github.io/crossfilter/">Crossfilter</a> for fast filtering of large datasets


## Data Description
The file [searches.csv](data/searches.csv) contains a random selection of route searches done by users in Berlin on one day.

## Task
##### 1. Visualise the data using Javascript in at least one spatial representation and one non-spatial representation
##### 2. Enrich the visualisation by adding external data
##### 3. Deliver the final representation in a single product

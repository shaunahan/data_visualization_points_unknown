mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhdW5haGFuIiwiYSI6ImNsMWZ0OW13NjEzNXIzanBjZXpweTJoejcifQ.QpgsH4-T_5FjgT310-iroA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/shaunahan/cl9af2y6c003a14m944sook4z',
    zoom: 10,
    center: [-74, 40.725],
    maxZoom: 15,
    minZoom: 8,
    maxBounds: [
        [-74.45, 40.45],
        [-73.55, 41]
    ]
});

map.on('load', function () {
    // This is the function that finds the first symbol layer
    let layers = map.getStyle().layers;
    let firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map.addLayer({
        'id': 'MTA Station Data',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': 'data/turnstileData.geojson'
        },
        'paint': {
            'circle-color': ['interpolate', ['linear'],
                ['get', 'ENTRIES_DIFF'], -1, '#ff4400', -0.7, '#ffba31', -0.4, '#ffffff'
            ],
            'circle-stroke-color': '#4d4d4d',
            'circle-stroke-width': 0.5,
            'circle-radius': ['interpolate', ['exponential', 2],
                ['zoom'],
                10, ['interpolate', ['linear'],
                    ['get', 'ENTRIES_DIFF'], -1, 10, -0.4, 1
                ],
                15, ['interpolate', ['linear'],
                    ['get', 'ENTRIES_DIFF'], -1, 25, -0.4, 12
                ]
            ],
        }
    }, firstSymbolId); // Here's where we tell Mapbox where to slot this new layer

    map.addLayer({
        'id': 'Household Income Data',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': 'data/medianIncome.geojson'
        },
        'paint': {
            'fill-color': ['step', ['get', 'MHHI'],
                '#ffffff',
                20000, '#DFDDF9',
                50000, '#B1D5F9',
                75000, '#7EB6EE',
                100000, '#4A92DA',
                150000, '#2D72B8'
            ],
            'fill-opacity': ['case', ['==', ['get', 'MHHI'], null], 0, 0.65]
        }
    }, 'waterway-shadow');
});

// Create the popup
map.on('click', 'MTA Station Data', function (e) {
    let entriesDiff = e.features[0].properties.ENTRIES_DIFF;
    let entries_06 = e.features[0].properties.ENTRIES_06;
    let entries_20 = e.features[0].properties.ENTRIES_20;
    let stationName = e.features[0].properties.stationName;
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML('<h4>' + stationName + '</h4>' +
            '<p><b>Friday, March 6th:</b> ' + entries_06 + ' entries<br>' +
            '<b>Friday, March 20th:</b> ' + entries_20 + ' entries<br>' +
            '<b>Change:</b> ' + Math.round(entriesDiff * 1000) / 10 + '%</p>')
        .addTo(map);
});
// Change the cursor to a pointer when the mouse is over the turnstileData layer.
map.on('mouseenter', 'MTA Station Data', function () {
    map.getCanvas().style.cursor = 'pointer';
});
// Change it back to a pointer when it leaves.
map.on('mouseleave', 'MTA Station Data', function () {
    map.getCanvas().style.cursor = '';
});

// add menu

var toggleableLayerIds = ['MTA Station Data', 'Household Income Data'];


for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    // center: [7.49064267265682, 9.022572684729688], // starting position [lng, lat]  
    center: campground.geometry.coordinates, // starting position [lng, lat]  
    zoom: 3, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});


map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

const marker = new mapboxgl.Marker() // a DOM element can be created ansd used as the marker instead [const marker = new mapboxgl.Marker(domElement)]
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map);

    const nav = new mapboxgl.NavigationControl({
        visualizePitch: true
    });
    map.addControl(nav, 'bottom-right');
    
/**
 * Created by John on 23/04/2016.
 */

var yorkx = 53.946815;
var yorky = -1.030851; //not for girls

var map, heatmap;

function initheatMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: yorkx, lng: yorky},
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    directionsDisplay.setMap(map);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });

    calculateAndDisplayRoute(directionsService, directionsDisplay);

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: new google.maps.LatLng(yorkx, yorky),
        destination: new google.maps.LatLng(yorkx, yorky + 0.1),
        waypoints: [
            {location: new google.maps.LatLng(yorkx + 0.5, yorky),stopover: false},
            {location: new google.maps.LatLng(yorkx + 0.5, yorky + 0.2),stopover: false},
            {location: new google.maps.LatLng(yorkx + 0.2, yorky + 0.4),stopover: false},
            {location: new google.maps.LatLng(yorkx, yorky + 0.3),stopover: false}
        ],
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function getPoints() {
    getSensorData();
    var points = drawCircle();
    points.push.apply(points, addCluster(51.510051, -0.134488));
    alert(points.length);
    return points;
}

function getSensorData() {
    $.ajax({
            method: "GET",
            url: "/testjohnsjson"
        })
        .success(function( msg ) {
            // alert("swag");
            // alert( "Data Saved: " + msg );
        }).fail(function() {
        alert("yolo");
    });
}

function addCluster(lat, lng){
    var points = [];
    var radius = 0.01;
    var x, y;

    for (var i = 0; i < 100; i++){
        points.push({location: new google.maps.LatLng(lat + (Math.random() * radius) - (radius/2),
            lng + (Math.random() * radius * 2) - (radius/2)), weight: (Math.random() * 1000000000)})
        x = (yorkx + radius * (Math.random() * 100) * Math.cos(2 * Math.PI * 3 *i / Math.random()));
        y = (yorky + (radius * 2 * (Math.random() * 100)) * Math.sin(2 * Math.PI * 3 * i / Math.random()));
        points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }

    alert(points);

    return points;
}

function drawCircle() {
    var points = [];
    var steps = 1000;
    var radius = 0.01;

    var x, y;
    for (var i = 0; i < steps; i++) {
        x = (yorkx + radius * (i / 100) * Math.cos(2 * Math.PI * 3 *i / steps));
        y = (yorky + (radius * 2 * (i / 100)) * Math.sin(2 * Math.PI * 3 * i / steps));
        points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }
    return points;
}
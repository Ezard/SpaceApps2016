/**
 * Created by John on 23/04/2016.
 */

var yorkx = 53.946815;
var yorky = -1.030851; //not for girls

//blackfriars bridge
var bbx = 51.509759;
var bby = -0.104490;

var map, heatmap;
var toDeleteMarker = null;
var startMarker = null;
var endMarker = null;
var pointsGlobal = [];

function initheatMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: bbx, lng: bby},
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    directionsDisplay.setMap(map);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });

    startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(bbx, bby),
        map: map,
        draggable: true
    });

    google.maps.event.addListener(map, "click", function (e) {
        toDeleteMarker = endMarker;
        endMarker = startMarker;
        startMarker = new google.maps.Marker({
            position: e.latLng,
            map: map,
            draggable: true
        });
        if (toDeleteMarker) {
            toDeleteMarker.setMap(null);
        }
        calculateAndDisplayRoute(directionsService, directionsDisplay);
        google.maps.event.addListener(startMarker, 'dragend', function()
            {
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        );
        google.maps.event.addListener(endMarker, 'dragend', function()
            {
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        );
    });

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    calculateWaypoints(startMarker.getPosition(), endMarker.getPosition(), directionsService, directionsDisplay);
}

function calculateWaypoints(start, end, directionsService, directionsDisplay){
    var lngDistance = start.lng() - end.lng();
    var latDistance = start.lat() - end.lat();
    var distance = Math.sqrt((latDistance*latDistance) + (lngDistance*lngDistance));
    var steps = Math.min(8, Math.floor(distance/0.025));
    console.log(steps);
    var waypointsAbove = [];
    var waypointsBelow = [];
    var waypointsAboveDistance = 0;
    var waypointsBelowDistance = 0;
    // var threshold = 0.5;
    var threshold = (distance/(10));
    for (var i = 0; i < steps; i++){
        var newLngAbove = start.lng() - (lngDistance * i/steps);
        var newLatAbove = start.lat() - (latDistance * i/steps);
        var newLngBelow = newLngAbove;
        var newLatBelow = newLatAbove;
        var increment = distance / 100;


        for (var j = 0; j < pointsGlobal.length; j++){
            var h = pointsGlobal[j].location;
            var hLngDistance = h.lng() - newLngAbove;
            var hLatDistance = h.lat() - newLatAbove;
            var hDistance = Math.sqrt((hLatDistance*hLatDistance) + (hLngDistance*hLngDistance));
            if (hDistance < threshold){
                // newLng += Math.random() - 0.0005;
                if (lngDistance < latDistance || true) {
                    newLatAbove += increment;
                    console.log("push sideways");
                }
                else {
                    newLngAbove += increment;
                    console.log("push up");
                }
                j = 0;
            }
        }

        for (j = 0; j < pointsGlobal.length; j++){
            h = pointsGlobal[j].location;
            hLngDistance = h.lng() - newLngBelow;
            hLatDistance = h.lat() - newLatBelow;
            hDistance = Math.sqrt((hLatDistance*hLatDistance) + (hLngDistance*hLngDistance));
            if (hDistance < threshold){
                // newLng += Math.random() - 0.0005;
                if (lngDistance < latDistance || true) {
                    newLatBelow -= increment;
                    console.log("push sideways");
                }
                else {
                    newLngBelow -= increment;
                    console.log("push down");
                }
                j = 0;
            }
        }

        waypointsAbove.push({location: new google.maps.LatLng(newLatAbove, newLngAbove),stopover: false});
        waypointsBelow.push({location: new google.maps.LatLng(newLatBelow, newLngBelow),stopover: false});
    }

    if (waypointsAbove.length > 8){
        waypointsAbove = waypointsAbove.slice(0, 7)
    }
    if (waypointsBelow.length > 8){
        waypointsBelow = waypointsBelow.slice(0, 7)
    }

    for (i = 0; i < waypointsAbove.length - 1; i++){
        var w1 = waypointsAbove[i].location;
        var w2 = waypointsAbove[i+1].location;

        waypointsAboveDistance += calculateDistance(w1.lat(), w2.lat(), w1.lng(), w2.lng());
    }

    for (i = 0; i < waypointsBelow.length - 1; i++){
        var w1 = waypointsBelow[i].location;
        var w2 = waypointsBelow[i+1].location;
        waypointsBelowDistance += calculateDistance(w1.lat(), w2.lat(), w1.lng(), w2.lng());
        console.log(JSON.stringify(waypointsBelow[i]));
    }

    var waypoints;
    if (waypointsAboveDistance > waypointsBelowDistance){
        waypoints = waypointsBelow;
    }
    else{
        waypoints = waypointsAbove;
    }

    // alert(waypointsAbove.length + " " + waypointsBelow.length);
    var snapRequest = "https://roads.googleapis.com/v1/snapToRoads?path=";

    for (i = 0; i < waypoints.length; i++){
        snapRequest += waypoints[i].location.lat().toString() + ",";
        snapRequest += waypoints[i].location.lng().toString();
        if (i != waypoints.length - 1){
            snapRequest += "|";
        }
    }
    snapRequest += "&interpolate=true&key=AIzaSyAwveoqN8yTd5-6N1XfgcSZ8R1g_P8YOdw";

    if (waypoints.length > 0) {
        $.ajax({
                method: "GET",
                url: snapRequest
            })
            .success(function (msg) {
                // alert(JSON.stringify(msg));
                for (var i = 0; i < msg.snappedPoints.length; i++) {
                    waypoints[i] = {
                        location: new google.maps.LatLng(msg.snappedPoints[i].location.latitude,
                            msg.snappedPoints[i].location.longitude), stopover: true
                    };
                    // alert(JSON.stringify(msg.snappedPoints[i].location))
                }
                var options = {
                    origin: startMarker.getPosition(),
                    destination: endMarker.getPosition(),
                    travelMode: google.maps.TravelMode.WALKING
                };
                if (waypoints.length > 8) {
                    waypoints = waypoints.slice(0, 7);
                }
                options.waypoints = waypoints;
                directionsService.route(options, function (response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            }).fail(function () {
            alert("error");
        });
    }
    else{
        directionsService.route({
            origin: startMarker.getPosition(),
            destination: endMarker.getPosition(),
            travelMode: google.maps.TravelMode.WALKING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    return waypoints;
}

function calculateDistance(lat1, lat2, lng1, lng2){
    var latDist = lat1 - lat2;
    var lngDist = lng1 - lng2;
    return Math.sqrt((latDist*latDist)+(lngDist*lngDist));
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
    // getSensorData();
    var points = drawCircle();
    points.push.apply(points, addCluster(51.510051, -0.134488));
    pointsGlobal = points;
    return points;
}

// function getSensorData() {
//     $.ajax({
//             method: "GET",
//             url: "/testjohnsjson"
//         })
//         .success(function( msg ) {
//         }).fail(function() {
//     });
// }

function addCluster(lat, lng){
    var points = [];
    var radius = 0.05;
    var x, y;

    for (var i = 0; i < 100; i++){
        points.push({location: new google.maps.LatLng(lat + (Math.random() * radius) - (radius/2),
            lng + (Math.random() * radius * 2) - (radius/2)), weight: (Math.random() * 1000000000)})
        // x = (yorkx + radius * (Math.random() * 100) * Math.cos(2 * Math.PI * 3 *i / Math.random()));
        // y = (yorky + (radius * 2 * (Math.random() * 100)) * Math.sin(2 * Math.PI * 3 * i / Math.random()));
        // points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }
    pointsGlobal = points;
    return points;
}

function drawCircle() {
    var points = [];
    var stepps = 1000;
    var radius = 0.01;

    var x, y;
    for (var i = 0; i < stepps; i++) {
        x = (yorkx + radius * (i / 100) * Math.cos(2 * Math.PI * 3 *i / stepps));
        y = (yorky + (radius * 2 * (i / 100)) * Math.sin(2 * Math.PI * 3 * i / stepps));
        points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }
    pointsGlobal = points;
    return points;
}

$("#coButton").click(function () {
    map.setCenter(new google.maps.LatLng(yorkx, yorky), 5);
    heatmap.setMap(null);
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: drawCircle(),
        map: map
    });
});

$("#methaneButton").click(function () {
    map.setCenter(new google.maps.LatLng(bbx, bby), 5);
    heatmap.setMap(null);
    var points = [];
    points.push.apply(points, addCluster(bbx, bby));
    points.push.apply(points, addCluster(bbx + 0.01, bby + 0.02));
    points.push.apply(points, addCluster(bbx - 0.01, bby - 0.01));
    pointsGlobal = points;
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map
    });
});
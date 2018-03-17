let origin;
let destination;
let placesArray;
let directionsService;
let directionsDisplay;

function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 1.290270, lng: 103.851959 },
    zoom: 13,
    styles: [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [{ saturation: -100 }]
      }
    ]
  });

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);

  const locInput = document.getElementById('loc-input');
  const autocomplete = new google.maps.places.Autocomplete(locInput);
  autocomplete.addListener('place_changed', function () {
    origin = autocomplete.getPlace();
    if (!origin.geometry) {
      window.alert("No details available for input: '" + origin.name + "'");
      return;
    }

    const searchRequest = {
      location: { lat: origin.geometry.location.lat(), lng: origin.geometry.location.lng() },
      radius: '750',
      type: ['restaurant']
    }

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(searchRequest, function (response, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        placesArray = response;
        redrawRouteAndPopulate();
        document.querySelector('.bottom-card').classList.add('show');
      }
    });
  });
}

function redrawRouteAndPopulate() {
  destination = randomizeDestination();
  calculateAndDisplayRoute(directionsService, directionsDisplay);
  document.getElementById('dest-photo').src = destination.photos ? destination.photos[0].getUrl({ 'maxWidth': 250, 'maxHeight': 250 }) : '';
  document.getElementById('dest-name').innerHTML = destination.name;
  document.getElementById('dest-address').innerHTML = destination.vicinity;
  document.getElementById('dest-rating').innerHTML = 'Rating: ' + destination.rating;
  document.getElementById('dest-hours').innerHTML = destination.opening_hours ? 'Hours: Open' : 'Hours: Closed';
}

function randomizeDestination() {
  return placesArray[Math.floor(Math.random() * placesArray.length)];
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: origin.geometry.location,
    destination: destination.geometry.location,
    travelMode: 'TRANSIT'
  }, function (response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    }
    else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
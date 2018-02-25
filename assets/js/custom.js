let map;
let origin;
let destination;
let resultsArray;
let directionsService;
let directionsDisplay;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
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

  let locInput = document.getElementById('loc-input');
  let autocomplete = new google.maps.places.Autocomplete(locInput);
  autocomplete.setComponentRestrictions({ 'country': 'sg' });
  autocomplete.addListener('place_changed', function () {
    origin = autocomplete.getPlace();
    if (!origin.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + origin.name + "'");
      return;
    }

    scrollToElement('map-wrapper');

    // Search for nearby restaurants based on location entered
    const searchRequest = {
      location: { lat: origin.geometry.location.lat(), lng: origin.geometry.location.lng() },
      radius: '500',
      type: ['restaurant']
    }

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(searchRequest, function (response, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        resultsArray = response;
        redrawRouteAndPopulate();
      }
    });
  });
}

function redrawRouteAndPopulate() {
  destination = randomizeDestination();
  calculateAndDisplayRoute(directionsService, directionsDisplay);
  $('#dest-name').text(destination.name);
  if (destination.photos) {
    $('#dest-photo').attr('src', destination.photos[0].getUrl({ 'maxWidth': 250, 'maxHeight': 250 }));
  }
  $('#dest-rating').text(destination.rating);
  $('#dest-address').text(destination.vicinity);
  $('#dest-hours').text(destination.opening_hours ? 'Open' : 'Closed');
}

// Randomly pick and return a location object from resultsArray
function randomizeDestination() {
  return resultsArray[Math.floor(Math.random() * resultsArray.length)];
}

// Draw route from origin to location on map
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

function scrollToElement(elementId) {
  $('.page').removeClass('active');
  $('#' + elementId).addClass('active');
  $('html, body').stop().animate({
    scrollTop: $('#' + elementId).offset().top
  }, 500);
}

$(document).ready(function(){
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  }
});

$(window).resize(function () {
  $('html, body').stop().animate({
    scrollTop: $('.page.active').offset().top
  }, 10);
});
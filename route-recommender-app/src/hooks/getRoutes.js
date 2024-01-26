export function getRoutes(startLocation, endLocation, map) {
  const routePolylines = [];
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    const request = {
      origin: startLocation,
      destination: endLocation,
      provideRouteAlternatives: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };
    directionsService.route(request, (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        for (var i = 0; i < response.routes.length; i++) {
          routePolylines.push(response.routes[i].overview_polyline)
        }
        resolve(routePolylines);
      } else {
        reject("Directions request failed due to " + status);
      }
    });
  });
};
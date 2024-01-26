import React, { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import SpinnerComponent from "./spinner";
import { googleMapKey } from "../AppConfig.js";
import { getRoutes } from "../hooks/getRoutes";
import "../styles/map.css";
import getPlaceWithPolygon from "./graphql"; //add by Tian Wenle
import alert from "../static/alert.png";
import rate from "../static/rate.png";

const loaderOptions = {
  apiKey: googleMapKey,
  version: "weekly",
  libraries: ["places"],
};


function GoogleMap(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 1.4483456, lng: 103.8286848 });
  let inputText;
  let outputText;
  let currentLocFlag = 0;
  let currentLocPlaceObj = null;
  

  useEffect(() => {
    // initialise map 
    const initMap = () => {
      let infoWindow = new window.google.maps.InfoWindow();
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: currentLocation,

      });
      // start marker
      const startMarker = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        label: {
          text: 'A',
          color: 'white',
        }
      });
      // end marker
      const endMarker = new window.google.maps.Marker({
        position: currentLocation,
        label: {
          text: 'B',
          color: 'white',
        },
        map: map,
      });

      // create autocomplete fields
      const input = document.querySelector("#input-textfield");
      const computeButton = document.querySelector("#compute-button");
      const output = document.querySelector("#output-textfield");
      // get current location button 
      const locationButton = document.querySelector("#location-button");
      const disclaimerDiv = document.querySelector("#disclaimer");

      // autocomplete options
      const options = {
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false,
        componentRestrictions: {country: 'SG'} // restrict autocomplete places to SG 
      };
      
      // create autocomplete components (only input is editable)
      let autocomplete_input = new window.google.maps.places.Autocomplete(input, options);
      const autocomplete_output = new window.google.maps.places.Autocomplete(output, options);
      // no destination place at first, hide marker for destination 
      endMarker.setVisible(false);
      
      // start location pre-compute validation & set marker (if user 'enters' before 'Compute' : Alert )
      autocomplete_input.addListener("place_changed", () => {
        // save address if it has been selected from dropdown  
        inputText = input.value;
        const startPlace = autocomplete_input.getPlace();  
        if (!startPlace.geometry || !startPlace.geometry.location) {
          window.alert("Start location is invalid: '" + startPlace.name + "'");
          return;
        };
        startMarker.setPosition(startPlace.geometry.location);
      });

      // preserve previous value for input textfield
      input.addEventListener('input', function () {
        this.dataset.originalVal = this.value;
      });

      input.addEventListener('focus', function () {
        this.value = input.dataset.originalVal ? input.dataset.originalVal : this.value;
      });

      // destination location pre-compute validation & set marker (if user 'enters' before 'Compute' : Alert )
      autocomplete_output.addListener("place_changed", () => {
        // save address if it has been selected from dropdown  
        outputText = output.value;
        const endPlace = autocomplete_output.getPlace();
        if (!endPlace.geometry || !endPlace.geometry.location) {
          window.alert("Destination location is invalid: '" + endPlace.name + "'");
          return;
        };
        endMarker.setVisible(true);
        endMarker.setPosition(endPlace.geometry.location);       
      });

      // preserve previous value for output textfield
      output.addEventListener('input', function () {
        this.dataset.originalVal = this.value;
      });

      output.addEventListener('focus', function () {
        this.value = output.dataset.originalVal ? output.dataset.originalVal : this.value;
      });

      // loader button TODO!!
      const loadingButton = document.createElement("button");
      loadingButton.classList.add("btn", "btn-primary");
      loadingButton.id = "loading-button";
      loadingButton.innerHTML = `
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        Loading...
      `;
      map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].push(loadingButton);
      loadingButton.style.display = "none";

      
    
      // current location button event listener --> get user's location 
      locationButton.addEventListener("click", () => {
    
        // show loading visuals
        locationButton.style.display = "none";
        loadingButton.style.display = "";
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(pos);
              // reverse geocode the pos to retrieve formatted address - used as start input field value
              const geocoder = new window.google.maps.Geocoder();
              const autocompleteService = new window.google.maps.places.AutocompleteService();
              const service = new window.google.maps.places.PlacesService(map);
             
              // TODO : set autocomplete object so that it's not invalid result
              geocoder.geocode({ location: pos }, (results, status) => {
                // After setting input value
                locationButton.style.display = "";
                loadingButton.style.display = "none";
                if (status === "OK") {
                  const formattedAddress = results[0].formatted_address;
                  // Send a request to the Autocomplete service to get suggestions for the formatted address
                  autocompleteService.getPlacePredictions({ input: formattedAddress }, (predictions, status) => {
                    if (status === "OK" && predictions.length > 0) {
                      // switch flag to 1 if we get current location 
                      currentLocFlag = 1;
                      input.value = predictions[0].description;

                      // get place from this description 
                      const placeId = predictions[0].place_id;
                      service.getDetails({ placeId }, (place, status) => {
                        if (status === "OK") {
                          // set to our place obj 
                          currentLocPlaceObj = place;
                        } else {
                          console.error(`Failed to get place details: ${status}`);
                        }});
                    } else {
                      console.error(`Failed to get place predictions: ${status}`);
                    }
                  });
                } else {
                  console.error(`Failed to get start location: ${status}`);
                }
              });
              
              infoWindow.open(map);
              startMarker.setPosition(pos);
              map.setCenter(pos);
              map.setZoom(12.5);
            },
            () => {
              handleLocationError(true, infoWindow, map.getCenter());
            }
          );
        } else {
          handleLocationError(false, infoWindow, map.getCenter());
        }
      });
      // variable to keep track of polylines added to map & flags
      let addedPolylinesNum = [];
      let polylineLabels = [];

       // store places for each search
       let places = [];

      // compute button to get routes
      computeButton.addEventListener("click", () => {

        // remove grey polylines
        for (var i = 0, len = addedPolylinesNum.length; i < len; i++) {
          addedPolylinesNum[i].setMap(null);
        };
        // remove markers on prev polylines 
        for (var i=0, len = polylineLabels.length; i < len; i++){
          polylineLabels[i].setMap(null);
        }

        // reset variable
        addedPolylinesNum=[];
        polylineLabels=[];

        let startPlace;

        // check if we are using current location 
        if (currentLocFlag == 1 && currentLocPlaceObj || input.value == "Your current location" && currentLocPlaceObj){
          startPlace = currentLocPlaceObj;
        }
        else {
          startPlace = autocomplete_input.getPlace();
        } 
        const endPlace = autocomplete_output.getPlace();
        // validation if it's a proper place selected from dropdown 
        if (typeof startPlace == 'undefined' || typeof startPlace.geometry == 'undefined'){
          window.alert("Start location is invalid, please reselect from dropdown.");
          return;
        };

        if (typeof endPlace == 'undefined' || typeof endPlace.geometry == 'undefined') {
          window.alert("Destination location is invalid, please reselect from dropdown.");
          return;
        };

        // Alert if end and start are the same 
        if (startPlace.formatted_address === endPlace.formatted_address){
          window.alert("Start & destination locations cannot be identical");
          return;          
        };

        if ( currentLocFlag == 1 ){
          input.value = 'Your current location';
          // we don't need the flag anymore, change it back to 0
          currentLocFlag = 0
        }
        else {
          input.value = inputText;
          output.value = outputText;
        }

        // zoom in to view bounds
        const bounds = new window.google.maps.LatLngBounds();
        let startLocation = startPlace.geometry.location;
        let endLocation = endPlace.geometry.location
        bounds.extend(startLocation);
        bounds.extend(endLocation);
        map.fitBounds(bounds);
        // zoom out a little bit 
        map.setZoom(map.getZoom() - 0.2);
        loadingButton.style.display = "";


        // clear out places markers 
        places.forEach((place_in_route)=>{
         place_in_route.forEach((place)=>{
           place.marker.setMap(null);
         })
        })
        places = [];

        // get directions between origin and destination 
        const handleDirections = async () => {

          //define info window, added by Tian Wenle
          var infowindow = new window.google.maps.InfoWindow({
            disableAutoPan: true
            ,isHidden:false
            ,pixelOffset: new window.google.maps.Size(-10, -10)
            ,closeBoxURL: ""
            ,pane: "mapPane"
            ,enableEventPropagation: true
          });

          const allRoutePolylines = await getRoutes(startLocation, endLocation, map);

          // for each route
          allRoutePolylines.forEach(async (line) => {

            let data = await getPlaceWithPolygon(line);
            // data.polyline = line;
            // let newdata = addPolylineToQueryResponse(data, line);
            // console.log('new polyline field', newdata)

            places.push(data.listPlacesWithinPolygon); // update list that is used to update state
            // console.log("place pushed to places");

            var decodedPath = window.google.maps.geometry.encoding.decodePath(line);
            let polylineColor = "grey"
            let polylineOpacity = 0.5
            let polylineWeight = 10
            if (addedPolylinesNum.length == 0 ) {
              polylineColor = "#3385ff"
              polylineOpacity = 1
              polylineWeight = 12
            }
            // polyline visuals
            var polyline = new window.google.maps.Polyline({
              path: decodedPath,
              strokeColor: polylineColor,
              strokeOpacity: polylineOpacity,
              strokeWeight: polylineWeight,
              clickable: true
            });

            const image = alert;
              const tooltipMarker = new window.google.maps.Marker({
              position: decodedPath[Math.floor(decodedPath.length / 2)],
              map: map,
              icon: {
                url: image,
                scaledSize: new window.google.maps.Size(16,16)
              },
            });
            polylineLabels.push(tooltipMarker);
            const tooltipContent = `Route ${addedPolylinesNum.length + 1}. Click on the route to view scenic locations in the sidebar!`;
            const tooltipRoute = new window.google.maps.InfoWindow({
              content: tooltipContent,
            });

            // attach tooltip to marker and show on hover
            tooltipRoute.open(map, tooltipMarker);
            tooltipMarker.addListener("mouseover", () => {
              tooltipRoute.open(map, tooltipMarker);
            });
            tooltipMarker.addListener("mouseout", () => {
              tooltipRoute.close();
            });

            // add the polyline to the map
            polyline.setMap(map);
            addedPolylinesNum.push(polyline);

            //add marker for each places, added by Tian Wenle, changed by Jean 
            places[places.length-1].forEach((place)=>{
              const rateImg = rate;
              let marker = new window.google.maps.Marker({
                position: {lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0]},
                map: map,
                icon: {
                  url: rateImg,
                  scaledSize: new window.google.maps.Size(32,32)
                },
                id: places.length,
                title: place.properties.place_name}); 
  
              marker.setVisible(places.length==1);
              place.marker = marker;
  
              window.google.maps.event.addListener(marker, 'click', (function(marker, place) {
                var contentString = '<div id="infoWindow">'
                    +'<div id="bodyContent">'
                    +'<p>'
                    + '<b>'
                    + marker.title
                    + '</b>'
                    +'</p>'
                    +'<p>'
                     + place.properties.ADDRESS
                     +'</p>'
                    +'<p>'
                    + "Rating:"
                    + place.properties.rating
                    +'</p>'
                    +'</div>'
                    + '</div>';
  
                return function() {
                    infowindow.setContent(contentString);//boxList[this.id]marker.title
                    infowindow.open(map, marker);
                }
                })(marker, place)); //end add marker listener
            })             
            //end

            // add click event listener to polyline
            polyline.addListener("click", function() {
              let sel = -1;
            // set clicked polyline to blue and show scenic location from db
              for (let i=0; i<addedPolylinesNum.length; i++) {
                if (addedPolylinesNum[i] == polyline) {
                  addedPolylinesNum[i].setOptions({strokeColor: "#3385ff", strokeOpacity: 1, strokeWeight: 12, });
                  sel = i;
                  props.setSelectedIndex(i); // to show corresponding places in drawer
                }
                else {
                  addedPolylinesNum[i].setOptions({strokeColor: "grey", strokeOpacity: 0.5, strokeWeight: 10, });
                }
              }
              console.log("No of route:", places.length);

              //display marker, added by Tian Wenle
              for (let i=0; i<places.length; i++)
              {
                  places[i].forEach( (place)=>{ place.marker.setVisible(sel == i); } );
              }
            })
          // set state
          loadingButton.style.display = "none";

          disclaimerDiv.innerHTML = `Number of routes found: ${places.length}`
          const newplaces = [...places]; // make a new copy in memory of the array
          props.setPlacesInRoute(newplaces);
          })};
        handleDirections();
      });

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
          browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
      };
    };

    const loader = new Loader(loaderOptions);
    loader.load().then(() => {
      setIsLoading(false);
      initMap();
    });
  }, []);

  return (
    <div>
      {isLoading ? (
        <SpinnerComponent />
      ) : (
        <div>
          <div id="map" style={{ height: "100vh" }}></div>
        </div>
      )}
    </div>
  );
}

export default GoogleMap;

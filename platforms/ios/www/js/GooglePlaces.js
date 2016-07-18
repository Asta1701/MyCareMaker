/**
 * Callback functions - Functions written for all the callbacks.
 * @returns 
 */
function googlePlacesCallbackFunction() {
    var searchOb = JSON.parse(sessionStorage.getItem("googlePlacesSearchObject"));
    
    searchFor(searchOb.textSearch, searchOb.searchArray, searchOb.radius);
}

/**
 * Carries out the searches and adds them to a data object file included.
 * 
 * @param {int} searchMode Switch for a 'text' or 'nearby' search.
 * @param {array of strings} searchArray This is effective the google 'types' list but on
 * an of searchMode as 1 it is a text search and array with one element must be parsed.
 * The first element of this array will be used as a 'query' instead of type.
 * @param {int} searchRadius Distance around coordinates to be searched.
 * @param {string} outputId Corresponds to the id of the DOM object that you want the output
 * to be written to.
 * @returns {void}
 */
function searchFor(searchMode, searchArray, searchRadius) {
    //Set up the Google API request.
    //Function globals
    var map;
    var service;

    var placeDetailArray = [];
    var finishedEvents = [];
    var count = 0;

    var loc = JSON.parse(localStorage.getItem("postCodeCoordinates"));

    //Epsom 51.3360° N, 0.2670° W
    //Bristol 51.4500° N, 2.5833° W
    //Not accurate enough use getCoordinates and parse a postcode.
    var lat = loc.lat;
    var lng = loc.lng;    

    var current_location = new google.maps.LatLng(lat, lng);
    map = new google.maps.Map({
        center: current_location,
        zoom: 15
    }); //Need to add a document.getElementById('map') as first 
        //arguement to display map. (Also uncomment the div)
        //Cause this error : Uncaught TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is not of type 'Element'. 

    service = new google.maps.places.PlacesService(map);
    switch (searchMode) {
        case 0: 
            var request = {
                location: current_location,
                radius: searchRadius,
                types: searchArray 
            };
            placeDetailArray = [];
            finishedEvents = [false];
            //First get the list of nearby places. But we need more details.
            service.nearbySearch(request, function(results, status, pagination){
                placesCallback(results, status, pagination);
            });
            break;
        case 1:
            var request = {
                location: current_location,
                radius: searchRadius,
                query: searchArray[0] //Used for the text search 
            };
            placeDetailArray = [];
            finishedEvents = [false];
            //First get the list of nearby places. But we need more details.
            service.textSearch(request, function(results, status, pagination){
                placesCallback(results, status, pagination);
            });

            break;
        default:

            alert("Unrecognised searchMode in searchFor");
            return;

    }
    
    sessionStorage.setItem("googlePlaces", "{\"error\" : \"FAILED_RESULT\"}");
    waitForEventFinishedSend(0);
    
    function placesCallback(results, status, pagination) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {
//          alert("Success");

            count = 0;
            for (var i = 0; i < results.length; i++) {

                var place = results[i];    
                var id = place['place_id'];
                console.log(id);
                //For each place we then get the full place detail.
                getPlaceDetails(id);

            }

            //Pagination get more results if necessary. Currently doesn't work.
//            if (pagination.hasNextPage) {
//                var elId = "more_" + outputId;
//                var moreButton = document.getElementById(elId);
//
//                console.log(moreButton + " " + elId);
//
//                moreButton.disabled = false;
//
//                moreButton.addEventListener('click', buttonMethod());
//
//
//                function buttonMethod() {
//                    moreButton.disabled = true;
//                    pagination.nextPage();
//                }
//            }

        } else {
            finishedEvents[0] = true;
//            alert(status); //Returns the status code for anything other than a success.
        }


    }; 
    function getPlaceDetails(id) {
//      alert(id);
        finishedEvents[count] = false;
        service.getDetails({
            placeId: id

        }, function(place, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {

                var placeDetails = {
                    toString: function() {
                        var details = "<br/>"
                                + "Name: " + this.name + "<br/>"
                                + "Address: " + this.address + "<br/>"
                                + "Phone No: " + this.phoneNumber + "<br/>"
                                + "Rating: " + this.rating + "<br/><br/>";
                        return details;
                    },
                    name: place['name'],
                    address: place['formatted_address'],
                    phoneNumber: place['international_phone_number'],
                    rating: place['rating'],
                    location: place.geometry.location.lat() + "," + place.geometry.location.lng()
                };
                console.log(placeDetails.address);
                placeDetailArray[placeDetailArray.length] = placeDetails;

                finishedEvents[count] = true;    
                count++;
            } else {
                return null;
            }

        });
    } 
    function waitForEventFinishedSend(n) {

        setTimeout(function(){
        if (finishedEvents.length > 0) {
            var count = 0;
            for (var i=0; i<11; i++) {

                if (finishedEvents[i]) {

                    count++;
                }

            }
            if ( n < 11 && (count < 9 && count !== finishedEvents.length) && !JSON.parse(sessionStorage.getItem("finished")) ) {
                console.log(n + " Recurring " + count + " " +finishedEvents.length );
                waitForEventFinishedSend(n+1);
            } else {
                //console.log((new Date()) + " Function finshed all var are true : " + JSON.stringify(placeDetailArray));
                placeDetailArray = sortPlacesByRating(placeDetailArray);
                    
                sessionStorage.setItem("googlePlaces", JSON.stringify(placeDetailArray));
                sessionStorage.setItem("finished", JSON.stringify(true));
                console.log("Events finished in GoogleApi.js.");
                return;
            }
        } else {
            return false;
        }
        }, 1000);
    }
    function sortPlacesByRating(places) {
        var isSorted = false;
        while (!isSorted) {
            isSorted = true;
            for (var i = 0; i < places.length - 1; i++) {

                if (places[i].rating === undefined) {
                    places[i].rating = -1;
                }
                if (places[i].rating < places[i + 1].rating) {
                    //If lower element is smaller it is swapped ordered down.
                    var temp = places[i];
                    places[i] = places[i + 1];
                    places[i + 1] = temp;
                    isSorted = false;
                }

            }
        }
        return places;
    }
}  

/**
 * This function calculates the coordinates of the user from a given Postcode
 * it accesses a localStorage object call "postCode". Also, it sets three 
 * sessionStorage variables.
 * 
 * location - Contains the coordinates of the post code used.
 * finished - Tells the Angular controller that it has the location result and 
 *          can execute the rest of the controller code.
 * firstSet - A flag used for determining the users first time using the app.
 * 
 * @returns {undefined}
 */
function getCoordinates() {
//    alert("in: " + post_code);
    var zero_location = new google.maps.LatLng(0, 0);
    //Add var ?
    var map = new google.maps.Map( {
        center: zero_location
    });
    var postcode = localStorage.getItem("postCode");
    if (postcode === null) {
        alert("localStorage string 'postCode' is not set.");
        
        return;
    }
    console.log(postcode);
    var request = {
        location: zero_location,
        radius: '500',
        query: localStorage.getItem("postCode") + ", UK"
    };
//        alert(request.query);
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, function(results, status) {
        sessionStorage.setItem("errorStatus", status);
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            var place = results[0];
            var geo = place['geometry'];
            var loc = geo['location'];

            var proc = loc.toString().replace("(", "").replace(")", "").replace(" ", "");
            var coOrds = proc.split(",");
//                alert( "lat: " + coOrds[0] + "\nlng: " + coOrds[1]);

            var location = {
                lat: coOrds[0],
                lng: coOrds[1]
            };

            //configurationData.setCoordinates(location);
            sessionStorage.setItem("location", JSON.stringify(location));
            sessionStorage.setItem("finished", JSON.stringify(true));
            sessionStorage.setItem("firstSet", JSON.stringify(false));
            console.log("Coordinates set!");

        } else {
//            alert(status);
            
            sessionStorage.setItem("finished", JSON.stringify(true));
            
        }
        
    });
}



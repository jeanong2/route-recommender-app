const fs = require('fs');
const express = require("express");
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const GraphQLJSON = require('graphql-type-json');
const polyline = require('@mapbox/polyline');
const {getRatingFromAddress} = require('./get-rating');

const buffer = require('./node_modules/@turf/buffer/dist/js/index.js'); 

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
const {connectToDb} = require('./db/db.js');
const { ObjectID } = require('mongodb');


let db;

/*Resolver: GraphQL Scalar
//Below function is a GraphQL scalar that defines a valid Date.
//Serialize is used to send back/return a date in string format.
//ParseValue is used to convert all input values that are provided as an input JS variable.
//ParseLiteral is used to convert all input values that are in Int, String, etc. to a JSON-like form that GraphQL understands.
*/
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    console.log(value)
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

// Resolver functions


// Decode polyline (String) and return a GeoJSON LineString 
function decodePolyline(polylineInput) {
  let lineString = polyline.toGeoJSON(polylineInput);
  // console.log('decodePolyline called: ', lineString);
  return lineString;
}


// Add buffer of radius (in km) around a GeoJSON LineString and return a GeoJSON polygon/multipolygon
function addBuffer(lineStringInput, radius) {
  let polygon = buffer(lineStringInput, radius, {units: 'kilometers'});
  // console.log('addBuffer called: ', polygon.geometry.coordinates);
  return polygon;
}


// Query places near a route (polyline) and return an array of places within a given radius
async function listPlacesWithinPolygon(_, {polyline}) {
  console.log('listPlacesWithinPolygon has been called');
  // Call function to decode polyline
  let lineString = decodePolyline(polyline);

  // Call function to add buffer around LineString
  let polygon = addBuffer(lineString, 0.05); // buffer of 50 metres

  // Find "scenic" places in db with coordinates that fall within the buffered area
  var listOfPlacesWithinPolygon = await db.collection("places").find(
    {
      geometry: {
        $geoWithin: {
           $geometry: {
              type : polygon.geometry.type ,
              coordinates: polygon.geometry.coordinates
           }
        }
      }
    }
  ).toArray();

  // For every place, check for cached place data in db
  // If place photo data not previously cached OR does not exist (null)
  // Perform findplacefromtext query to get place_id, name, rating and photos of place

  for (let i = 0; i < listOfPlacesWithinPolygon.length; i++) {
    let place = listOfPlacesWithinPolygon[i];
    
    if (!place.properties.hasOwnProperty('photo') || place.properties.photo===null) {

      // following code will run if place was not previously cached
      // OR
      // there was a previous attempt to cache but return value on photos was null

      try {

        // get rating, place_id and name from Places API
        let newData = await getRatingFromAddress(place.properties.ADDRESS);
        let newPlaceID = newData.data.candidates[0].place_id;
        let newRating = newData.data.candidates[0].rating;
        let newName = newData.data.candidates[0].name;
        let newPhotos = newData.data.candidates[0].photos;

        console.log(newData.data.candidates[0]);

        // store place_id, name, photos and rating in db
        db.collection("places").updateOne(
          {
            _id: ObjectID(place._id)
          },
          {
            $set: {
              "properties.place_id" : newPlaceID,
              "properties.rating" : newRating,
              "properties.place_name" : newName,
              "properties.photos": newPhotos,
            }
          }
        )
        let updatedPlace = await db.collection("places").findOne(
          {
            _id: ObjectID(place._id)
          },
        )
        console.log("updated place_id", updatedPlace.properties.place_id);

        // update listOfPlacesWithinPolygon with place_id, name, photos and rating from Places API
        listOfPlacesWithinPolygon[i].properties.place_id = newPlaceID;
        listOfPlacesWithinPolygon[i].properties.rating = newRating;
        listOfPlacesWithinPolygon[i].properties.place_name = newName;
        listOfPlacesWithinPolygon[i].properties.photos = newPhotos;
      } catch (error) {
        console.log(error);
      }
    }
  }

  return listOfPlacesWithinPolygon;
};

const typeDefs = fs.readFileSync('.\\schema.graphql', 'utf-8');

// Resolvers
const resolvers = {
  Query: {
    listPlacesWithinPolygon,
  },
  GraphQLDate,
  GraphQLJSON
};

// Start apollo server and connect to db

const app = express();

async function startApolloServer(typeDefs, resolvers){
  const server = new ApolloServer({typeDefs, resolvers})
  await server.start();
  server.applyMiddleware({app, path: '/graphql'});
}

startApolloServer(typeDefs, resolvers);

(async function () {
  try {
    db = await connectToDb();
    app.listen(port, function () {
      console.log('API server started on port ', port);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();




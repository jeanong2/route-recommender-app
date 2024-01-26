// function to get place rating from google

const {Client} = require("@googlemaps/google-maps-services-js");
require("dotenv").config({ path: "./config.env" });

const client = new Client({});

// get place_id, name and rating of location from text query (address or place name)

async function getRatingFromAddress(address) {
  let data = await client.findPlaceFromText({
    params: {
      input: address,
      inputtype: "textquery",
      key: process.env.GOOGLE_MAPS_API_KEY,
      fields: ["rating", "name", "place_id", "photos"]
    },
    timeout: 1000 // milliseconds
  })

  return data;
};

module.exports = {getRatingFromAddress};

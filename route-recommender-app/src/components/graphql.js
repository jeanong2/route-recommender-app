const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

//parameter, polyline: the encoded polyline string generated from google map api
//return, []: a list of places within 50 meters of the polyline

async function getPlaceWithPolygon(polyline) {
  const query = `query($polyline: String) {
    listPlacesWithinPolygon(polyline: $polyline) {
      geometry {
        coordinates
      }
      properties {
        place_id
        place_name
        rating
        ADDRESS
        photos {
          height
          width
          photo_reference
        }
      }
    }
  }`;

  const data = await graphQLFetch(query, { polyline});
  return data;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
    return null;
  }
}

export default getPlaceWithPolygon;
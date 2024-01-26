// input props.placesInRoute array of place objects
// return array of top 3 places
export default function sortByRating(data) {
    let placesSortedByRating = data;

    // only sort data if there are more than 3 places in array
    if (placesSortedByRating.length > 2) {
        // sort by rating in ascending order
        placesSortedByRating.sort((a, b) => a.properties.rating - b.properties.rating);

        // reverse sort
        placesSortedByRating.reverse();

        // truncate list to top 3 places
        placesSortedByRating.splice(3);

        console.log('list of truncated sorted places: ', placesSortedByRating);
    }

    return placesSortedByRating;
};
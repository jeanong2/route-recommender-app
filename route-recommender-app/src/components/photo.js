import * as React from 'react';
import Box from '@mui/material/Box';

// props.photos : array of photo objects
export default function Photo(props) {
  
    // check if photo reference exists (array is not empty)
    if (props.photos[0].photo_reference !== "No photo") {

        const PHOTO_REFERENCE = props.photos[0].photo_reference;
        const API_KEY = 'AIzaSyDCAEK9Z9CEZWqqDnk-4LhZfxx7FvIBEtA';
        let imageurl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=220&photo_reference=" + PHOTO_REFERENCE + "&key=" + API_KEY;

        return (
            <Box
                component="img"
                sx={{
                    width: 220,
                    // maxHeight: { xs: 293, md: 167 },
                    // maxWidth: { xs: 220, md: 250 },
                    backgroundColor: 'primary.dark',
                    '&:hover': {
                    backgroundColor: 'primary.main',
                    opacity: [0.9, 0.8, 0.7],
                    },
                }}
                src={imageurl}
                alt=""
            />
        );
    }
}
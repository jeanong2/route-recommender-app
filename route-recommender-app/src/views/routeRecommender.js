import React, { useState } from 'react';
import GoogleMap from "../components/map";
import Box from '@mui/material/Box';
import PermanentDrawerLeft from '../components/permanentDrawer';

function RouteRecommender() {

  // Initialise state (temporary)
  const [placesInRoute, setPlacesInRoute] = useState(
    [
      [
        {
          properties: {
            place_name: "Enter a start and end location above to find scenic places along your route", 
            place_id: "", 
            rating: null
          }
        },
      ]
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Drawer displays top 3 rated places of each route */}
      <PermanentDrawerLeft placesInRoute={placesInRoute} selectedIndex={selectedIndex}/>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 0.1}}
      >
        <GoogleMap setPlacesInRoute={setPlacesInRoute} setSelectedIndex={setSelectedIndex}/>
      </Box>
    </Box>
  )
}

// to do : export setState function

export default RouteRecommender;
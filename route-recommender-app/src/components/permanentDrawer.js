import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import sortByRating from './sortByRating';
import Photo from './photo';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Scrollbars } from 'react-custom-scrollbars-2';

// function to render list item - (1) place_name , (2) rating, (3) use place id to get photo from places API
function PlaceListItem(props) {
  let place = props.place;

  if (place.properties.rating === null || place.properties.rating === 0) {
    place.properties.rating = "No Rating"
  }

  if (!place.properties.hasOwnProperty('photos') || place.properties.photos === null) {
    place.properties.photos = [{photo_reference: 'No photo'}];
  } 

  return (
    <>
    <Photo photos={place.properties.photos}/>
    <ListItem key={place._id}>
    <ListItemText primary={place.properties.place_name} secondary={`Google Rating: ${place.properties.rating}`}/>
    </ListItem>
    </>
  )
};

// function to render list
function PlaceList(props) {
  let placesdata = props.places;
  let sortedplaces = sortByRating(placesdata);

  const places = sortedplaces.map((place, index) => (
    <PlaceListItem key={index} place={place} />
  ))

  return (
    <>
    <div id='disclaimer' style={{color:'#ff9800', fontWeight:600}}></div>
    <Typography variant="overline" id = "selected-label">
      Top Rated Places Along Selected Route
    </Typography>
    <Typography style={{fontSize: 12.5 , fontStyle: 'italic'}} id = "selected-label">
      We render images if they are available 
    </Typography>
    <List sx={{bgcolor: 'background.paper'}}>
      {places.length > 0 ? places : 
        <Typography style={{ marginTop: '40px'}} variant="h5" color="textSecondary">
          No highly rated places found along this route 
        </Typography>}
    </List>
    </>
  )
};

export default function PermanentDrawerLeft(props) {
  
  const drawerWidth = 350;
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  let selectedIndex = props.selectedIndex;
  // console.log(selectedIndex);

  let places = [];
  if (selectedIndex>=0 && selectedIndex<props.placesInRoute.length)
  {
    places = props.placesInRoute[selectedIndex];
  }
  
  return (
    <>
    <CssBaseline />
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, zIndex: 1201 }}
    >
    </AppBar>

    <Drawer
      sx={{
        display: drawerOpen ? 'block' : 'none',
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: "relative",
          zIndex: 1200 // set zIndex of the Drawer to 1200
        },
      }}
      open={drawerOpen}
      onClose={toggleDrawer}
      variant="permanent"
      anchor="left"
    >
      <Scrollbars style={{ height: '100%' }}>
      {/* <Toolbar /> */}
      <div
      component="form"
      sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 200 , marginLeft: '20px',marginBottom: '1rem'}}
    >
    <Typography variant="h6" sx={{marginTop: '2rem' }}>
      Start typing to see options 
    </Typography>
    <Typography variant="overline">Please select from dropdown</Typography>
    </div>
      <Divider />
      <div sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 200 , marginLeft: '20px'}}>
      <Button
        id="location-button"
        variant="outlined"
        sx={{
          width: '190px',
          textTransform: 'uppercase',
          borderRadius: '50px',
          // boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
          // '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
          marginTop: '10px'
        }}
      >
        From current location
        {/* <SearchIcon sx={{ fontSize: '1.2rem', ml: '0.2rem' }} /> */}
      </Button>    
      </div>
      {/* input text field */}
      <Paper
      component="form"
      sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 'auto' , marginTop: '10px', marginLeft: '20px', marginRight: '20px', marginBottom: '1rem'}}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        id="input-textfield"
        placeholder="A: Enter Origin"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    </Paper>
    <Paper
      component="form"
      sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 'auto' , marginLeft: '20px',  marginRight: '20px', marginBottom: '1rem'}}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        id="output-textfield"
        placeholder="B: Enter Destination"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    </Paper>
    <div sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 200 , marginLeft: '20px'}}>
    <Button
      id="compute-button"
      variant="contained"
      sx={{
        width: '190px',
        textTransform: 'uppercase',
        borderRadius: '50px',
        boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
        '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
        marginBottom: '10px'
      }}
    >
      Compute
      <SearchIcon sx={{ fontSize: '1.2rem', ml: '0.2rem' }} />
    </Button>    
    </div>
      <PlaceList places={places} />
      </Scrollbars>
    </Drawer>
    <Button 
      onClick={toggleDrawer} 
      style={{ 
        width: '3%',
        height:'20vh',
        backgroundColor: "#607d8b",
        fontSize: "18px",
        padding: 0,
        position: "absolute",
        top: "50%",
        left: drawerOpen ? drawerWidth - '20': "-25px",
        transform: "translateY(-50%)",
        zIndex: 199 ,// set zIndex of the button to 1202 to make it appear above the drawer
        justifyContent: "right",
        paddingRight: "10px",
        color:"white"
      }}
    >
      {drawerOpen ? '<<' : '>>'}
    </Button>

      </>
  );
}
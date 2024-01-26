import React from 'react';
import AboutStepper from '../components/aboutStepper.js';

export default function About() {
  return (
    <div style={{ marginTop: '8vh' }}>
      
      <h1>What is Route Recommender about ?</h1>
      <p style={{fontSize:19}}>Based on our database, we tell you which routes are best!</p>
      <AboutStepper/>
      <footer>
        <p style={{ fontSize:13, marginTop: '15vh'}}><i>*** Contains information from NParks Skyrise Greenery accessed on 4/4/23 from National Parks Board which is made available under the terms of the <a href="https://data.gov.sg/open-data-licence">Singapore Open Data Licence version 1.0 </a>. ***</i></p>
      </footer>

    </div>
  );
}
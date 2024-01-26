import './App.css';
import Header from './components/header';
import { Route, Routes } from "react-router-dom";
import Home from './views/home';
import RouteRecommender from './views/routeRecommender';
import About from './views/about';
import ContactUs from './views/contact'


function App() {
  return (
    <div className="App">
      <Header />
      <Routes> 
        <Route path= "/" element= {<Home/>} />
        <Route path= "/recommender" element= {<RouteRecommender/>} />
        <Route path= "/about" element= {<About/>} />
        <Route path= "/contact" element= {<ContactUs/>} />
      </Routes>
    </div>
  );
}

export default App;

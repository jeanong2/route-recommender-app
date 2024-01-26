import React, { useEffect } from 'react';
import Swiper from 'swiper';
import '../styles/cardComponent.css';
import j from '../static/girl1.jpg'
import e from '../static/girl2.jpg'
import w from '../static/boy1.svg'

const SwiperComponent = () => {

  useEffect(() => {
    new Swiper('.mySwiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 300,
        modifier: 1,
        slideShadows: false
      },
      pagination: {
        el: '.swiper-pagination'
      }
    });
  }, []);

  return (
    <div >
      <div className="swiper-wrapper">  
          <div className="card">
            <div className="cardImage">           
              <img src={e} alt="card image" />
            </div>
            <div className="cardContent">
              <span className="cardTitle">Estee</span>
              <span className="cardName">Team Member</span>
              <p className="cardText">e0656639@u.nus.edu</p>
            </div>
          </div>
          <div className="card">
            <div className="cardImage">
            <img src={w} alt="card image"  />

            </div>
            <div className="cardContent">
              <span className="cardTitle">Wenle Tian</span>
              <span className="cardName">Team Member</span>
              <p className="cardText">e0949134@u.nus.edu</p>
            </div>
          </div>
          <div className="card">
            <div className="cardImage">
              <img src={j} alt="card image" />
            </div>
            <div className="cardContent">
              <span className="cardTitle">Jean Ong</span>
              <span className="cardName">Team Member</span>
              <p className="cardText">e0949099@u.nus.edu</p>
            </div>
          </div>

      </div>
    </div>
  );
};

export default SwiperComponent;

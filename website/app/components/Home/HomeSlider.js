import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import Swiper core and required modules
import SwiperCore, { Navigation, Thumbs, Autoplay } from "swiper";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";

// install Swiper modules
SwiperCore.use([Navigation, Thumbs, Autoplay]);


import Link from "next/link";
import { IMG_URL } from "../../../../config";

const Default = ({ state = [] }) => {
   useEffect(() => { }, []);

   return (
      <div className=" relative float-left homeSliderReslative">
         <div className="position-absolute w-full  ">

            <div className="slider-arrow-left absolute z-40 left-2  top-1/2">
               <DoubleLeftOutlined />
            </div>
            <div className="slider-arrow-right absolute z-40 right-2  top-1/2">
               <DoubleRightOutlined />
            </div>

            <Swiper

               spaceBetween={0}
               navigation={{
                  prevEl: ".slider-arrow-left",
                  nextEl: ".slider-arrow-right",
               }}

               autoplay={{
                  delay: 15000,
                  disableOnInteraction: false,
               }}
               className="w-full"
            >
               {state.map((val) => (
                  <SwiperSlide key={val._id}>
                     <div className="item">
                        <Link href={val.link}>
                           <a>
                              <img
                                 src={`${IMG_URL + val.image}`}
                                 height="500"
                                 width="1680"
                                 style={{ width: "100%" }}
                                 alt={val.title + "."}
                              />
                           </a>
                        </Link>
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         </div>
         <div style={{ clear: "both" }} />
      </div>
   );
};

export default Default;

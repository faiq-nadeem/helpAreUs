import { Swiper, SwiperSlide } from "swiper/react";
import ProductCardHome from "../ProductCard/home";
// import Swiper core and required modules
import SwiperCore, { Navigation, Thumbs, Autoplay } from "swiper";

// install Swiper modules
SwiperCore.use([Navigation, Thumbs, Autoplay]);


const Default = ({ state = [], title = { title: "", description: "" } }) => {
   return (
      <div className="bg-gray-100 ">
         <div className=" mx-auto w-11/12 py-5 ">
            <div className="row">
               <div className=" relative  homeSliderReslative mb-3 pb-0  ">
                  <div className="  w-full   ">
                     <div className=" text-center mb-5 mt-3">
                        <h1>{title.title}</h1>
                        <h2 className="text-lg	">{title.description}</h2>
                     </div>


                     <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        style={{
                           "--swiper-navigation-color": "#000",
                           "--swiper-pagination-color": "#000",
                        }}

                        autoplay={{
                           delay: 4000,
                           disableOnInteraction: true,
                        }}
                        breakpoints={{
                           340: {
                              slidesPerView: 1,
                              spaceBetween: 0,
                           },
                           640: {
                              slidesPerView: 2,
                              spaceBetween: 0,
                           },
                           768: {
                              slidesPerView: 3,
                              spaceBetween: 0,
                           },
                           1024: {
                              slidesPerView: 3,
                              spaceBetween: 0,
                           },
                           1224: {
                              slidesPerView: 4,
                              spaceBetween: 0,
                           },
                        }}
                     >
                        {state &&
                           state.map((data) => (
                              <SwiperSlide key={data._id} className="mb-15">
                                 <ProductCardHome
                                    data={data}
                                    className=" float-left col-span-4  rounded-lg  m-5 mb-9 hover:bg-white  bg-gray-50  group overflow-hidden  shadow-sm hover:shadow-xl  "
                                 />
                              </SwiperSlide>
                           ))}
                     </Swiper>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Default;

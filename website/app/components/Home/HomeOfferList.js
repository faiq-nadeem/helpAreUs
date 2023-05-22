import Image from "next/image";
// import Swiper core and required modules
import SwiperCore, { Navigation, Thumbs, Autoplay } from "swiper";

// install Swiper modules
SwiperCore.use([Navigation, Thumbs, Autoplay]);


import Link from "next/link";
import { IMG_URL } from "../../../../config";

const Default = ({ state = [], title = { title: "", description: "" } }) => {
   return (
      <div className=" container-custom my-9 pb-6  ">
         <div className="w-full text-center float-left   mb-5 mt-3">
            <h2>{title.title} </h2>
            <h3 className="text-lg	">{title.description} </h3>
         </div>
         <div className=" w-full  rounded-lg gap-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {state.map((val) => (
               <div key={val._id} className="border rounded-lg overflow-hidden">
                  <Link href={val.link + "/"} >
                     <a className="group mb-3 rounded-lg  ">
                        <Image
                           loader={({ src }) => src}
                           src={`${IMG_URL + val.image}`}
                           className="w-full h-full group-hover:scale-105   transition-all rounded-t"
                           height="168"
                           width="288"
                           alt={val.title + " "}
                        />
                        <div className="w-full text-center mt-3 font-bold">{val.title}</div>
                        <div className="w-full text-center my-2 h-5  ">
                           {val.description}
                        </div>
                     </a>
                  </Link>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Default;

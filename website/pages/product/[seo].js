import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBasket_r } from "../../redux/actions";
import axios from "axios";
import { API_URL } from "../../../config";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const ProductGallerry = dynamic(() => import("../../app/components/ProductDetail/Gallerry"));
const PoductVariants = dynamic(() => import("../../app/components/ProductDetail/PoductVariants"));

const Page = ({ resData = {}, seo = "" }) => {
   const { user } = useSelector(({ login }) => login);

   const state = resData[0];
   const [contentDescription, seTcontentDescription] = useState("<p></p>");

   const dispatch = useDispatch();

   const getBasket = (id) => {
      if (user.id) {
         dispatch(getBasket_r(id));
      }
   };

   function createMarkup() {
      return { __html: contentDescription };
   }



   const replaceStyle = (dataHtml) => {
      return dataHtml
         .replaceAll("<p>", "<p style='min-height:25px' >")
         .replaceAll(
            "<pre>",
            "<pre  style='min-height:30px; background-color:#dbdbdb; padding:15px' >"
         )
         .replaceAll("<img ", "<img class='w-full sm:w-auto' ")
         .replaceAll(
            "<div class=\"media-wrap image-wrap ",
            "<div class=\"media-wrap image-wrap  w-full sm:w-auto "
         );
   };

   useEffect(() => {
      getBasket();
      seTcontentDescription(replaceStyle(state.description));
   }, [state.description]);

   return (
      <div className="container-custom h-full ">
         <Head
            title={state.title}
            description={state.description_short}
            keywords={state.keys}
            image={state.allImages.length > 0 ? state.allImages[0].image : ""}
         />
         <div className=" shadow-2xl bg-white  p-0 lg:p-4 grid grid-cols-12 my-0 lg:my-8  ">
            <div className=" col-span-12 lg:col-span-5  rounded-lg  ">
               <ProductGallerry images={state.allImages} />
            </div>
            <div className=" col-span-12 lg:col-span-7">
               <PoductVariants data={state} seo={seo} />
            </div>
         </div>

         <div className="w-full mt-5 mb-10 p-10 shadow-2xl bg-white h-full min-h-10  ">

            <div dangerouslySetInnerHTML={createMarkup()} />

         </div>
      </div>
   );
};

export const getServerSideProps = async ({ query }) => {
   const response = await axios.get(`${API_URL}/productspublic/${query.seo}`);
   return {
      props: {
         resData: response.data,
         seo: query.seo,
      },
   };
};

export default Page;

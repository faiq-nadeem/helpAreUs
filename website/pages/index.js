import func from "../util/helpers/func";
import axios from "axios";
import { wrapper } from "../redux/store";
import { API_URL } from "../../config";

import dynamic from "next/dynamic";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const HomeFirstBox = dynamic(() => import("../app/components/Home/HomeFirstBox"));
const HomeSeccoundBoxs = dynamic(() => import("../app/components/Home/HomeSeccoundBoxs"));
const HomeOfferList = dynamic(() => import("../app/components/Home/HomeOfferList"));
const HomeProductsFirst = dynamic(() => import("../app/components/Home/HomeProductsFirst"));
const Brands = dynamic(() => import("../app/components/Brands"));
const HomeSlider = dynamic(() => import("../app/components/Home/HomeSlider"));
const Head = dynamic(() => import("../app/core/Head"));

const homePage = ({
   resData = [],
   resProductFirst = [],
   resProductSeccond = [],
}) => {


   const homeSlider = func.getCategoriesTree(
      resData,
      "61535837020a748d51968ecc"
   );
   const homeFirstBox = func.getCategoriesTree(
      resData,
      "61537c2d6464c09286494c63"
   );
   const homeOfferList = func.getCategoriesTree(
      resData,
      "6154640f79053f941d1b76c9"
   );

   const homeOfferListtitle = {
      title: resData.filter((val) => val._id === "6154640f79053f941d1b76c9")
         ?.title,
      description: resData.filter((val) => val._id === "6154640f79053f941d1b76c9")
         ?.description,
   };

   return (
      <div>
         <Head />
         <Brands />
         <HomeSlider state={homeSlider} />
         <HomeProductsFirst
            state={resProductFirst}
            title={{
               title: "Best Sellers",
               description: "Our Most Popular Products",
            }}
         />
         <HomeFirstBox state={homeFirstBox} />
         <HomeSeccoundBoxs
            state={resProductSeccond}
            title={{
               title: "New Products",
               description: "We Added New Products For You",
            }}
         />
         <HomeOfferList state={homeOfferList} title={homeOfferListtitle} />
      </div>
   );
};

export const getServerSideProps = wrapper.getServerSideProps(() => async () => {
   const response = await axios.get(`${API_URL}/homesliderpublic`);

   const filterObjectFirst = {
      sort: { saleqty: -1 },
      limit: 10,
      skip: 0,
   };

   const responseProductFirs = await axios.post(
      `${API_URL}/productspublic/home`,
      filterObjectFirst
   );

   const filterObjectSeccond = {
      sort: { createdAt: -1 },
      limit: 15,
      skip: 0,
   };

   const responseProductSeccond = await axios.post(
      `${API_URL}/productspublic/home`,
      filterObjectSeccond
   );

   return {
      props: {
         resData: response.data,
         resProductFirst: responseProductFirs.data,
         resProductSeccond: responseProductSeccond.data,
      },
   };
});

export default homePage;

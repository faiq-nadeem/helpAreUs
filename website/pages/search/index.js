import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import router from "next/router";
import { CloseCircleOutlined, FilterOutlined } from "@ant-design/icons";
import { filterProducts_r } from "../../redux/actions";

import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const FilterSelectedTop = dynamic(() => import("../../app/components/FilterProducts/FilterSelectedTop"));
const BrandsFilter = dynamic(() => import("../../app/components/FilterProducts/BrandsFilter"));
const CategoriesFilter = dynamic(() => import("../../app/components/FilterProducts/CategoriesFilter"));
const PriceFilter = dynamic(() => import("../../app/components/FilterProducts/PriceFilter"));
const FilterProductArea = dynamic(() => import("../../app/components/FilterProducts/FilterProductArea"));
const TextFilter = dynamic(() => import("../../app/components/FilterProducts/TextFilter"));
const SortProducts = dynamic(() => import("../../app/components/FilterProducts/SortProducts"));

const Page = () => {
   const { filterProducts } = useSelector(
      ({ filterProducts }) => filterProducts
   );
   const [openFilter, seTopenFilter] = useState(false);

   const dispatch = useDispatch();

   const callUrltoRedux = async () => {
      const urlToRedux = {};
      for await (const [key, value] of Object.entries(router.query)) {
         const arr = "[\"" + value.replaceAll(",", "\",\"") + "\"]";
         urlToRedux[key] = JSON.parse(arr);
      }

      await dispatch(
         filterProducts_r({ ...filterProducts, ...urlToRedux, skip: 0, limit: 12 })
      );
   };

   useEffect(() => {
      callUrltoRedux();
   }, [router.router?.asPath]);

   return (
      <div className="container-custom  ">
         <div className="grid grid-cols-12 h-full my-2 py-2  bg-white">
            <Head title="Search" />

            <div
               className={`md:col-span-2 col-span-12 p-2 shadow-sm border-top md:relative md:top-auto md:right-auto md:left-auto md:bottom-auto md:visible md:block
            ${openFilter
         ? " fixed overflow-scroll top-0 left-0 right-0 bottom-0 w-screen h-screen bg-white z-20 "
         : "invisible hidden"
      } `}
            >
               <div
                  className="float-right  md:hidden block"
                  onClick={() => seTopenFilter(false)}
               >
                  <CloseCircleOutlined />
               </div>
               <TextFilter />
               <CategoriesFilter />
               <PriceFilter />
               <BrandsFilter />

               <div
                  className="float-right w-full p-2 cursor-pointer  md:hidden block text-center bg-black text-white mt-10"
                  onClick={() => seTopenFilter(false)}
               >
            Filter Done
               </div>
            </div>

            <div className=" md:col-span-10  col-span-12  ">
               <div className="w-6/12 float-left">
                  <button
                     className="items-center w-full  bg-white border rounded-sm p-0.3 text-base block md:hidden"
                     onClick={() => seTopenFilter(true)}
                  >
              Open Filter <FilterOutlined />
                  </button>
               </div>
               <div className="w-6/12 md:w-2/12 pr-5 float-right">
                  <SortProducts />
               </div>
               <div className="w-full float-left   pb-0">
                  <FilterSelectedTop />
               </div>
               <div className="w-full mt-3 float-left">
                  <FilterProductArea />
               </div>
            </div>
         </div>
      </div>
   );
};

export default Page;

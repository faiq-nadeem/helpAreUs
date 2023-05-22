import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { API_URL } from "../../../config";
import axios from "axios";
import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const Page = ({ seo, resData }) => {
   const { topmenu } = useSelector((state) => state.topmenu);

   const content = topmenu.find((x) => x.seo == seo);
   const leftMenu = topmenu.filter(
      (x) => x.categories_id == content.categories_id
   );
   const leftMenuTitle = topmenu.find((x) => x._id == content.categories_id);

   const [contentDescription, seTcontentDescription] = useState("<p></p>");

   function createMarkup() {
      return { __html: contentDescription };
   }

   useEffect(() => {
      seTcontentDescription(replaceStyle(resData.description));
   }, [resData.description]);

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

   return (
      <div className="container-custom h-full ">
         <Head
            title={content.title}
            description={content.description_short}
            keywords={content.description_short}
         />
         <div className="grid shadow-lg p-4 grid-cols-12 my-8 sm:gap-9 bg-white">
            <div className=" lg:col-span-3  col-span-12 sm:order-2 order-2 ">
               <div className="text-xl font-semibold col-span-12 text-brand-color  mb-5 mt-5 sm:mt-0  ">
                  {leftMenuTitle && leftMenuTitle.title}
               </div>
               {leftMenu &&
            leftMenu?.map((x, i) => (
               <Link href={"/content/" + x.seo} key={i}>
                  <a className="w-full py-3 border-b border-t -mt-0.1 float-left hover:pl-1  transform-all">
                     {x.title}
                  </a>
               </Link>
            ))}
            </div>
            <div className=" lg:col-span-9 sm:order-2 order-1  col-span-12 ">
               <div className="text-2xl font-semibold col-span-12 text-brand-color  mb-5   ">
                  {content && content.title}
               </div>
               <div dangerouslySetInnerHTML={createMarkup()} />
            </div>
         </div>
      </div>
   );
};

export const getServerSideProps = async ({ query }) => {
   const res = await axios.get(`${API_URL}/topmenupublic/${query.seo}`);

   return {
      props: {
         seo: query.seo,
         resData: res.data[0],
      },
   };
};

export default Page;

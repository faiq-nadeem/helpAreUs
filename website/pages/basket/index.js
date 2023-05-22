

import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const BasketList = dynamic(() => import("../../app/components/Basket/BasketList"));
const DetailPrice = dynamic(() => import("../../app/components/Basket/DetailPrice"));

const Page = () => {
   return (
      <div className="container-custom h-full grid grid-cols-12 ">
         <Head title="Basket" />
         <div className=" col-span-12 lg:col-span-9 shadow-lg m-0 sm:m-4 grid-cols-2 my-8 gap-9  bg-white">
            <BasketList />
         </div>
         <div className=" col-span-12 lg:col-span-3 shadow-lg m-0 sm:m-4  grid-cols-2 bg-white my-8 gap-9">
            <DetailPrice />
         </div>
      </div>
   );
};

export default Page;

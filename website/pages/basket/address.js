
import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const DetailPriceAddress = dynamic(() => import("../../app/components/Basket/DetailPriceAddress"));
const AddressList = dynamic(() => import("../../app/components/Basket/AddressList"));

const Page = () => {
   return (
      <div className="container-custom h-full grid grid-cols-12 ">
         <Head title="Address" />
         <div className=" col-span-12 lg:col-span-9 shadow-lg m-0 sm:m-4 grid-cols-2 my-8 gap-9 py-5 bg-white">
            <AddressList />
         </div>
         <div className=" col-span-12 lg:col-span-3 shadow-lg m-0 sm:m-4 grid-cols-2 my-8 gap-9 bg-white">
            <DetailPriceAddress />
         </div>
      </div>
   );
};

export default Page;

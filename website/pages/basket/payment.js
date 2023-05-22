import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../../config";


import dynamic from "next/dynamic";

const Head = dynamic(() => import("../../app/core/Head"));
const DetailPricePay = dynamic(() => import("../../app/components/Basket/DetailPricePay"));
const StripeComponent = dynamic(() => import("../../app/components/Stripe"));

const Page = () => {
   const { basket } = useSelector((state) => state.basket);
   const [public_key, seTpublic_key] = useState("");
   const [contract, seTcontract] = useState("");

   const getPaymentMethodStripe = () => {
      axios
         .get(`${API_URL}/paymentmethodspublic/6132787ae4c2740b7aff7320`)
         .then((res) => {
            seTpublic_key(res.data[0].public_key);
            seTcontract(res.data[0].contract);
         });
   };
   useEffect(() => {
      getPaymentMethodStripe();
   }, [basket[0], public_key]);

   return (
      <div className="container-custom h-full grid grid-cols-12 ">
         <Head title="Payments" />
         <div className="col-span-12 lg:col-span-9 shadow-lg m-4 grid-cols-2 my-8 gap-9 py-5 bg-white order-2 lg:order-1">
            <StripeComponent
               basket={basket}
               public_key={public_key}
               contract={contract}
            />
         </div>
         <div className=" col-span-12 lg:col-span-3 shadow-lg m-4 grid-cols-2 bg-white my-8 gap-9 order-1 lg:order-2">
            <DetailPricePay />
         </div>
      </div>
   );
};

export default Page;

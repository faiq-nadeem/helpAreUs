import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { API_URL } from "../../../../config";
import CheckoutForm from "./CheckoutForm";
import axios from "axios";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.

export default function Default({ basket, public_key, contract }) {
   const [clientSecret, setClientSecret] = useState("");
   const stripePromise = loadStripe(public_key);

   const getProductAmounth = () => {
      if (basket.length > 0) {
         const arrayId = [];
         basket[0].products.map((x) => {
            arrayId.push(x.product_id);
         });
         axios
            .post(API_URL + "/payment/stripe", {
               ids: arrayId,
               items: basket[0].products,
               cargoes_id: basket[0].cargoes_id,
               allBasket: basket,
            })
            .then((res) => setClientSecret(res.data.clientSecret));
      }
   };

   useEffect(() => {
      getProductAmounth();
   }, [basket[0]]);

   const appearance = {
      theme: "stripe",
   };
   const options = {
      clientSecret,
      appearance,
   };

   return (
      <div>
         {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
               <CheckoutForm contract={contract} />
            </Elements>
         )}
      </div>
   );
}

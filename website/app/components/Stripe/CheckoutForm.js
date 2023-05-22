import { useEffect, useState } from "react";
import {
   PaymentElement,
   useStripe,
   useElements,
} from "@stripe/react-stripe-js";
import { Checkbox, Button, Form, Input } from "antd";
import router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getBasket_r, updateBasket_r } from "../../../redux/actions";
import axios from "axios";
import { API_URL } from "../../../../config";

export default function CheckoutForm({ contract }) {
   const stripe = useStripe();
   const elements = useElements();
   const dispatch = useDispatch();
   const { basket } = useSelector((state) => state.basket);
   const { user, isAuthenticated } = useSelector((state) => state.login);
   const [message, setMessage] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isChecked, seTisChecked] = useState(false);

   useEffect(() => {
      if (!stripe) {
         return;
      }

      const clientSecret = new URLSearchParams(window.location.search).get(
         "payment_intent_client_secret"
      );

      if (!clientSecret) {
         return;
      }

      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
         switch (paymentIntent.status) {
         case "succeeded":
            setMessage("Payment succeeded!");
            break;
         case "processing":
            setMessage("Your payment is processing.");
            break;
         case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
         default:
            setMessage("Something went wrong.");
            break;
         }
      });
   }, [stripe, user]);

   const handleSubmit = async (data) => {
      basket[0].receiver_name = data.name;
      basket[0].receiver_email = data.email;
      basket[0].receiver_phone = data.phone;

      if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
         return;
      }

      setIsLoading(true);

      stripe
         .confirmPayment({
            elements,
            redirect: "if_required",
         })
         .then(async (res) => {
            if (res.error) {
               setMessage(res.error.message);
            } else {
               if (basket[0].products.length > 0) {
                  const arrayId = [];

                  basket[0].products.map((x) => {
                     arrayId.push(x.product_id);
                  });
                  basket[0].payment_intent = res.paymentIntent.id;
                  const id = basket[0]._id;
                  delete basket[0]._id;
                  const dataRes = await axios.post(`${API_URL}/payment/stripeokey`, {
                     ids: arrayId,
                     items: basket[0].products,
                     basket: basket,
                  });

                  basket[0].products = [];
                  basket[0].cargoes_id = null;
                  basket[0].total_price = 0;
                  basket[0].total_discount = 0;
                  basket[0].cargo_price = 0;
                  basket[0].cargo_price_discount = 0;

                  if (isAuthenticated) {
                     await axios
                        .post(`${API_URL}/basket/${id}`, basket[0])
                        .then(async () => {
                           await dispatch(getBasket_r(user.id));
                           router.push(
                              "/basket/paymentokey?payment_intent=" +
                      dataRes.data.payment_intent +
                      "&ordernumber=" +
                      dataRes.data.ordernumber
                           );
                        })
                        .catch((err) => {
                           console.log(err);
                        });
                  } else {
                     await dispatch(updateBasket_r(basket[0]));
                     router.push(
                        "/basket/paymentokey?payment_intent=" +
                  dataRes.data.payment_intent +
                  "&ordernumber=" +
                  dataRes.data.ordernumber
                     );
                  }
               }
            }
         });

      setIsLoading(false);
   };
   return (
      <Form onFinish={handleSubmit} layout="vertical">
         <div className="grid grid-cols-12 lg:gap-10 lg:m-10 lg:p-0 p-5 ">
            <div className="lg:col-span-4 col-span-12 ">
               <div className="text-lg font-semibold col-span-12 text-brand-color  mb-5  mt-5">
            Receiver{" "}
               </div>
               <Form.Item
                  name="name"
                  label="Name"
                  className="col-span-4 mb-3"
                  initialValue={user.name}
                  rules={[
                     {
                        required: true,
                        message: "Please Fill",
                     },
                  ]}
               >
                  <Input size="large" className="p-2" />
               </Form.Item>
               <Form.Item
                  name="email"
                  label="E-mail"
                  className="col-span-4 mb-3"
                  initialValue={user.username}
                  rules={[
                     {
                        type: "email",
                        message: "input not valid",
                     },
                     {
                        required: true,
                        message: "The input is not valid E-mail!",
                     },
                  ]}
               >
                  <Input size="large" className="p-2" />
               </Form.Item>
               <Form.Item
                  name="phone"
                  label="Phone"
                  className="col-span-4 mb-3"
                  initialValue={user.phone ? user.prefix + user.phone : ""}
                  rules={[
                     {
                        required: true,
                        message: "Please Fill",
                     },
                  ]}
               >
                  <Input size="large" className="p-2" />
               </Form.Item>
            </div>
            <div className="lg:col-span-8 col-span-12">
               <div className="text-lg font-semibold    text-brand-color  mt-5">
            Stripe Payment{" "}
               </div>
               <PaymentElement className="  mt-5" />
            </div>
            <div className="col-span-12">
               <div className="text-lg font-semibold    text-brand-color">
            Contract
               </div>
               <div className=" overflow-y-scroll h-36   my-2 bg-gray-50 text-gray-500 p-7 rounded-t-none  rounded-lg w-auto">
                  {contract}
               </div>

               <Checkbox
                  className=" w-auto   my-4 "
                  onChange={() => {
                     seTisChecked(!isChecked);
                  }}
                  checked={isChecked}
               >
            I accept the contract
               </Checkbox>
               {message && (
                  <div className="text-red-600 font-semibold text-center text-xl m-10">
                     {message}
                  </div>
               )}
               <div className="  ">
                  <Button
                     disabled={(!isChecked && !isLoading) || !stripe || !elements}
                     className="bg-black  focus:bg-black  w-full h-auto mb-5   cursor-pointer hover:text-white hover:bg-brand-color transition-all text-xl text-white focus:text-white p-5"
                     htmlType="submit"
                  >
                     <span id="button-text">
                        {isLoading ? (
                           <div className="spinner" id="spinner"></div>
                        ) : (
                           "Pay now"
                        )}
                     </span>
                  </Button>
               </div>
            </div>
         </div>
         {/* Show any error or success messages */}
      </Form>
   );
}

import axios from "axios";
import { useState, useEffect } from "react";
import router from "next/router";
import { Button, Divider, message } from "antd";
import Price from "../Price";
import { CheckSquareOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../../config";
import func from "../../../util/helpers/func";
import { getBasket_r } from "../../../redux/actions";

const Default = () => {
   const { basket } = useSelector((state) => state.basket);
   const { user } = useSelector(({ login }) => login);
   const [billingAddress, seTbillingAddress] = useState({});
   const [shippingAddress, seTshippingAddress] = useState({});
   const [selectedCargo, seTselectedCargo] = useState({
      cargo_price_discount: 0,
      cargo_price: 0,
      selectedCargo: 0,
   });
   const [allPrice, seTallPrice] = useState({
      total: 0,
      discount: 0,
      cargo_price: 0,
      cargo_price_discount: 0,
   });
   const dispatch = useDispatch();

   const getBasketProducts = (data = [], products = []) => {
      let basketTotalPrice = 0;
      let basketTotalDiscountPrice = 0;
      const errorArray = [];

      products.map((x) => {
         const array = data.find((y) => y._id == x.product_id);

         if (array) {
            const resData = array;
            if (x.selectedVariants !== undefined) {
               const priceMath = func.filter_array_in_obj(
                  resData.variant_products,
                  x.selectedVariants
               );

               if (priceMath[0].visible === false) {
                  errorArray.push("Product Not Active");
               } else if (Number(priceMath[0].qty) < Number(x.qty)) {
                  errorArray.push("Product Not in Stock");
               } else {
                  errorArray.push(null);
               }

               basketTotalPrice = basketTotalPrice + x.qty * priceMath[0].price;
               basketTotalDiscountPrice =
            basketTotalDiscountPrice + x.qty * priceMath[0].before_price;
            } else {
               if (resData.isActive === false) {
                  errorArray.push("Product Not Active");
               } else if (Number(resData.qty) < Number(x.qty)) {
                  errorArray.push("Product Not in Stock");
               } else {
                  errorArray.push(null);
               }

               basketTotalPrice = basketTotalPrice + x.qty * resData.price;
               basketTotalDiscountPrice =
            basketTotalDiscountPrice + x.qty * resData.before_price;
            }
         }
      });
      seTallPrice({
         total: basketTotalPrice,
         discount: basketTotalDiscountPrice,
         error: errorArray,
      });
   };

   const getProducts = async () => {
      if (basket.length > 0) {
         const arrayId = [];
         basket[0].products.map((x) => {
            arrayId.push(x.product_id);
         });
         await axios
            .post(`${API_URL}/basket/allproducts`, { _id: arrayId })
            .then((res) => {
               getBasketProducts(res.data, basket[0].products);
            });
         seTbillingAddress(basket[0].billing_address);
         seTshippingAddress(basket[0].shipping_address);
      }
   };

   const getCargoes = async () => {
      await axios.get(`${API_URL}/cargoespublic`).then((res) => {
         if (basket.length > 0) {
            if (basket[0].cargoes_id) {
               seTselectedCargo({
                  cargo_price: basket[0].cargo_price,
                  cargo_price_discount: basket[0].cargo_price_discount,
                  selectedCargo: basket[0].cargoes_id,
               });
            } else {
               seTselectedCargo({
                  cargo_price: res.data[0].price,
                  cargo_price_discount: res.data[0].before_price,
                  selectedCargo: res.data[0]._id,
               });
            }
         }
      });
   };

   const onSubmit = async () => {
      const errorArray = [];
      const arrayId = [];

      basket[0].products.map((x) => {
         arrayId.push(x.product_id);
      });

      await axios
         .post(`${API_URL}/basket/allproducts`, { _id: arrayId })
         .then((res) => {
            const data = res.data;
            const products = basket[0].products;
            let basketTotalPrice = 0;
            let basketTotalDiscountPrice = 0;

            products.map((x) => {
               const array = data.find((y) => y._id == x.product_id);

               if (array) {
                  const resData = array;
                  if (x.selectedVariants !== undefined) {
                     const priceMath = func.filter_array_in_obj(
                        resData.variant_products,
                        x.selectedVariants
                     );

                     if (priceMath[0].visible === false) {
                        errorArray.push(true);
                     } else if (Number(priceMath[0].qty) < Number(x.qty)) {
                        errorArray.push(true);
                     } else {
                        errorArray.push(false);
                     }

                     basketTotalPrice = basketTotalPrice + x.qty * priceMath[0].price;
                     basketTotalDiscountPrice =
                basketTotalDiscountPrice + x.qty * priceMath[0].before_price;
                  } else {
                     if (resData.isActive === false) {
                        errorArray.push(true);
                     } else if (Number(resData.qty) < Number(x.qty)) {
                        errorArray.push(true);
                     } else {
                        errorArray.push(false);
                     }

                     basketTotalPrice = basketTotalPrice + x.qty * resData.price;
                     basketTotalDiscountPrice =
                basketTotalDiscountPrice + x.qty * resData.before_price;
                  }
               }
            });
         });

      let control = false;
      control = errorArray.find((x) => x == true);
      if (control === undefined) {
         router.push("/basket/payment");
      } else {
         dispatch(getBasket_r(user.id));
         message
            .loading("Action in progress..", 0.5)
            .then(() => message.error("Please Control Your Basket", 2.5));
         router.push("/basket");
      }
   };

   useEffect(() => {
      getCargoes();
      getProducts();
   }, [basket[0]]);

   return (
      <div className="h-full relative">
         <div className=" h-20">
            <Button
               disabled={billingAddress && shippingAddress ? false : true}
               className="bg-black w-full h-auto absolute top-0 cursor-pointer hover:text-white hover:bg-brand-color transition-all text-xl text-white p-5"
               onClick={onSubmit}
            >
          Save and Continue
               <CheckSquareOutlined className="float-right text-3xl" />
            </Button>
         </div>

         <div className="text-lg p-3 -mt-2 bg-gray-50 font-semibold">
        Shipping Address Summary
         </div>

         <div className="w-full p-4">
            {shippingAddress ? (
               <>
                  <b>{shippingAddress.name} </b>
                  <br />
                  <div className="flex w-full justify-between pt-1 ">
                     {shippingAddress.address}
                     <br />
                     {shippingAddress.village_id}/{shippingAddress.town_id}/
                     {shippingAddress.city_id}/{shippingAddress.country_id}
                  </div>
               </>
            ) : (
               <div className="text-red-500 text-center font-semibold p-4">
            Please Select Address
               </div>
            )}
         </div>

         <div className="text-lg p-3  bg-gray-50 font-semibold">
        Billing Address Summary
         </div>

         <div className="w-full p-4 ">
            {billingAddress ? (
               <>
                  <b>{billingAddress.name} </b>
                  <br />
                  <div className="flex w-full justify-between pt-1 ">
                     {billingAddress.address}
                     <br />
                     {billingAddress.village_id}/{billingAddress.town_id}/
                     {billingAddress.city_id}/{billingAddress.country_id}
                  </div>
               </>
            ) : (
               <div className="text-red-500 text-center font-semibold p-4">
            Please Select Address
               </div>
            )}
         </div>

         <div className="text-lg p-3  bg-gray-50 font-semibold">Cargo Summary</div>

         <div className="w-full px-4 ">
            {selectedCargo.cargo_price_discount > 0 ? (
               <div className="w-full  mt-3 ">
                  <span>Cargo Discount:</span>
                  <span className="float-right font-semibold line-through">
                     <Price data={selectedCargo.cargo_price_discount} />
                  </span>
               </div>
            ) : (
               ""
            )}
            <div className="w-full  mt-3 ">
               <span>Cargo Price:</span>
               <span className="float-right font-semibold">
                  <Price data={selectedCargo.cargo_price} />
               </span>
            </div>
         </div>

         <div className="text-lg p-3 my-5 bg-gray-50 font-semibold">
        Basket Summary
         </div>
         {allPrice.discount + selectedCargo.cargo_price_discount > 0 ? (
            <>
               <div className="w-full px-4 mt-1">
                  <span>Total Discount:</span>
                  <span className="float-right  line-through font-semibold">
                     <Price
                        data={allPrice.discount + selectedCargo.cargo_price_discount}
                     />
                  </span>
               </div>
               <Divider />
            </>
         ) : (
            ""
         )}
         <div className="w-full px-4 text-lg mb-6">
            <span>Total Price:</span>
            <span className="float-right font-semibold text-brand-color">
               <Price data={allPrice.total + selectedCargo.cargo_price} />
            </span>
         </div>
         <div className=" h-20">
            <Button
               disabled={billingAddress && shippingAddress ? false : true}
               className="bg-black w-full h-auto absolute bottom-0 cursor-pointer hover:text-white hover:bg-brand-color transition-all text-xl text-white p-5"
               onClick={onSubmit}
            >
          Save and Continue
               <CheckSquareOutlined className="float-right text-3xl" />
            </Button>
         </div>
      </div>
   );
};

export default Default;

import { useDispatch } from "react-redux";
import { message, Button } from "antd";
import { ShoppingCartOutlined, LoadingOutlined, CreditCardOutlined } from "@ant-design/icons";
import { updateBasket_r } from "../../../redux/actions";
import axios from "axios";
import { API_URL } from "../../../../config";

import { useRouter } from "next/router";
const Page = ({
   form,
   disabledVariant = true,
   seTloadingButton,
   loadingButton,
   basket,
   isAuthenticated,
   user,
   state,
   priceAdd,
   getBasket,
}) => {
   const dispatch = useDispatch();
   // const seo = router.query.seo
   const router = useRouter();

   const addBasket = (res) => {
      if (basket.length < 1) {
         const post = {
            created_user: {
               name: user.name,
               id: user.id,
            },
            customer_id: user.id,
            products: [
               {
                  product_id: state._id,
                  seo: state.seo,
                  selectedVariants: res,
                  qty: 1,
               },
            ],
            total_price: priceAdd.price,
            discount_price: priceAdd.before_price,
         };
         if (isAuthenticated) {
            axios
               .post(`${API_URL}/basket/add`, post)
               .then(() => {
                  getBasket(user.id);
                  seTloadingButton(true);
                  form.resetFields();
                  message.success({ content: "Product Added!", duration: 3 });
               })
               .catch((err) => {
                  message.error({
                     content: "Some Error, Please Try Again " + err,
                     duration: 3,
                  });
               });
         } else {
            seTloadingButton(true);
            form.resetFields();
            message.success({ content: "Product Added!", duration: 3 });
            dispatch(updateBasket_r([post]));
         }
      } else {
         const productsDataArray = basket[0].products;
         const productsData = [];

         if (state.type) {
            const variantControl = productsDataArray.find(
               (x) =>
                  (x.product_id._id == state._id || x.product_id == state._id) &&
            JSON.stringify(x.selectedVariants) == JSON.stringify(res)
            );
            const variantControlNot = productsDataArray.filter(
               (x) => JSON.stringify(x.selectedVariants) != JSON.stringify(res)
            );
            if (variantControl == undefined) {
               productsData.push(...productsDataArray, {
                  product_id: state._id,
                  selectedVariants: res,
                  seo: state.seo,
                  qty: 1,
               });
            } else {
               productsData.push(...variantControlNot, {
                  product_id: state._id,
                  selectedVariants: res,
                  seo: state.seo,
                  qty: variantControl.qty + 1,
               });
            }
         } else {
            const variantControlId = productsDataArray.find(
               (x) => x.product_id._id == state._id || x.product_id == state._id
            );
            const variantControlIdNot = productsDataArray.filter(
               (x) =>
                  JSON.stringify(x.selectedVariants) != JSON.stringify(res) &&
            x.product_id != state._id
            );

            if (variantControlId == undefined) {
               productsData.push(...productsDataArray, {
                  product_id: state._id,
                  selectedVariants: undefined,
                  seo: state.seo,
                  qty: 1,
               });
            } else {
               productsData.push(...variantControlIdNot, {
                  product_id: state._id,
                  selectedVariants: undefined,
                  seo: state.seo,
                  qty: variantControlId.qty + 1,
               });
            }
         }
         const post = {
            created_user: {
               name: user.name,
               id: user.id,
            },
            customer_id: user.id,
            products: productsData.sort(
               (a, b) =>
                  (a.seo + JSON.stringify(a.selectedVariants)).length -
            (b.seo + JSON.stringify(b.selectedVariants)).length
            ),
         };
         if (isAuthenticated) {
            axios
               .post(`${API_URL}/basket/${basket[0]._id}`, post)
               .then(() => {
                  getBasket(user.id);
                  seTloadingButton(true);
                  form.resetFields();
                  message.success({ content: "Product Added!", duration: 3 });
               })
               .catch((err) => {
                  message.error({
                     content: "Some Error, Please Try Again",
                     duration: 3,
                  });
                  console.log(err);
               });
         } else {
            seTloadingButton(true);
            form.resetFields();
            message.success({ content: "Product Added!", duration: 3 });
            dispatch(updateBasket_r([post]));
         }
      }
   };

   return (
      <div className=" gap-4 xl:flex lg:grid">


         <Button
            type="primary"
            className=" xl:w-8/12 w-full border-black bg-black text-2xl h-auto hover:bg-white hover:border-black hover:text-black"
            disabled={!disabledVariant}
            onClick={() => {
               form
                  .validateFields()
                  .then((res) => {
                     seTloadingButton(false);
                     if (loadingButton) {
                        addBasket(res);
                        router.push("/basket");
                     }
                  })
                  .catch((err) => console.log("err", err));
            }}
         >
        Buy Now
            {loadingButton ? (
               <CreditCardOutlined />
            ) : (
               <LoadingOutlined className="animate-spin h-5 w-5 mr-3  " />
            )}
         </Button>

         <Button
            type="primary"
            className="  xl:w-4/12 w-full border-brand-color bg-brand-color text-2xl h-auto  hover:bg-white hover:border-brand-color hover:text-brand-color"
            disabled={!disabledVariant}
            onClick={() => {
               form
                  .validateFields()
                  .then((res) => {
                     seTloadingButton(false);
                     if (loadingButton) {
                        addBasket(res);
                     }
                  })
                  .catch((err) => console.log("err", err));
            }}
         >
        Add to Basket
            {loadingButton ? (
               <ShoppingCartOutlined />
            ) : (
               <LoadingOutlined className="animate-spin h-5 w-5 mr-3  " />
            )}
         </Button>
      </div>

   );
};

export default Page;

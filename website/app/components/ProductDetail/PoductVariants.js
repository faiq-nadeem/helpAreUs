import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Divider, Radio, Form } from "antd";
import { getBasket_r } from "../../../redux/actions";
import Price from "../Price";
import AddProductButton from "./AddProductButton";
import func from "../../../util/helpers/func";

const Page = ({ data = {} }) => {
   const { isAuthenticated, user } = useSelector(({ login }) => login);
   const { basket } = useSelector(({ basket }) => basket);
   const state = data;

   const [loadingButton, seTloadingButton] = useState(true);
   const [disabledVariant, seTdisabledVariant] = useState(true);
   const [priceAdd, seTpriceAdd] = useState({
      before_price: 0,
      price: 0,
      qty: 1,
   });

   const [form] = Form.useForm();

   const dispatch = useDispatch();
   // const seo = router.query.seo

   const getBasket = (id) => {
      dispatch(getBasket_r(id));
   };

   useEffect(() => {
      getBasket(user.id);
   }, []);

   const onFinishFailed = (errorInfo) => {
      console.log(errorInfo);
   };
   const getVariantPrice = (data) => {
      if (data.length > 0) {
         const newData = data.sort((a, b) => {
            return a.price - b.price;
         });
         return (
            <span>
               <Price data={newData[0].price} /> -{" "}
               <Price data={newData[data.length - 1].price} />{" "}
            </span>
         );
      }
   };

   return (
      <div className="lg:pl-10 px-2">
         <h2 className="font-semibold   mt-5">{state.title}</h2>
         <h3 className="text-gray-500">{state.description_short}</h3>
         <div className="my-4 w-full">
            {state.type ? (
               <>
                  {disabledVariant ? (
                     <h1 className=" text-brand-color font-semibold text-2xl">
                        {priceAdd.price != 0 ? (
                           <Price data={priceAdd.price} />
                        ) : (
                           getVariantPrice(state.variant_products)
                        )}

                        {priceAdd.before_price != 0 &&
                  priceAdd.before_price > priceAdd.price ? (
                              <span className="line-through ml-3 text-sm text-black">
                                 <Price data={priceAdd.before_price} />
                              </span>
                           ) : (
                              ""
                           )}
                     </h1>
                  ) : (
                     <h2 className="text-red-500">This is variant not shipping.</h2>
                  )}
               </>
            ) : (
               <h1 className="text-brand-color font-semibold text-2xl">
                  {disabledVariant ? (
                     <>
                        <Price data={state.price} />

                        {state.before_price != 0 ? (
                           <span className="line-through ml-3 text-sm text-black">
                              <Price data={state.before_price} />
                           </span>
                        ) : (
                           ""
                        )}
                     </>
                  ) : (
                     ""
                  )}
               </h1>
            )}
         </div>
         <div>
            <Form
               form={form}
               name="add"
               onFinishFailed={onFinishFailed}
               scrollToFirstError
               layout="vertical"
               className="w-full "
            >
               {state.type ? (
                  <>
                     <Divider />

                     {state.variants.map((x) => (
                        <div key={x.name}>
                           <Form.Item
                              name={x.name}
                              label={
                                 form.getFieldValue(x.name) ? (
                                    <span className="font-normal">
                                       {x.name} :
                                       <span className="font-semibold">
                                          {" "}
                                          {form.getFieldValue(x.name)}{" "}
                                       </span>
                                    </span>
                                 ) : (
                                    <span className="font-normal">
                                       {x.name} :
                                       <span className="text-gray-500"> Please Select</span>
                                    </span>
                                 )
                              }
                              labelAlign="left"
                              className="mb-0 pb-0 mt-5 "
                              rules={[
                                 {
                                    required: true,
                                    message: "Please Select",
                                    whitespace: true,
                                 },
                              ]}
                           >
                              <Radio.Group
                                 name={x.name}
                                 optionType="button"
                                 buttonStyle="outline"
                                 className="pl-2 mt-2 mb-1 "
                                 required
                                 onChange={(y) => {
                                    const data = state;
                                    data.selectedVariants = {
                                       ...data.selectedVariants,
                                       [y.target.name]: y.target.value,
                                    };
                                    const priceMath = func.filter_array_in_obj(
                                       data.variant_products,
                                       data.selectedVariants
                                    );

                                    if (priceMath.length == 1) {
                                       if (priceMath[0].qty == "0") {
                                          seTdisabledVariant(false);
                                       } else if (priceMath[0].visible) {
                                          seTdisabledVariant(true);
                                       } else {
                                          seTdisabledVariant(false);
                                       }
                                    }

                                    seTpriceAdd({
                                       qty: priceAdd.qty,
                                       price: priceMath[0].price * priceAdd.qty,
                                       before_price:
                            priceMath[0].before_price * priceAdd.qty,
                                    });
                                 }}
                              >
                                 {x.value.map((z, i) => {
                                    return (
                                       <Radio.Button key={i} value={z}>
                                          {z}
                                       </Radio.Button>
                                    );
                                 })}
                              </Radio.Group>
                           </Form.Item>
                        </div>
                     ))}
                  </>
               ) : (
                  ""
               )}

               {/* <label>Adet: <br /></label>
                            <div>
                                <Input type="number" onChange={x => {

                                    seTpriceAdd({
                                        qty: x.target.value,
                                        price: state.price * x.target.value,
                                        before_price: state.before_price * x.target.value
                                    })

                                }}
                                    value={priceAdd.qty}
                                />
                            </div> */}
               <Divider />
               <AddProductButton
                  disabledVariant={disabledVariant}
                  form={form}
                  seTloadingButton={seTloadingButton}
                  loadingButton={loadingButton}
                  basket={basket}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  state={state}
                  priceAdd={priceAdd}
                  getBasket={getBasket}
               />
            </Form>
            <Divider />
         </div>
      </div>
   );
};

export default Page;

import axios from "axios";
import { useState, useEffect } from "react";
import { Table, Popconfirm, message } from "antd";
import Price from "../Price";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../../config";
import func from "../../../util/helpers/func";
import { getBasket_r, updateBasket_r } from "../../../redux/actions";

const Default = () => {
   const { basket } = useSelector((state) => state.basket);
   const { isAuthenticated, user } = useSelector(({ login }) => login);
   const [state, seTstate] = useState([]);
   const [isLoaded, seTisLoaded] = useState(false);
   const dispatch = useDispatch();

   const getBasketProducts = (data = [], products = []) => {
      const BasketAllProducts = [];
      products.map((x) => {
         const array = data.find((y) => y._id == x.product_id);
         if (array) {
            const resData = array;
            const errorArray = [];
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

               BasketAllProducts.push({
                  _id: resData._id,
                  title: resData.title,
                  selectedVariants: x.selectedVariants,
                  qty: x.qty,
                  price: priceMath[0].price,
                  before_price: priceMath[0].before_price,
                  total_price: x.qty * priceMath[0].price,
                  total_discount: x.qty * priceMath[0].before_price,
                  error: errorArray,
                  seo: resData.seo,
               });
            } else {
               if (resData.isActive === false) {
                  errorArray.push("Product Not Active");
               } else if (Number(resData.qty) < Number(x.qty)) {
                  errorArray.push("Product Not in Stock");
               } else {
                  errorArray.push(null);
               }

               BasketAllProducts.push({
                  _id: resData._id,
                  title: resData.title,
                  selectedVariants: x.selectedVariants,
                  qty: x.qty,
                  price: resData.price,
                  before_price: resData.before_price,
                  total_price: x.qty * resData.price,
                  total_discount: x.qty * resData.before_price,
                  error: errorArray,
                  seo: resData.seo,
               });
            }
         }
      });

      seTstate(
         BasketAllProducts.sort(
            (a, b) =>
               (a.price + a.seo + JSON.stringify(a.selectedVariants)).length -
          (b.price + b.seo + JSON.stringify(b.selectedVariants)).length
         )
      );
   };

   const basketProductUpdate = (post, messageStr = "Product Update!") => {
      if (isAuthenticated) {
         axios
            .post(`${API_URL}/basket/${basket[0]._id}`, post)
            .then(async () => {
               message.success({ content: messageStr, duration: 3 });
               await dispatch(getBasket_r(user.id));
               seTisLoaded(false);
            })
            .catch((err) => {
               message.error({
                  content: "Some Error, Please Try Again",
                  duration: 3,
               });
               console.log(err);
            });
      } else {
         message.success({ content: messageStr, duration: 3 });
         dispatch(updateBasket_r([post]));
         getProducts();
         seTisLoaded(false);
      }
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
      }
   };

   useEffect(() => {
      getProducts();
   }, [basket[0]]);

   const deleteProduct = (dataRecord) => {
      seTisLoaded(true);
      const productsDataArray = basket[0].products;
      const productsData = [];
      const variantControlNot = productsDataArray.filter(
         (x) =>
            x.product_id != dataRecord._id ||
        JSON.stringify(x.selectedVariants) !=
        JSON.stringify(dataRecord.selectedVariants)
      );
      productsData.push(...variantControlNot);
      const post = {
         created_user: {
            name: user.name,
            id: user.id,
         },
         customer_id: user.id,
         products: productsData,
      };

      basketProductUpdate(post, "Delete Product!");
   };

   const plusProduct = (dataRecord) => {
      seTisLoaded(true);

      const productsDataArray = basket[0].products;
      const productsData = [];
      const variantControl = productsDataArray.find(
         (x) =>
            x.product_id == dataRecord._id &&
        JSON.stringify(x.selectedVariants) ==
        JSON.stringify(dataRecord.selectedVariants)
      );
      const variantControlNot = productsDataArray.filter(
         (x) =>
            x.product_id != dataRecord._id ||
        JSON.stringify(x.selectedVariants) !=
        JSON.stringify(dataRecord.selectedVariants)
      );
      productsData.push(...variantControlNot, {
         product_id: dataRecord._id,
         selectedVariants: dataRecord.selectedVariants,
         qty: variantControl.qty + 1,
         seo: dataRecord.seo,
      });
      const post = {
         created_user: {
            name: user.name,
            id: user.id,
         },
         customer_id: user.id,
         products: productsData,
      };

      basketProductUpdate(post);
   };

   const notPlusProduct = (dataRecord) => {
      seTisLoaded(true);
      const productsDataArray = basket[0].products;
      const productsData = [];
      const variantControl = productsDataArray.find(
         (x) =>
            x.product_id == dataRecord._id &&
        JSON.stringify(x.selectedVariants) ==
        JSON.stringify(dataRecord.selectedVariants)
      );
      const variantControlNot = productsDataArray.filter(
         (x) =>
            x.product_id != dataRecord._id ||
        JSON.stringify(x.selectedVariants) !=
        JSON.stringify(dataRecord.selectedVariants)
      );

      productsData.push(...variantControlNot, {
         product_id: dataRecord._id,
         selectedVariants: dataRecord.selectedVariants,
         qty: variantControl.qty > 1 ? variantControl.qty - 1 : variantControl.qty,
         seo: dataRecord.seo,
      });

      const post = {
         created_user: {
            name: user.name,
            id: user.id,
         },
         customer_id: user.id,
         products: productsData,
      };

      basketProductUpdate(post);
   };

   return (
      <>
         <Table
            pagination={false}
            loading={isLoaded}
            columns={[
               {
                  title: "Title",
                  dataIndex: "title",
                  key: "title",
                  render: (text, record) => {
                     const errorArray = [];
                     record.error.map((x) => {
                        errorArray.push(<div className="text-xs "> {x} </div>);
                     });

                     const variants = [];

                     for (const property in record.selectedVariants) {
                        variants.push(
                           <div className="text-xs ">
                              {" "}
                              <span className="font-semibold"> {property}</span>:{" "}
                              {record.selectedVariants[property]}{" "}
                           </div>
                        );
                     }

                     return (
                        <span className="link">
                           <div className="float-left mb-5 w-full">
                              <span className="float-right text-right sm:hidden ">
                                 <Popconfirm
                                    placement="left"
                                    title="Are You Sure?"
                                    onConfirm={() => {
                                       deleteProduct(record);
                                    }}
                                 >
                                    <a>
                                       <DeleteOutlined
                                          style={{ fontSize: "150%", marginLeft: "15px" }}
                                       />{" "}
                                    </a>
                                 </Popconfirm>
                              </span>
                              <div className="text-red-500 float-left">{errorArray}</div>
                              <span className="font-semibold">{text}</span>
                              {variants.length > 0 ? <> {variants}</> : <> </>}
                           </div>
                           <div className=" float-left sm:hidden flex flex-row h-10  my-2 rounded w-24 relative bg-transparent border-gray-200 border  ">
                              <button
                                 data-action="decrement"
                                 className=" bg-white text-gray-700 hover:text-black hover:bg-brand-color  h-full w-20 rounded-l cursor-pointer outline-none"
                                 onClick={() => {
                                    notPlusProduct(record);
                                 }}
                              >
                                 <span className="m-auto text-2xl font-thin">−</span>
                              </button>
                              <input
                                 type="number"
                                 className="outline-none  hiddenArrowInputNumber focus:outline-none text-center w-full bg-white font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  "
                                 name="custom-input-number"
                                 value={record.qty}
                              ></input>
                              <button
                                 data-action="increment"
                                 className="bg-white text-gray-700 hover:text-black hover:bg-brand-color h-full w-20 rounded-r cursor-pointer"
                                 onClick={() => {
                                    plusProduct(record);
                                 }}
                              >
                                 <span className="m-auto text-2xl font-thin">+</span>
                              </button>
                           </div>

                           <div className="text-center float-right sm:hidden  ">
                              <span className=" text-md line-through">
                                 {" "}
                                 {record.total_discount != 0 ? (
                                    <Price data={record.total_discount} />
                                 ) : (
                                    ""
                                 )}
                              </span>
                              <div className=" text-lg text-brand-color">
                                 <Price data={record.total_price} />
                              </div>
                           </div>
                        </span>
                     );
                  },
               },

               {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  className: "hidden sm:table-cell ",
                  render: (text, record) => (
                     <div className="text-center  ">
                        <span className=" text-md line-through">
                           {record.before_price != 0 ? (
                              <Price data={record.before_price} />
                           ) : (
                              ""
                           )}
                        </span>
                        <div className=" text-sm ">
                           <Price data={record.price} />
                        </div>
                     </div>
                  ),
               },

               {
                  title: "Qty",
                  dataIndex: "action",
                  key: "action",
                  className: "hidden sm:table-cell ",
                  render: (text, record) => (
                     <>
                        <div className="flex flex-row h-10  rounded w-24 relative bg-transparent border-gray-200 border mt-1">
                           <button
                              data-action="decrement"
                              className=" bg-white text-gray-700 hover:text-black hover:bg-brand-color  h-full w-20 rounded-l cursor-pointer outline-none"
                              onClick={() => {
                                 notPlusProduct(record);
                              }}
                           >
                              <span className="m-auto text-2xl font-thin">−</span>
                           </button>
                           <input
                              type="number"
                              className="outline-none  hiddenArrowInputNumber focus:outline-none text-center w-full bg-white font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  "
                              name="custom-input-number"
                              value={record.qty}
                           ></input>
                           <button
                              data-action="increment"
                              className="bg-white text-gray-700 hover:text-black hover:bg-brand-color h-full w-20 rounded-r cursor-pointer"
                              onClick={() => {
                                 plusProduct(record);
                              }}
                           >
                              <span className="m-auto text-2xl font-thin">+</span>
                           </button>
                        </div>
                     </>
                  ),
               },
               {
                  title: "Total Price",
                  dataIndex: "total_price",
                  key: "total_price",
                  className: "hidden sm:table-cell ",
                  render: (text, record) => (
                     <div className="text-center">
                        <span className=" text-md line-through">
                           {" "}
                           {record.total_discount != 0 ? (
                              <Price data={record.total_discount} />
                           ) : (
                              ""
                           )}
                        </span>
                        <div className=" text-lg text-brand-color">
                           <Price data={record.total_price} />
                        </div>
                     </div>
                  ),
               },

               {
                  title: "Delete",
                  dataIndex: "action",
                  key: "action",
                  className: "hidden sm:table-cell ",
                  render: (text, record) => (
                     <Popconfirm
                        placement="left"
                        title="Are You Sure?"
                        onConfirm={() => {
                           deleteProduct(record);
                        }}
                     >
                        <a>
                           <DeleteOutlined
                              style={{ fontSize: "150%", marginLeft: "15px" }}
                           />{" "}
                        </a>
                     </Popconfirm>
                  ),
               },
            ]}
            dataSource={[...state]}
         />
      </>
   );
};

export default Default;

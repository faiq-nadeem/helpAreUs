import Link from "next/link";
import func from "../../../util/helpers/func";
import { useSelector } from "react-redux";
import Price from "../Price";
import { Button } from "antd";
import { SwapRightOutlined } from "@ant-design/icons";
import { IMG_URL } from "../../../../config";

const Default = ({ data = null, className }) => {
   const { settings } = useSelector(({ settings }) => settings);


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
   const allImgData = data?.allImages?.sort((a, b) => a.order - b.order);
   const img = allImgData[0] ? IMG_URL + allImgData[0].image : "/images/nofoto.jpg";

   return (
      <div className={className} key={data._id}>
         <div className="  relative cursor-pointer  rounded-lg">
            <Link href={"/product/" + data.seo}>
               <div className="w-full">
                  <div className="w-full relative overflow-hidden   ">
                     <span
                        className={`${func.getDiscount(data) ? "visible" : "invisible"
                        } absolute z-10 top-0 mt-2 text-xs float-right py-1 px-2  bg-red-600 text-white`}
                     >
                        {settings.price_type
                           ? "%" + Number(func.getDiscount(data)).toFixed(0)
                           : Number(func.getDiscount(data)).toFixed(0) + "%"}{" "}
                        discount
                     </span>
                     <img
                        className="w-full h-full bg-center rounded-t-lg group-hover:scale-105 transition-all "
                        src={img}
                        width="220"
                        height="220"
                        alt={data.title}
                     />
                     <Button className="w-full   font-bold pb-5   group-hover:!text-black group-hover:!bg-white  border-0 shadow-none absolute transition-all  overflow-hidden -mt-5 z-0 group-hover:-mt-7 rounded-none group-hover:visible invisible">
                        Details <SwapRightOutlined />
                     </Button>
                     <ul className="product-links">
                        {/* <li><a href="#" data-tip="Add to Wishlist"><HeartOutlined /></a></li> 
                  <li><a href="#" data-tip="Quick View"><EyeOutlined /></a></li>
                */}
                     </ul>
                  </div>
                  <div className="mt-2 w-full">
                     {/* <ul className="rating">
                      <li className="fas fa-star"></li>
                      <li className="fas fa-star"></li>
                      <li className="fas fa-star"></li>
                      <li className="far fa-star"></li>
                      <li className="far fa-star"></li>
                  </ul> 
              */}
                     <h3 className="w-full text-center h-11 overflow-hidden px-1 mt-2 text-black font-bold ">
                        {data.title}
                     </h3>
                     <div className=" text-center text-md h-12 z-10 relative ">
                        <span className="font-semibold">
                           {data.type ? (
                              getVariantPrice(data.variant_products)
                           ) : (
                              <Price data={data.price} />
                           )}
                        </span>
                        <span className=" line-through text-xs  w-full float-left ">
                           {!data.type ? (
                              <>
                                 {" "}
                                 {data.before_price != 0 ? (
                                    <Price data={data.before_price} />
                                 ) : (
                                    ""
                                 )}
                              </>
                           ) : (
                              ""
                           )}
                        </span>
                     </div>
                  </div>
               </div>
            </Link>
         </div>
      </div>
   );
};

export default Default;

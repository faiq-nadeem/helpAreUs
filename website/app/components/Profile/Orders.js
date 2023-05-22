import { useState, useEffect } from "react";
import Link from "next/link";

import { Select, Table, Tooltip, Radio } from "antd";
import { useIntl } from "react-intl";
import axios from "axios";
import { API_URL } from "../../../../config";
import moment from "moment";
import Price from "../Price";

const Defaut = () => {
   const intl = useIntl();
   const [data, seTdata] = useState([]);
   const [orderStatus, seTorderStatus] = useState([]);

   const columns = [
      {
         title: intl.messages["app.pages.orders.orderNumber"],
         dataIndex: "ordernumber",
         key: "ordernumber",
         className: "hidden sm:table-cell ",
      },
      {
         title: intl.messages["app.pages.orders.totalPrice"],
         dataIndex: "total_price",
         key: "total_price",
         render: (text, record) =>
            (record.total_price + record.cargo_price).toLocaleString(),
      },
      {
         title: intl.messages["app.pages.common.date"],
         dataIndex: "createdAt",
         key: "createdAt",
         render: (text) => (
            <Tooltip placement="top" title={moment(text).fromNow()}>
               {moment(text).format("h:mm - DD/MM/YY")}
            </Tooltip>
         ),
      },
   ];

   const getDataFc = () => {
      axios
         .get(API_URL + "/orders")
         .then((res) => {
            if (res.data.length > 0) {
               const data = res.data;
               seTdata(data);
            }
         })
         .catch((err) => console.log(err));
   };

   const getDataStatusFc = (target = "All") => {
      if (target == "All") {
         return getDataFc();
      }
      axios
         .get(API_URL + "/orders/status/" + target)
         .then((res) => {
            seTdata(res.data);
         })
         .catch((err) => console.log(err));
   };

   const getOrderStatus = () => {
      axios
         .get(API_URL + "/orderstatus")
         .then((res) => {
            if (res.data.length > 0) {
               const data = res.data;
               seTorderStatus(data);
            }
         })
         .catch((err) => console.log(err));
   };

   useEffect(() => {
      getOrderStatus();
      getDataFc();
   }, []);

   const getVariant = (data) => {
      const variants = [];

      for (const property in data) {
         variants.push(
            <div className="text-xs ">
               {" "}
               {property}: {data[property]}{" "}
            </div>
         );
      }
      return variants.length > 0 ? <> {variants}</> : <> </>;
   };

   return (
      <>
         <Select
            defaultValue="All"
            className="w-full float-right sm:hidden block"
            onChange={(val) => {
               getDataStatusFc(val);
            }}
         >
            <Select.Option value="All">
               {intl.messages["app.pages.orders.all"]}
            </Select.Option>
            {orderStatus.map((item) => (
               <Select.Option ghost key={item._id} value={item._id}>
                  {item.title}
               </Select.Option>
            ))}
         </Select>

         <Radio.Group
            defaultValue="All"
            className="float-right mx-auto invisible sm:visible"
            buttonStyle="solid"
            onChange={(val) => {
               getDataStatusFc(val.target.value);
            }}
         >
            <Radio.Button value="All">
               {intl.messages["app.pages.orders.all"]}
            </Radio.Button>
            {orderStatus.map((item) => (
               <Radio.Button ghost key={item._id} value={item._id}>
                  {item.title}
               </Radio.Button>
            ))}
         </Radio.Group>
         <Table
            columns={columns}
            pagination={{ position: "bottom" }}
            dataSource={[...data]}
            rowKey="_id"
            expandable={{
               expandedRowRender: (record) => (
                  <div className="m-0 w-full ">
                     <div className="text-xl col-span-12   font-semibold text-center mb-10">
                Order Number:{record.ordernumber}{" "}
                     </div>
                     <div className="grid grid-cols-12 ">
                        <div className="col-span-12 sm:col-span-6">
                           <div className="font-bold">Receiver</div>
                           <div>{record.receiver_name}</div>
                           <div>{record.receiver_email}</div>
                           <div>{record.receiver_phone}</div>
                        </div>
                        <div className=" col-span-12 sm:col-span-4">
                           <div className="font-bold mt-5">Shipping Address</div>
                           <div>{record.shipping_address}</div>
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                           <div className="font-bold mt-5">Billing Address</div>
                           <div>{record.billing_address}</div>
                        </div>
                     </div>

                     <div className="text-xl col-span-12 mt-24   font-semibold text-center mb-10">
                Products
                     </div>

                     <table className="w-full bg-black-100  bg-gray-100 !text-center py-5  !rounded-xl ">
                        <tr className="font-semibold">
                           <td className=" border-b pb-5">Title</td>
                           <td className="  border-b pb-5 hidden sm:block">Variant</td>
                           <td className="  border-b pb-5">Qty</td>
                           <td className="  border-b pb-5">Price</td>
                        </tr>
                        {record.products.map((x, i) => (
                           <tr
                              key={i}
                              className="h-20 !border-b !border-black hover:bg-gray-50 "
                           >
                              <td className="border-b font-semibold">
                                 <Link href={"/" + x.seo}>{x.title}</Link>
                                 <span className="block sm:hidden mt-3">
                                    {getVariant(x.selectedVariants)}
                                 </span>
                              </td>
                              <td className="border-b hidden sm:block">
                                 {getVariant(x.selectedVariants)}
                              </td>
                              <td className="border-b">{x.qty}</td>
                              <td className="border-b">
                                 <Price data={x.price * x.qty} />
                              </td>
                           </tr>
                        ))}
                        <tr>
                           <td className="hidden sm:block"> </td>
                           <td className="hidden sm:block"> </td>
                           <td className="font-semibold">
                              <br />
                    Cargo Price:
                              <br />
                    Total Price:
                           </td>
                           <td className="font-bold">
                              <br />
                              <Price data={record.cargo_price} />
                              <br />
                              <Price
                                 data={
                                    Number(record.total_price) + Number(record.cargo_price)
                                 }
                              />
                           </td>
                        </tr>
                     </table>
                  </div>
               ),
               rowExpandable: (record) => record.name !== "Not Expandable",
            }}
         />
      </>
   );
};

export default Defaut;

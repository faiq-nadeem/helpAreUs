import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import { Form, Input, Button, InputNumber } from "antd";
import filterRouteLinkGenerate from "./filterRouterLink";
import { filterProducts_r } from "../../../redux/actions";

const Page = () => {
   const { filterProducts } = useSelector(
      ({ filterProducts }) => filterProducts
   );
   const [state, seTstate] = useState(filterProducts);
   const dispatch = useDispatch();

   useEffect(() => {
      seTstate(filterProducts);
   }, [filterProducts]);

   const onChange = (Data) => {
      if (Data) {
         seTstate({
            minPrice: Data.minPrice,
            maxPrice: Data.maxPrice,
         });
         dispatch(
            filterProducts_r({
               ...filterProducts,
               minPrice: Data.minPrice,
               maxPrice: Data.maxPrice,
               skip: 0,
            })
         );
         filterRouteLinkGenerate({
            ...filterProducts,
            minPrice: Data.minPrice,
            maxPrice: Data.maxPrice,
            skip: 0,
         });
      }
   };

   const InputsPrices = () => (
      <Input.Group compact className="w-full">
         <Form.Item name="minPrice" style={{ width: "42%" }}>
            <InputNumber placeholder="Minimum" min={0} className="w-full" />
         </Form.Item>
         <Form.Item name="maxPrice" style={{ width: "42%" }}>
            <InputNumber min={0} placeholder="Maximum" className="w-full" />
         </Form.Item>
         <Button
            style={{ width: "16%" }}
            onClick={() => onChange()}
            type="primary"
            htmlType="submit"
            className="m-0 p-1 bg-brand-color"
         >
            <SearchOutlined />
         </Button>
      </Input.Group>
   );

   return (
      <>
         <div className="float-left w-full   my-3">
            <h6 className="mt-4 ">Price </h6>
            <Form
               onFinish={onChange}
               fields={Object.entries(state).map(([name, value]) => ({
                  name,
                  value,
               }))}
            >
               <InputsPrices className="w-full bg-brand-color" />
            </Form>
         </div>
      </>
   );
};

export default Page;

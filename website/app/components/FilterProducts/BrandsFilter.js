import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Checkbox, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import filterRouteLinkGenerate from "./filterRouterLink";

import { filterProducts_r } from "../../../redux/actions";

const Page = () => {
   const { brands } = useSelector(({ brands }) => brands);
   const { filterProducts } = useSelector(
      ({ filterProducts }) => filterProducts
   );
   const [state, seTstate] = useState({ brands: [], allData: [] });
   const dispatch = useDispatch();

   const getBrands = () => {
      const dataManipulate = [];
      for (const i in brands) {
         dataManipulate.push({
            label: brands[i].title,
            value: brands[i]._id,
         });
      }
      seTstate({ ...state, brands: dataManipulate, allData: dataManipulate });
   };

   useEffect(() => {
      getBrands();
   }, []);

   function onChange(checkedValues) {
      dispatch(
         filterProducts_r({ ...filterProducts, brands: checkedValues, skip: 0 })
      );
      filterRouteLinkGenerate({
         ...filterProducts,
         brands: checkedValues,
         skip: 0,
      });
   }

   const onChangeSearch = (e) => {
      const filterData = state.allData.filter(
         (val) =>
            val.label.toLowerCase().search(e.target.value.toLowerCase()) !== -1
      );
      seTstate({ ...state, brands: filterData });
   };

   return (
      <>
         <Input
            placeholder="Brands..."
            onChange={onChangeSearch}
            suffix={<SearchOutlined />}
         />
         <div className="BrandsFilter rounded-bottom">
            <Checkbox.Group
               options={state.brands}
               value={[...filterProducts.brands]}
               onChange={onChange}
            />
         </div>
      </>
   );
};

export default Page;

import { useSelector, useDispatch } from "react-redux";
import { Tag } from "antd";
import { filterProducts_r } from "../../../redux/actions";
import filterRouteLinkGenerate from "./filterRouterLink";

const Page = () => {
   const { filterProducts } = useSelector(
      ({ filterProducts }) => filterProducts
   );
   const { brands } = useSelector(({ brands }) => brands);
   const { categories } = useSelector(({ categories }) => categories);
   const dispatch = useDispatch();

   const changeBrandsClose = (removedTag) => {
      const tags = filterProducts.brands.filter((tag) => tag !== removedTag);
      dispatch(filterProducts_r({ ...filterProducts, brands: tags, skip: 0 }));
      filterRouteLinkGenerate({ ...filterProducts, brands: tags, skip: 0 });
   };

   const changeCategoriesClose = (removedTag) => {
      const tags = filterProducts.categories.filter((tag) => tag !== removedTag);
      dispatch(
         filterProducts_r({ ...filterProducts, categories: tags, skip: 0 })
      );
      filterRouteLinkGenerate({ ...filterProducts, categories: tags, skip: 0 });
   };

   const changeMinPriceClose = () => {
      dispatch(filterProducts_r({ ...filterProducts, minPrice: null, skip: 0 }));
      filterRouteLinkGenerate({ ...filterProducts, minPrice: null, skip: 0 });
   };

   const changeMaxPriceClose = () => {
      dispatch(filterProducts_r({ ...filterProducts, maxPrice: null, skip: 0 }));
      filterRouteLinkGenerate({ ...filterProducts, maxPrice: null, skip: 0 });
   };

   const changeTextClose = () => {
      dispatch(filterProducts_r({ ...filterProducts, text: "", skip: 0 }));
      filterRouteLinkGenerate({ ...filterProducts, text: "", skip: 0 });
   };

   return (
      <div className="p-5">
         {filterProducts.text != "" ? (
            <span key="text" style={{ display: "inline-block" }}>
               <Tag
                  color="#000"
                  closable
                  onClose={(e) => {
                     e.preventDefault();
                     changeTextClose();
                  }}
               >
            Text: {filterProducts.text}
               </Tag>
            </span>
         ) : (
            ""
         )}

         {filterProducts.brands.map((val) => (
            <span key={val} style={{ display: "inline-block" }}>
               <Tag
                  color="#000"
                  closable
                  onClose={(e) => {
                     e.preventDefault();
                     changeBrandsClose(val);
                  }}
               >
                  {brands.find((find) => find._id == val).title}
               </Tag>
            </span>
         ))}

         {filterProducts.minPrice > 0 ? (
            <span key="minprice" style={{ display: "inline-block" }}>
               <Tag
                  color="#000"
                  closable
                  onClose={(e) => {
                     e.preventDefault();
                     changeMinPriceClose();
                  }}
               >
            Min Price: {filterProducts.minPrice}
               </Tag>
            </span>
         ) : (
            ""
         )}
         {filterProducts.maxPrice > 0 ? (
            <span key="maxprice" style={{ display: "inline-block" }}>
               <Tag
                  color="#000"
                  closable
                  onClose={(e) => {
                     e.preventDefault();
                     changeMaxPriceClose();
                  }}
               >
            Max Price: {filterProducts.maxPrice}
               </Tag>
            </span>
         ) : (
            ""
         )}

         {filterProducts.categories.map((val) => (
            <span key={val} style={{ display: "inline-block" }}>
               <Tag
                  color="#000"
                  closable
                  onClose={(e) => {
                     e.preventDefault();
                     changeCategoriesClose(val);
                  }}
               >
                  {categories.find((find) => find._id == val).title}
               </Tag>
            </span>
         ))}
      </div>
   );
};

export default Page;

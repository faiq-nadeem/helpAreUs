import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductCard from "../ProductCard";
import filterRouteLinkGenerate from "./filterRouterLink";
import axios from "axios";
import { filterProducts_r } from "../../../redux/actions";
import InfiniteScroll from "react-infinite-scroll-component";
import CircularProgress from "../../components/CircularProgress";
import { API_URL } from "../../../../config";

const Page = () => {
   const { filterProducts } = useSelector(
      ({ filterProducts }) => filterProducts
   );
   const [products, seTproducts] = useState([]);
   const [hasMore, seThasMore] = useState(null);
   const dispatch = useDispatch();

   const getProducts = () => {
      axios
         .post(`${API_URL}/productspublic`, filterProducts)
         .then((res) => {
            if (res.data.length > 0) {
               // seTproducts([...products, ...res.data])

               if (filterProducts.skip == 0) {
                  seTproducts(res.data);
                  if (res.data.length == 12) {
                     seThasMore(true);
                  } else {
                     seThasMore(false);
                  }

               } else {
                  seTproducts([...products, ...res.data]);
                  seThasMore(false);

               }

            }
            if (res.data.length == 0 && filterProducts.skip == 0) {
               seTproducts([]);
               seThasMore(false);
            }


         })
         .catch((err) => console.log(err));
   };

   useEffect(() => {
      getProducts();
   }, [filterProducts]);

   const fetchMoreData = () => {
      dispatch(
         filterProducts_r({
            ...filterProducts,
            skip: filterProducts.skip + filterProducts.limit,
            limit: filterProducts.limit,
         })
      );
      filterRouteLinkGenerate({
         ...filterProducts,
         skip: filterProducts.skip + filterProducts.limit,
         limit: filterProducts.limit,
      });
   };
   return (
      <>
         <div className="container  ">
            <InfiniteScroll
               dataLength={products.length}
               next={fetchMoreData}
               hasMore={hasMore}
               loader={
                  <div className="col-span-12  ">
                     <CircularProgress />
                  </div>
               }
               className="grid grid-cols-12 pb-16"
            >
               {products &&
                  products.map((data, i) => (
                     <ProductCard
                        key={i}
                        data={data}
                        className=" xl:col-span-3 lg:col-span-4 rounded-lg col-span-6 m-2 md:m-3 bg-white  group  overflow-hidden  shadow-xl hover:shadow-2xl pb-0"
                     />
                  ))}
            </InfiniteScroll>
         </div>
      </>
   );
};

export default Page;

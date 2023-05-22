import router from "next/router";

const filterRouteLinkGenerate = (filterProducts) => {
   const urlBrands =
    filterProducts.brands.length > 0 ? `&brands=${filterProducts.brands}` : "";
   const urlCategory =
    filterProducts.categories.length > 0
       ? `&categories=${filterProducts.categories}`
       : "";
   const urlMinPrice =
    filterProducts.minPrice > 0 ? `&minprice=${filterProducts.minPrice}` : "";
   const urlMaxPrice =
    filterProducts.maxPrice > 0 ? `&maxprice=${filterProducts.maxPrice}` : "";
   const urlText =
    filterProducts.text != "" ? `&text=${filterProducts.text}` : "";

   const totalUrl =
    urlText + urlBrands + urlCategory + urlMinPrice + urlMaxPrice;
   router.push({}, `/search?${totalUrl}`, { shallow: true });
};

export default filterRouteLinkGenerate;

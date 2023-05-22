export default {
   getDiscount: (data) => {
      if (data.variant_products.length > 0) {
         const discount_variants = [];
         data.variant_products.map((x) => {
            if (x.price < x.before_price) {
               discount_variants.push(
                  ((x.before_price - x.price) / x.before_price) * 100
               );
            }
         });

         return discount_variants.sort(function (a, b) {
            return b - a;
         })[0];
      } else {
         if (data.price < data.before_price) {
            return ((data.before_price - data.price) / data.before_price) * 100;
         }
      }
   },

   filter_array_in_obj: (arr, criteria) => {
      return arr.filter(function (obj) {
         return Object.keys(criteria).every(function (c) {
            return obj[c] == criteria[c];
         });
      });
   },

   search_array_object_tree: (termx, dataAllx) => {
      const dfs = (node, term, foundIDS) => {
      // Implement your search functionality

         let isMatching =
        node.title &&
        node.title.toLowerCase().search(term.toLowerCase()) !== -1;

         if (Array.isArray(node.children)) {
            node.children.forEach((child) => {
               const hasMatchingChild = dfs(child, term, foundIDS);
               isMatching = isMatching || hasMatchingChild;
            });
         }

         // We will add any item if it matches our search term or if it has a children that matches our term
         if (isMatching && node.title) {
            foundIDS.push(node.title);
         }

         return isMatching;
      };

      const filter = (data, matchedIDS) => {
         return data
            .filter((item) => matchedIDS.indexOf(item.title) > -1)
            .map((item) => ({
               ...item,
               children: item.children ? filter(item.children, matchedIDS) : [],
            }));
      };

      const data = dataAllx;

      const dataNode = {
         children: data,
      };

      const matchedIDS = [];
      // find all items IDs that matches our search (or their children does)
      dfs(dataNode, termx, matchedIDS);

      // filter the original data so that only matching items (and their fathers if they have) are returned
      return filter(data, matchedIDS);
   },

   replaceUrlPermissions: (data) => {
      return data.replace("/", "").replace("[", "").replace("]", "");
   },

   getCategoriesTree: (data, parrent = null) => {
      const nest = (items, _id = parrent, link = "categories_id") => {
         return items
            .filter((item) => item[link] === _id)
            .map((item) => ({ ...item, children: nest(items, item._id) }));
      };

      const clean = (obj) => {
         if (Object(obj) !== obj) return obj; // primitives are kept
         obj = Array.isArray(obj)
            ? obj.map(clean).filter((v) => v !== undefined)
            : Object.fromEntries(
               Object.entries(obj)
                  .map(([k, v]) => [k, clean(v)])
                  .filter(([_, v]) => v !== undefined)
            );
         return Object.keys(obj).length ? obj : undefined;
      };
      return clean(nest(data));
   },
   selectCategoriesFilterData: (datas) => {
      if (datas.length > 0) {
         const data = Object.entries(datas).map(([x, y]) => y._id);
         return data;
      }
   },

   getCategoriesTreeOptions: (data, option = false) => {
      const nest = (items, _id = null, link = "categories_id") => {
         return items
            .filter((item) => item[link] === _id)
            .map((item) => ({
               ...item,
               value: item._id,
               key: item._id,
               children: nest(items, item._id),
               disabled:
            nest(items, item._id).length > 0 && option === true ? true : false,
            })).sort(function (a, b) {
               return a.order - b.order;
            });
      };

      const clean = (obj) => {
         if (Object(obj) !== obj) return obj; // primitives are kept
         obj = Array.isArray(obj)
            ? obj.map(clean).filter((v) => v !== undefined)
            : Object.fromEntries(
               Object.entries(obj)
                  .map(([k, v]) => [k, clean(v)])
                  .filter(([_, v]) => v !== undefined)
            );
         return Object.keys(obj).length ? obj : undefined;
      };

      const firstdata = clean(nest(data));
      return firstdata;
   },
};

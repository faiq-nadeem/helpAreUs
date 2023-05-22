import { wrapper } from "../redux/store";

import "../public/global.scss";


import LocaleProvider from "../app/core/LocaleProvider";
import AppLayout from "../app/core/Layout";
import {
   getBrands_r,
   getCategories_r,
   getTopmenu_r,
   settings_r,
} from "../redux/actions";



const HomeApp = (props) => {
   const { Component, pageProps } = props;

   return (
      <>
         <LocaleProvider>
            <AppLayout>
               <Component {...pageProps} />
            </AppLayout>
         </LocaleProvider>
      </>
   );
};

HomeApp.getInitialProps = wrapper.getInitialPageProps((store) => async () => {
   await store.dispatch(getBrands_r());
   await store.dispatch(settings_r());
   await store.dispatch(getCategories_r());
   await store.dispatch(getTopmenu_r());
});



export default wrapper.withRedux(HomeApp);

import Link from "next/link";

import { useSelector } from "react-redux";
const Defaut = () => {
   const { user } = useSelector((state) => state.login);
   return (
      <>
         <div className="text-xl font-semibold col-span-12 text-brand-color  mb-5 mt-5 sm:mt-0">
            {user.name}{" "}
         </div>
         <Link href="/profile">
            <a className="w-full py-3 border-b float-left hover:pl-1  transform-all">
          Profile
            </a>
         </Link>
         <Link href="/profile/address">
            <a className="w-full py-3 border-b float-left hover:pl-1  transform-all">
          Addreses
            </a>
         </Link>
         <Link href="/profile/orders">
            <a className="w-full py-3 border-b float-left hover:pl-1  transform-all">
          Orders
            </a>
         </Link>
      </>
   );
};

export default Defaut;

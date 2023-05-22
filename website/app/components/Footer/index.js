import { useSelector } from "react-redux";
import { Divider } from "antd";
import Link from "next/link";
import { IMG_URL } from "../../../../config";
import Image from "next/image";
const Default = ({ footerMenu }) => {
   const { settings } = useSelector(({ settings }) => settings);

   return (
      <div className="bg-black py-10">
         <div className=" container-custom grid grid-cols-12">
            <div className="md:col-span-3 order-12  md:order-1  sm:py-0 py-5 col-span-12 !text-white">
               <Image loader={({ src }) => src} src={`${IMG_URL + settings.image}`} className="invert w-32 " width="128" height="31" alt="Logo" />
               <h4 className="text-white text-lg mt-2">{settings.company}</h4>
               <p>{settings.description}</p>
               <Image className="mt-5 w-full" src="/images/stripepayfooter.png" width="305" height="97" alt="stripe payment" />
            </div>

            <ul className=" grid grid-cols-2 md:grid-cols-4 col-span-12  sm:col-span-9 ml-0 sm:ml-20 order-1 md:order-5  ">
               {footerMenu &&
            footerMenu.map((val) => (
               <li key={val.title} className="mt-2 text-left">
                  {!val.children ? (
                     <Link href={val.link ? val.link : "/content/" + val.seo}>
                        <a className="text-white text-2xl">{val.title}</a>
                     </Link>
                  ) : (
                     <>

                        <span className="text-white text-3xl">{val.title}</span>

                        <ul key={val.title}>
                           {val?.children.map((val2) => (
                              <li key={val2.title} className=" my-1 sm:my-4  ">
                                 {!val2.children ? (
                                    <Link
                                       href={
                                          val2.link ? val2.link : "/content/" + val2.seo
                                       }
                                    >
                                       <a className="text-white">- {val2.title}</a>
                                    </Link>
                                 ) : (
                                    <>
                                       <Link href="#">
                                          <a className="text-white ">- {val2.title}</a>
                                       </Link>
                                       <ul key={val2.title}>
                                          {val2?.children.map((val3) => (
                                             <li key={val3.title}>
                                                <Link
                                                   href={
                                                      val3.link
                                                         ? val3.link
                                                         : "/content/" + val3.seo
                                                   }
                                                >
                                                   <a className="text-white ">
                                        -- {val3.title}
                                                   </a>
                                                </Link>
                                             </li>
                                          ))}
                                       </ul>
                                    </>
                                 )}
                              </li>
                           ))}
                        </ul>
                     </>
                  )}
               </li>
            ))}
            </ul>

            <Divider className="my-3 order-9 " />
            <div className="  col-span-12 text-center order-10  ">
               <div className=" text-white  grid grid-cols-2 md:flex items-center flex-row justify-around   md:grid-cols-3 lg:grid-cols-6">
                  {settings.address
                     ? settings.address.map((val) => (
                        <div key={val.name}>
                           <h5 className="text-xl text-white mt-2">{val.name}</h5>
                           <div className="mb-2">{val.value}</div>
                        </div>
                     ))
                     : ""}

                  {settings.phone
                     ? settings.phone.map((val) => (
                        <div key={val.name}>
                           <h5 className="text-xl text-white mt-2">{val.name}</h5>
                           <div className="mb-2  text-white">{val.value}</div>
                        </div>
                     ))
                     : ""}
                  {settings.email
                     ? settings.email.map((val) => (
                        <div key={val.name}>
                           <h5 className="text-xl text-white mt-2">{val.name}</h5>
                           <div className="mb-2  text-white">{val.value}</div>
                        </div>
                     ))
                     : ""}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Default;

import axios from "axios";
import { useState, useEffect } from "react";
import { message, Button, Input, Select, Checkbox, Form, Drawer } from "antd";
import AddressSelect from "./AddressSelect";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../../../config";
import { getBasket_r, updateBasket_r } from "../../../redux/actions";
import { useIntl } from "react-intl";
import AuthService from "../../../util/services/authservice";

const Default = () => {
   const intl = useIntl();

   const { basket } = useSelector((state) => state.basket);
   const { isAuthenticated, user } = useSelector(({ login }) => login);
   const [fields, seTfields] = useState([]);

   const [address, seTaddress] = useState([]);

   const [selectedShippingAddress, seTselectedShippingAddress] = useState(null);
   const [selectedBillingAddress, seTselectedBillingAddress] = useState(null);
   const [billingAdressSame, seTbillingAdressSame] = useState(true);
   const [newAddress, seTnewAddress] = useState({ open: false, id: null });

   const [city, seTcity] = useState([]);
   const [country, seTcountry] = useState([]);
   const [selectedO, seTselectedO] = useState({});
   const [cityOption, seTcityOption] = useState([]);
   const [countryOption, seTcountryOption] = useState([]);
   const [ilceOption, seTilceOption] = useState([]);
   const [semtOption, seTsemtOption] = useState([]);
   const [mahalleOption, seTmahalleOption] = useState([]);

   const [form] = Form.useForm();

   const dispatch = useDispatch();

   const updateAddress = async (newAddresArr) => {
      if (isAuthenticated) {
         await axios
            .post(`${API_URL}/customerspublic/address`, newAddresArr)
            .then(() => {
               setTimeout(() => {
                  getAddress();
                  seTnewAddress({ open: false, id: null });
               }, 500);
            })
            .catch((err) => console.log("err", err));
      } else {
         message.success({ content: "Next Stage :)", duration: 3 });
         seTnewAddress({ open: false, id: null });
         seTaddress(newAddresArr);
      }
   };

   const updateBasket = async (post) => {
      if (isAuthenticated) {
         axios.post(`${API_URL}/basket/${basket[0]._id}`, post)
            .then(async () => {
               message.success({
                  content: "Address Selected",
                  duration: 3,
               });
               await dispatch(getBasket_r(user.id));
            })
            .catch((err) => {
               message.error({
                  content: "Some Error, Please Try Again",
                  duration: 3,
               });
               console.log(err);
            });
      } else {
         message.success({ content: "Next Stage :)", duration: 3 });
         dispatch(updateBasket_r([post]));
      }
   };

   const getCity = () => {
      axios.get(`${API_URL}/turkey`).then((getData) => {
         const dataManipulate = [];
         for (const i in getData.data) {
            dataManipulate.push({
               label: getData.data[i].Il,
               value: getData.data[i].Il,
            });
         }
         seTcityOption(dataManipulate);
         seTcity(getData.data);
      });
   };

   const getCountry = () => {
      axios.get(`${API_URL}/country`).then((getData) => {
         const dataManipulate = [];
         for (const i in getData.data) {
            dataManipulate.push({
               label: getData.data[i].name,
               value: getData.data[i].name,
            });
         }
         seTcountryOption(dataManipulate);
         seTcountry(getData.data);
      });
   };

   const getAddress = () => {
      if (isAuthenticated) {
         AuthService.isAuthenticated().then(async (auth) => {
            await seTaddress(auth.user.address);
         });
      }
   };

   const onSubmitAddress = async (Data) => {
      if (newAddress.id) {
         const newAddresArr = address.filter(
            (x) => JSON.stringify(x) !== newAddress.id
         );
         newAddresArr.push(Data);
         newAddresArr.reverse();

         updateAddress(newAddresArr);

      } else {
         const newAddresArr = address;
         newAddresArr.push(Data);
         newAddresArr.reverse();

         updateAddress(newAddresArr);
      }
   };

   const onFinishFailedAddress = (errorInfo) => {
      console.log(errorInfo);
   };

   const getSelectedAddress = () => {
      if (basket.length > 0) {

         if (basket[0].shipping_address) {
            seTselectedShippingAddress(JSON.stringify(basket[0].shipping_address));
         }

         if (basket[0].billing_address) {
            seTselectedBillingAddress(JSON.stringify(basket[0].billing_address));
         }

         const stringifBillingAddres = JSON.stringify(basket[0].billing_address);
         const stringifShippingAddres = JSON.stringify(basket[0].shipping_address);

         if (stringifBillingAddres != stringifShippingAddres) {
            seTbillingAdressSame(false);
         }

      }
   };

   useEffect(() => {
      getCountry();
      getAddress();
      getSelectedAddress();
   }, [basket[0]]);

   const onChanheShppingAddress = (data) => {

      if (billingAdressSame) {
         seTselectedShippingAddress(data);
         seTselectedBillingAddress(data);

         const newBasketPost = {
            created_user: {
               name: user.name,
               id: user.id,
            },
            customer_id: user.id,
            products: basket[0].products,
            cargoes_id: basket[0].cargoes_id,
            total_price: basket[0].total_price,
            total_discount: basket[0].total_discount,
            cargo_price: basket[0].cargo_price,
            cargo_price_discount: basket[0].cargo_price_discount,
            shipping_address: JSON.parse(data),
            billing_address: JSON.parse(data),
         };

         updateBasket(newBasketPost);

      } else {
         seTselectedShippingAddress(data);
         const newBasketPost = {
            created_user: {
               name: user.name,
               id: user.id,
            },
            customer_id: user.id,
            products: basket[0].products,
            cargoes_id: basket[0].cargoes_id,
            total_price: basket[0].total_price,
            total_discount: basket[0].total_discount,
            cargo_price: basket[0].cargo_price,
            cargo_price_discount: basket[0].cargo_price_discount,
            shipping_address: JSON.parse(data),
         };

         updateBasket(newBasketPost);

      }
   };

   const onChanheBillingAddress = (data) => {
      seTselectedBillingAddress(data);

      const newBasketPost = {
         created_user: {
            name: user.name,
            id: user.id,
         },
         customer_id: user.id,
         products: basket[0].products,
         cargoes_id: basket[0].cargoes_id,
         total_price: basket[0].total_price,
         total_discount: basket[0].total_discount,
         cargo_price: basket[0].cargo_price,
         cargo_price_discount: basket[0].cargo_price_discount,
         shipping_address: JSON.parse(selectedShippingAddress),
         billing_address: JSON.parse(data),
      };
      updateBasket(newBasketPost);
   };
   return (
      <>
         <div className="w-full  px-4 pb-10 grid grid-cols-12 gap-x-5">
            <Button
               className="float-left col-span-12 font-semibold text-sm w-full py-7 text-center h-full mb-5 "
               onClick={() => {
                  seTfields(
                     Object.entries(address[0] ? address[0] : {}).map(([name]) => ({
                        name,
                        value: null,
                     }))
                  );
                  seTnewAddress({ ...newAddress, open: !newAddress.open });
               }}
            >
          New Address
            </Button>

            <div className="col-span-12 float-left mt-10 -mb-16 z-10  text-right">
               <Checkbox
                  className=" w-auto float-right "
                  onChange={(vall) => {
                     seTbillingAdressSame(!billingAdressSame);
                     if (vall.target.checked) {
                        onChanheBillingAddress(selectedShippingAddress);
                        seTselectedBillingAddress(selectedShippingAddress);
                     }
                  }}
                  checked={billingAdressSame}
               >
            Billing address is same
               </Checkbox>
            </div>
            <div
               className={
                  billingAdressSame ? "col-span-12" : "col-span-12 sm:col-span-6"
               }
            >
               <div className="text-lg  font-semibold w-full sm:mt-10 mt-16">
            Shipping Address
               </div>

               <div className="w-full ">
                  {address &&
              address.map((x, i) => (
                 <AddressSelect
                    key={i}
                    Data={x}
                    seTnewAddress={seTnewAddress}
                    seTfields={seTfields}
                    newAddress={newAddress}
                    selectedShippingAddress={selectedShippingAddress}
                    onChanheShppingAddress={onChanheShppingAddress}
                 />
              ))}
               </div>
            </div>
            <div
               className={billingAdressSame ? "hidden" : "col-span-12 sm:col-span-6"}
            >
               <div className="text-lg font-semibold w-full   sm:mt-10 mt-16">
            Billing Address{" "}
               </div>
               <div className="w-full">
                  {address &&
              address.map((x, i) => (
                 <AddressSelect
                    key={i}
                    Data={x}
                    seTnewAddress={seTnewAddress}
                    seTfields={seTfields}
                    newAddress={newAddress}
                    selectedBillingAddress={selectedBillingAddress}
                    onChanheBillingAddress={onChanheBillingAddress}
                 />
              ))}
               </div>
            </div>

            <Drawer
               title="Address"
               placement="left"
               onClose={() => {
                  seTnewAddress({ ...newAddress, open: !newAddress.open });
               }}
               visible={newAddress.open}
            >
               <Form
                  form={form}
                  onFinishFailed={onFinishFailedAddress}
                  onFinish={onSubmitAddress}
                  fields={fields}
                  scrollToFirstError
               >
                  <Form.Item
                     className="float-left  w-full mx-0 px-0"
                     name="name"
                     fieldKey="name"
                     rules={[{ required: true, message: "Missing Area" }]}
                  >
                     <Input
                        placeholder={intl.messages["app.pages.customers.addressName"]}
                        autocomplete="chrome-off"
                     />
                  </Form.Item>

                  <Form.Item
                     name="type"
                     className="float-left w-full mx-0 px-0"
                     fieldKey="type"
                  >
                     <Select
                        defaultValue={true}
                        options={[
                           { label: "Billing Address", value: true },
                           { label: "Shipping Address", value: false },
                        ]}
                        placeholder="Select Address Type"
                     />
                  </Form.Item>

                  <Form.Item
                     name="country_id"
                     className="float-left w-full mx-0 px-0"
                     fieldKey="country_id"
                  >
                     <Select
                        autoComplete="none"
                        showSearch
                        options={countryOption}
                        placeholder="Search to Country"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                           option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(selected) => {
                           if (selected == "Turkey") {
                              getCity();
                           } else {
                              const citydata = country.filter((x) => x.name === selected);
                              const dataManipulate = [];

                              for (const i in citydata[0].states) {
                                 dataManipulate.push({
                                    label: citydata[0].states[i].name,
                                    value: citydata[0].states[i].name,
                                 });
                              }

                              seTcityOption(dataManipulate);
                           }
                           seTselectedO({ ...selectedO, selectedCountry: selected });
                        }}
                     />
                  </Form.Item>

                  <Form.Item
                     className="float-left w-full  mx-0 px-0"
                     name="city_id"
                     fieldKey="city_id"
                     rules={[{ required: true, message: "Missing Area" }]}
                  >
                     <Select
                        autoComplete="none"
                        showSearch
                        options={cityOption}
                        placeholder={intl.messages["app.pages.customers.addressCity"]}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                           option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(selected) => {
                           if (selectedO.selectedCountry == "Turkey") {
                              const ilce = city.filter((x) => x.Il === selected);
                              const dataManipulate = [];
                              for (const i in ilce[0].Ilce) {
                                 dataManipulate.push({
                                    label: ilce[0].Ilce[i].Ilce,
                                    value: ilce[0].Ilce[i].Ilce,
                                 });
                              }
                              seTselectedO({ ...selectedO, selectedCity: selected });
                              seTilceOption({
                                 option: dataManipulate,
                                 data: ilce[0].Ilce,
                              });
                           }
                        }}
                     />
                  </Form.Item>

                  <Form.Item
                     className="float-left w-full  mx-0 px-0"
                     name="town_id"
                     fieldKey="town_id"
                     rules={[{ required: true, message: "Missing Area" }]}
                  >
                     {selectedO.selectedCountry == "Turkey" ? (
                        <Select
                           showSearch
                           options={ilceOption.option}
                           name="town_id"
                           placeholder={intl.messages["app.pages.customers.addressTown"]}
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           onChange={(selected) => {
                              const data = ilceOption.data.filter(
                                 (x) => x.Ilce === selected
                              );
                              const dataManipulate = [];
                              for (const i in data[0].Semt) {
                                 dataManipulate.push({
                                    label: data[0].Semt[i].Semt,
                                    value: data[0].Semt[i].Semt,
                                 });
                              }
                              seTselectedO({ ...selectedO, selectedIlce: selected });
                              seTsemtOption({
                                 option: dataManipulate,
                                 data: data[0].Semt,
                              });
                           }}
                        />
                     ) : (
                        <Input
                           placeholder={intl.messages["app.pages.customers.addressTown"]}
                           autoComplete="none"
                        />
                     )}
                  </Form.Item>

                  <Form.Item
                     className="float-left w-full  mx-0 px-0"
                     name="district_id"
                     fieldKey="district_id"
                     rules={[{ required: true, message: "Missing Area" }]}
                  >
                     {selectedO.selectedCountry == "Turkey" ? (
                        <Select
                           showSearch
                           autoComplete="none"
                           options={semtOption.option}
                           placeholder={
                              intl.messages["app.pages.customers.addressDistrict"]
                           }
                           name="district_id"
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           onChange={(selected) => {
                              const data = semtOption.data.filter(
                                 (x) => x.Semt === selected
                              );
                              const dataManipulate = [];
                              for (const i in data[0].Mahalle) {
                                 dataManipulate.push({
                                    label: data[0].Mahalle[i].Mahalle,
                                    value: data[0].Mahalle[i].Mahalle,
                                 });
                              }
                              seTselectedO({ ...selectedO, selectedSemt: selected });
                              seTmahalleOption({
                                 option: dataManipulate,
                                 data: data[0].Mahalle,
                              });
                           }}
                        />
                     ) : (
                        <Input
                           placeholder={
                              intl.messages["app.pages.customers.addressDistrict"]
                           }
                           autoComplete="none"
                        />
                     )}
                  </Form.Item>

                  <Form.Item
                     name="village_id"
                     className="float-left w-full mx-0 px-0"
                     fieldKey="village_id"
                     autoComplete="none"
                     rules={[{ required: true, message: "Missing Area" }]}
                  >
                     {selectedO.selectedCountry == "Turkey" ? (
                        <Select
                           showSearch
                           options={mahalleOption.option}
                           placeholder={
                              intl.messages["app.pages.customers.addressNeighbour"]
                           }
                           name="village_id"
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           onChange={(selected) => {
                              seTselectedO({ ...selectedO, selectedMahalle: selected });
                           }}
                        />
                     ) : (
                        <Input
                           placeholder={
                              intl.messages["app.pages.customers.addressNeighbour"]
                           }
                        />
                     )}
                  </Form.Item>
                  <Form.Item
                     className="float-left w-full  mx-0 px-0"
                     name="address"
                     fieldKey="address"
                     rules={[{ required: true, message: "Missing Area" }]}
                     autoComplete="none"
                  >
                     <Input.TextArea
                        rows={3}
                        placeholder={intl.messages["app.pages.customers.addressFull"]}
                     />
                  </Form.Item>
                  <Button htmlType="submit" className="w-full p-3 h-auto">
              Save
                  </Button>
               </Form>
            </Drawer>
         </div>
      </>
   );
};

export default Default;

import { useEffect, useState } from "react";
import { Button, Form, Input, message, Select, Drawer } from "antd";
import { useIntl } from "react-intl";

import AddressSelect from "../Basket/AddressSelect";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../config";

import AuthService from "../../../util/services/authservice";
import axios from "axios";

const Defaut = () => {
   const intl = useIntl();
   const { isAuthenticated, user } = useSelector(({ login }) => login);
   const [fields, seTfields] = useState(
      Object.entries(user.address).map(([name, value]) => ({ name, value }))
   );
   const [address, seTaddress] = useState([]);
   const [newAddress, seTnewAddress] = useState({ open: false, id: null });
   const [city, seTcity] = useState([]);
   const [country, seTcountry] = useState([]);
   const [selectedO, seTselectedO] = useState({});
   const [cityOption, seTcityOption] = useState([]);
   const [countryOption, seTcountryOption] = useState([]);
   const [ilceOption, seTilceOption] = useState([]);
   const [semtOption, seTsemtOption] = useState([]);
   const [mahalleOption, seTmahalleOption] = useState([]);

   function getDataFc() {
      if (user.id) {
         axios.get(`${API_URL}/customers/${user.id}`).then((res) => {
            const data = res.data;
            data["password"] = "";
            seTfields(
               Object.entries(data.address).map(([name, value]) => ({ name, value }))
            );
            seTaddress(data.address);
         });
      }
   }
   useEffect(() => {
      getDataFc();
      getCountry();
      getCity();
   }, [user]);

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

         if (isAuthenticated) {
            await axios
               .post(`${API_URL}/customerspublic/address`, newAddresArr)
               .then(() => {
                  getAddress();
                  seTnewAddress({ open: false, id: null });
               })
               .catch((err) => console.log("err", err));
         } else {
            message.success({ content: "Next Stage :)", duration: 3 });
            seTnewAddress({ open: false, id: null });
            seTaddress(newAddresArr);
         }
      } else {
         const newAddresArr = address;
         newAddresArr.push(Data);
         newAddresArr.reverse();

         axios
            .post(`${API_URL}/customerspublic/address`, newAddresArr)
            .then(() => {
               setTimeout(() => {
                  getAddress();
                  seTnewAddress({ open: false, id: null });
               }, 500);
            })
            .catch((err) => console.log("err", err));
      }
   };

   return (
      <div className="w-full">
         <Button
            className="float-left font-semibold text-sm w-full py-7 text-center h-auto   mb-5 "
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
         {address &&
        address.map((x, i) => (
           <AddressSelect
              key={i}
              Data={x}
              seTnewAddress={seTnewAddress}
              seTfields={seTfields}
              newAddress={newAddress}
           />
        ))}

         <Drawer
            title="Address"
            placement="right"
            onClose={() => {
               seTnewAddress({ ...newAddress, open: !newAddress.open });
            }}
            visible={newAddress.open}
         >
            <Form
               onFinish={onSubmitAddress}
               fields={fields}
               scrollToFirstError
               layout="vertical"
            >
               <Form.Item
                  className="float-left  w-full mx-0 px-0"
                  name="name"
                  label={intl.messages["app.pages.customers.addressName"]}
                  fieldKey="name"
                  rules={[{ required: true, message: "Missing Area" }]}
               >
                  <Input autocomplete="chrome-off" />
               </Form.Item>

               <Form.Item
                  name="type"
                  className="float-left  w-full  mx-0 px-0"
                  label="Type"
                  fieldKey="type"
               >
                  <Select
                     defaultValue={true}
                     options={[
                        { label: "Billing Address", value: true },
                        { label: "Shipping Address", value: false },
                     ]}
                     placeholder="Select Address Type"
                     autoComplete="none"
                  />
               </Form.Item>

               <Form.Item
                  name="country_id"
                  className="float-left  w-full  mx-0 px-0"
                  label="Country"
                  fieldKey="country_id"
               >
                  <Select
                     showSearch
                     options={countryOption}
                     autoComplete="none"
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
                  label="City"
                  rules={[{ required: true, message: "Missing Area" }]}
               >
                  <Select
                     showSearch
                     autoComplete="none"
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
                           seTilceOption({ option: dataManipulate, data: ilce[0].Ilce });
                        }
                     }}
                  />
               </Form.Item>

               <Form.Item
                  className="float-left w-full  mx-0 px-0"
                  name="town_id"
                  label="Town"
                  fieldKey="town_id"
                  rules={[{ required: true, message: "Missing Area" }]}
               >
                  {selectedO.selectedCountry == "Turkey" ? (
                     <Select
                        showSearch
                        autoComplete="none"
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
                           seTsemtOption({ option: dataManipulate, data: data[0].Semt });
                        }}
                     />
                  ) : (
                     <Input
                        placeholder={intl.messages["app.pages.customers.addressTown"]}
                        autocomplete="chrome-off"
                     />
                  )}
               </Form.Item>

               <Form.Item
                  className="float-left w-full  mx-0 px-0"
                  name="district_id"
                  label="District"
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
                        autocomplete="chrome-off"
                     />
                  )}
               </Form.Item>

               <Form.Item
                  name="village_id"
                  className="float-left w-full  mx-0 px-0"
                  label="Village"
                  fieldKey="village_id"
                  rules={[{ required: true, message: "Missing Area" }]}
               >
                  {selectedO.selectedCountry == "Turkey" ? (
                     <Select
                        showSearch
                        autoComplete="none"
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
                        autocomplete="chrome-off"
                     />
                  )}
               </Form.Item>
               <Form.Item
                  className="float-left w-full  mx-0 px-0"
                  name="address"
                  label="Address"
                  fieldKey="address"
                  rules={[{ required: true, message: "Missing Area" }]}
               >
                  <Input.TextArea
                     rows={3}
                     placeholder={intl.messages["app.pages.customers.addressFull"]}
                     autocomplete="chrome-off"
                  />
               </Form.Item>
               <Button htmlType="submit" className="w-full p-3 h-auto">
            Save
               </Button>
            </Form>
         </Drawer>
      </div>
   );
};

export default Defaut;

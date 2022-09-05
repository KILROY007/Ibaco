import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import {Platform} from 'react-native';
import {AddressTypeEnumArray} from '../domain/enumerations/AddressTypeEnum';
import {GenderEnum} from '../domain/enumerations/GenderEnum';
import {ValidationUtils} from '../core/ValidationUtils';
import Geocoder from 'react-native-geocoder';
import {DeleveryAddressTypeEnum} from '../domain/enumerations/DeleveryAddressTypeEnum';
import {CartRepository} from '../domain/repository/CartRepository';
export interface AddOrEditAddressState {
  isLoading: boolean;
  items: any[];
  loadError?: Error;
  error?: Error;
  addressType: any[];
  AddressSelectedIndex: any;
  onSuccess: boolean;
  isConfirmed: boolean;
  addressDetails: any[];
  inputAddress: string;
  inputLocality: string;
  onDeleteSuccess: boolean;
  adressItem: any[];
  gender: string;
  coordinateDelta: any;
  customerId: any[];
  description: any;
  validationError?: Error;
  addressTypeIs: string;
  deliveryMode: Number;
  pickUpAddressItemsIs: any[];
  alertDetails: any;
  coordinate: any;
  userAddress:any;
}

export class AddOrEditAddressViewModel extends BaseViewModel {
  protected state: AddOrEditAddressState;
  public SelectedAddressPinCode;

  constructor(
    private userRepository: UserRepository,
    private validationUtils: ValidationUtils,
    private cartRepository: CartRepository,
  ) {
    super();
    this.state = this.defaultState();
    this.userRepository = userRepository;
    this.validationUtils = validationUtils;
    this.cartRepository = cartRepository;
  }

  protected defaultState() {
    const addressType = AddressTypeEnumArray.getAddressTypeEnumArray();
    return {
      isLoading: false,
      items: [],
      addressType,
      loadError: undefined,
      error: undefined,
      AddressSelectedIndex: Number,
      onSuccess: false,
      onDeleteSuccess: false,
      adressItem: [],
      isConfirmed: false,
      inputAddress: '',
      description:
        'Park Square Colony, Madipakkam, Chennai, Tamil Nadu 600091, India',
      inputLocality: '',
      gender: '',
      addressDetails: [],
      customerId: [],
      validationError: undefined,
      addressTypeIs: '',
      deliveryMode: 1,
      pickUpAddressItemsIs: [],
      alertDetails: undefined,
      userAddress:'',
      coordinate: {latitude: 12.964799, longitude: 80.195023},
      // coordinateDelta: {latitudeDelta: 0.0922, longitudeDelta: 0.0421},
      coordinateDelta: {latitudeDelta: 0.00672, longitudeDelta: 0.00371},

    };
  }

  async getInputItems(isAddress, item?) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      this.SelectedAddressPinCode = this.userRepository.getState().pincode;
      const isDelivery = this.userRepository.getState().isDelivery;
      this.setState({
        ...this.state,
        deliveryMode: isDelivery
          ? DeleveryAddressTypeEnum.DELIVERY
          : DeleveryAddressTypeEnum.PICKUP,
        adressItem: [],
      });
      let gender;
      let items: any = [];
      let adressItems: any = [];
      let pickUpAddressItems: any = [];
      const viewModel: any = [];
      let id: any = [];
      // const loggedInUser = await this.userRepository.getProfileInfo(); // need to remove
      const loggedInUser = await this.getProfileInfo();
      const storeLocation = await this.userRepository.getSources();
      if (loggedInUser.gender === GenderEnum.Male) {
        gender = 'Male';
      } else if (loggedInUser.gender === GenderEnum.Female) {
        gender = 'Female';
      } else if (loggedInUser.gender === GenderEnum.Others) {
        gender = 'Others';
      } else {
        gender = 'Not Specified';
      }
      this.set('gender', gender);

      if (isAddress) {
        const streetValue: any = [];
        let actualString;
        let addressvalueIs;
        const values = {
          address: '',
          locality: '',
          city: '',
          pinCode: '',
        };
        if (loggedInUser.addresses && item != undefined) {
          values.locality = `${loggedInUser.addresses[item].street[0]}`;
          values.city = loggedInUser.addresses.length
            ? `${loggedInUser.addresses[item].city}`
            : '';
          values.pinCode = `${loggedInUser.addresses[item].postcode}`;
          addressvalueIs =
            loggedInUser.addresses[item].custom_attributes[0].value - 1;
          for (const address of this.state.addressType) {
            address.isActive = address.id === addressvalueIs ? true : false;
          }
          if (loggedInUser.addresses[item].street.length > 2) {
            for (
              let index = 1;
              index < loggedInUser.addresses[item].street.length;
              index++
            ) {
              streetValue.push(loggedInUser.addresses[item].street[index]);
            }
            actualString = streetValue.toString();
            values.address = `${actualString}`;
          } else {
            values.address = `${loggedInUser.addresses[item].street[1]}`;
          }
        } else if (loggedInUser.addresses && item == undefined) {
        }
        items = [
          {label: 'PinCode', value: values.pinCode},
          {label: 'Address', value: values.address},
          {label: 'Locality', value: values.locality},
          {label: 'City', value: values.city},
       
        ];
        this.setState({
          ...this.state,
          description: values.address,
        });
      } else {
        const values = {
          firstName: '',
          lastName: '',
          ph: '',
          email: '',
        };
        const addressValue = {
          address: '',
          locality: '',
          city: '',
          pinCode: '',
          region: '',
          country_id: '',
          custom_attributes: '',
        };
        const pickUpAddressValue = {
          city: '',
          street: '',
          pinCode: '',
          region: '',
          country_id: '',
          name: '',
        };

        if (loggedInUser) {
          values.firstName = `${loggedInUser.firstname}`;
          values.lastName = `${loggedInUser.lastname}`;
          values.ph = loggedInUser.custom_attributes[0].value;
          values.email = loggedInUser.email;

          if (loggedInUser.addresses && loggedInUser.addresses.length > 0) {
            const unique = loggedInUser.addresses.filter(
              (item, index, arr) =>
                arr.findIndex(
                  obj =>
                    obj.street[0] === item.street[0] &&
                    obj.street[1] === item.street[1] &&
                    obj.postcode === item.postcode &&
                    obj.custom_attributes[0].value ===
                      item.custom_attributes[0].value
                ) == index,
            );
            unique.map((address, key) => {
              let streetValue: any = [];
              let actualString;

              addressValue.custom_attributes = `${
                address.custom_attributes[0].value
              }`;
              addressValue.locality = `${address.street[0]}`;
              addressValue.city = `${address.city}`;
              addressValue.pinCode = `${address.postcode}`;
              if (address.street.length > 2) {
                for (let index = 1; index < address.street.length; index++) {
                  streetValue.push(address.street[index]);
                }
                actualString = streetValue.toString();

                addressValue.address = `${actualString}`;
              } else {
                addressValue.address = `${
                  address.street[1]
                    ? address.street[1]
                    : 'address not mentioned'
                }`;
              }
              addressValue.region = `${address.region.region}`;
              addressValue.country_id = `${address.country_id}`;
              adressItems = [
                {label: 'Locality', value: addressValue.locality},
                {label: 'Street', value: addressValue.address},
                {label: 'City', value: addressValue.city},
                {label: 'Region', value: addressValue.region},
                {label: 'Country_id', value: addressValue.country_id},
                {label: 'PinCode', value: addressValue.pinCode},
                {label: 'AddressType', value: addressValue.custom_attributes},
              ];
              this.state.adressItem.push(adressItems);
              id.push(address.id);
            });
          }
          if (loggedInUser && storeLocation.items.length > 0) {
            storeLocation.items.map((pickUpAddress, key) => {
              pickUpAddressValue.street = `${pickUpAddress.street}`;
              pickUpAddressValue.city = `${pickUpAddress.city}`;
              pickUpAddressValue.pinCode = `${pickUpAddress.postcode}`;
              pickUpAddressValue.region = `${pickUpAddress.region}`;
              pickUpAddressValue.country_id = `${pickUpAddress.country_id}`;
              pickUpAddressValue.name = `${pickUpAddress.name}`;

              pickUpAddressItems = [
                {label: 'Street', value: pickUpAddressValue.street},
                {label: 'City', value: pickUpAddressValue.city},
                {label: 'Region', value: pickUpAddressValue.region},
                {label: 'Country_id', value: pickUpAddressValue.country_id},
                {label: 'PinCode', value: pickUpAddressValue.pinCode},
                {label: 'name', value: pickUpAddressValue.name},
              ];
              this.state.pickUpAddressItemsIs.push(pickUpAddressItems);
            });
          }
        }

        items = [
          {label: 'First Name', value: values.firstName},
          {label: 'Last Name', value: values.lastName},
          {label: 'Phone Number', value: values.ph},
          {label: 'Email', value: values.email},
        ];
      }

      for (const input of items) {
        const textInputViewModel = new TextInputViewModel();
        const obj = {
          label: input.label,
          value: input.value,
          isUpdated: isAddress ? true : false,
          key: input,
        };
        textInputViewModel.setState({
          ...obj,
        });
        viewModel.push(textInputViewModel);
      }
      this.setState({
        ...this.state,
        items: viewModel,
        customerId: id,
        isLoading: false,
      });
      if (isAddress) {
        this.getLatLongByPincode();
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public getGenderValue(value) {
    let genderType;
    if (this.state.gender === 'Male') {
      genderType = GenderEnum.Male;
    } else if (this.state.gender === 'Female') {
      genderType = GenderEnum.Female;
    } else {
      genderType = GenderEnum.Others;
    }
    return genderType;
  }
  private isValid() {
    let error;
    let valueIs;
    let actualValue;
    let count = 0;
    this.state.items.map(item => {
      if (this.validationUtils.isEmpty(item.state.value) === true) {
        count += 1;
        if (count >= 2) error = Error(`Please fill up all the fields`);
        else error = Error(`Please enter  ${item.state.label}`);

        this.setState({
          ...this.state,
          validationError: error,
        });
      } else if (item.state.label === 'PinCode') {
        if (this.validationUtils.isValidPincode(item.state.value) === false) {
          error = Error(
            `${item.state.label} field must be number and contain 6 digit`,
          );

          this.setState({
            ...this.state,
            validationError: error,
          });
        }
      }
      if (
        item.state.label === 'First Name' ||
        item.state.label === 'Last Name'
      ) {
        if (this.validationUtils.isNameValid(item.state.value) === false) {
          error = Error(`${item.state.label} should only contain alphabets`);

          this.setState({
            ...this.state,
            validationError: error,
          });
        }
      }
      if (item.state.label === 'Phone Number') {
        if (
          this.validationUtils.isMobileNumberValid(
            item.state.value.replace(/\s/g, ''),
          ) === false
        ) {
          error = Error(
            `${item.state.label} field must be number and contain 10 digit`,
          );

          this.setState({
            ...this.state,
            validationError: error,
          });
        }
      }
    });
  }
  public getAddressType() {
    let typeAddresss;
    this.state.addressType.map(item => {
      if (item.isActive) {
        typeAddresss = String(item.id + 1);
      }
    });
    return typeAddresss;
  }

  public async updateProfile(index, updateKey) {
    try {
      this.isValid();
      if (this.state.validationError) {
        return;
      }
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const loggedInUser = await this.getProfileInfo();
      const customer = {
        id: loggedInUser.id,
        firstname: loggedInUser.firstname,
        lastname: loggedInUser.lastname,
        email: loggedInUser.email,
        website_id: loggedInUser.website_id,
        store_id: loggedInUser.store_id,
        // gender: this.getGenderValue(loggedInUser.gender),
        custom_attributes: loggedInUser.custom_attributes,
        addresses:
          loggedInUser.addresses.length > 0
            ? loggedInUser.addresses.map((item, key) => {
                return {
                  id: item.id,
                  customer_id: item.customer_id,
                  telephone: item.telephone,
                  region: item.region,
                  region_id: item.region_id,
                  country_id: item.country_id,
                  street: item.street.map((street, streetKey) => {
                    return street;
                  }),
                  postcode: item.postcode,
                  city: item.city,
                  firstname: loggedInUser.firstname,
                  lastname: loggedInUser.lastname,
                  custom_attributes: item.custom_attributes,
                };
              })
            : [],
      };

      // INFORMATION UPDATE
      if (updateKey === 'Information update' && index == undefined) {
        this.state.items.map(item => {
          if (item.state.label === 'First Name') {
            customer.firstname = item.state.value;
          } else if (item.state.label === 'Last Name') {
            customer.lastname = item.state.value;
          } else if (item.state.label === 'Email') {
            customer.email = item.state.value;
          } else if (item.state.label === 'Phone Number') {
            // customer.custom_attributes[0].value = item.state.value;
            customer.custom_attributes.map((att: any) => {
              if (att.attribute_code == 'phone_number') {
                att.value = item.state.value;
              }
            });
          }
        });
      }

      // ADDRESS UPDATE
      if (updateKey === 'Address update') {
        if (index !== undefined) {
          let streetValue: any = [];
          let names;
          this.state.items.map(item => {
            if (item.state.label === 'Locality') {
              streetValue[0] = item.state.value;
            } else if (item.state.label === 'Address') {
              // const names = item.state.value.split(',')
              // customer.addresses[index].street = names
              streetValue[1] = item.state.value;
            } else if (item.state.label === 'City') {
              customer.addresses[index].city = item.state.value;
            } else if (item.state.label === 'PinCode') {
              customer.addresses[index].postcode = item.state.value;
              if (item.state.value[0] == 6) {
                customer.addresses[index].region_id = 563;
                customer.addresses[index].region = {
                  region: 'Tamil Nadu',
                  region_code: 'TN',
                  region_id: 563,
                };
              } else {
                customer.addresses[index].region_id = 549;
                customer.addresses[index].region = {
                  region: 'Karnataka',
                  region_code: 'KA',
                  region_id: 549,
                };
              }
            }
          });
          // customer.addresses[index].custom_attributes[0].value = this.getAddressType();
          for (const attr of customer.addresses[index].custom_attributes) {
            if (attr.attribute_code == 'address_label') {
              attr.value = this.getAddressType();
            }
            if (attr.attribute_code == 'latitude') {
              attr.value = this.state.coordinate.latitude;
            }
            if (attr.attribute_code == 'longitude') {
              attr.value = this.state.coordinate.longitude;
            }
          }
          customer.addresses[index].street = streetValue;
        } else {
          // const selectedState=item.postcode[0]==6?"Tamil Nadu":"Karnataka"
          //         const region_code=item.postcode[0]==6?"TN":"KA"
          //         const region_id=item.postcode[0]==6?563:549
          let streetValue: any = [];
          // ADDING NEW ADDRESS
          const dataValue: any = {
            customer_id: loggedInUser.id,
            telephone: loggedInUser.custom_attributes[0].value,

            country_id: 'IN',
            street: [],
            postcode: '',
            city: '',
            firstname: loggedInUser.firstname,
            lastname: loggedInUser.lastname,
            custom_attributes: [
              {
                attribute_code: 'address_label',
                value: '1',
              },
              {
                attribute_code: 'latitude',
                value: this.state.coordinate.latitude,
              },
              {
                attribute_code: 'longitude',
                value: this.state.coordinate.longitude,
              },
            ],
          };

          this.state.items.map(item => {
            if (item.state.label === 'Locality') {
              streetValue[0] = item.state.value;
            } else if (item.state.label === 'Address') {
              // const names = item.state.value.split(',')
              // customer.addresses[index].street = names
              streetValue[1] = item.state.value;
            } else if (item.state.label === 'City') {
              dataValue.city = item.state.value;
            } else if (item.state.label === 'PinCode') {
              dataValue.postcode = item.state.value;
              if (item.state.value[0] == 6) {
                dataValue.region_id = 563;
                dataValue.region = {
                  region: 'Tamil Nadu',
                  region_code: 'TN',
                  region_id: 563,
                };
              } else {
                dataValue.region_id = 549;
                dataValue.region = {
                  region: 'Karnataka',
                  region_code: 'KA',
                  region_id: 549,
                };
              }
            }
          });
          dataValue.custom_attributes[0].value = this.getAddressType();
          dataValue.street = streetValue;
          customer.addresses.push(dataValue);
        }
      } else if (updateKey === 'Delete address') {
        //DELETE ADDRESS

        if (index !== undefined) {
          customer.addresses.splice(index, 1);
        }
        const unique = customer.addresses.filter(
          (item, i, arr) =>
            arr.findIndex(
              obj =>
                obj.street[0] === item.street[0] &&
                obj.street[1] === item.street[1] &&
                obj.postcode === item.postcode,
            ) == i,
        );
        customer.addresses = unique;
      }
      const data = {
        customer,
      };
      const response = await this.userRepository.updateProfileInfo(data);
      if (response) {
        this.setState({
          ...this.state,
          isLoading: false,
          onDeleteSuccess: updateKey === 'Delete address' ? true : false,
          onSuccess: true,
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        loadError: error,
      });
    }
  }

  public handleLocalityChange = async value => {
    const response = await this.userRepository.getRelevantAddresses(value);
    console.log(response, 'suggest');
    this.setState({
      ...this.state,
      addressDetails: response,
    });
  };
  handleRelevantAddress = async value => {
    console.log(value, 'suggest');
    // if(value){
    // this.getAddressByLatLng({ lat:value.lat, lng:value.lon })
    // this.changeAddress("locality",value.address.name)
    // this.changeAddress("address",value.display_address)
  };
  public async getProfileInfo() {
    let loggedInUser: any = {};
    const response = await this.userRepository.getState().loggedInUser;
    if (response) {
      loggedInUser = response;
    } else {
      loggedInUser = await this.userRepository.getProfileInfo();
    }
    return loggedInUser;
  }
  async getProfileInfoAfterAddAddressForDelivery() {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    await this.getInputItems(false);
    const loggedInUser = await this.userRepository.getState().loggedInUser;
    this.setState({
      ...this.state,
      isLoading: false,
    });
    return [
      {
        key: loggedInUser.addresses[loggedInUser.addresses.length - 1],
        value: this.state.adressItem[this.state.adressItem.length - 1],
      },
      this.state.customerId[this.state.customerId.length - 1],
    ];
  }

  public async logout() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      await this.userRepository.logout();
      // this.cartRepository.set('couponButton', true);
      this.userRepository.set('couponCode', '');
      this.userRepository.set('isCouponApplied', false);
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public getInputFieldAutoComplete(addressDetails, latlng) {
    this.setState({
      ...this.state,
      description: addressDetails.Address,
      isLoading: true,
    });
    const viewModel: any = [];
    let items = [
      {label: 'PinCode', value: addressDetails.PinCode},
      {label: 'Address', value: addressDetails.Address},
      {label: 'Locality', value: addressDetails.Locality},
      {label: 'City', value: addressDetails.City},
    ];

    for (const input of items) {
      const textInputViewModel = new TextInputViewModel();
      const obj = {
        label: input.label,
        value: input.value,
        isUpdated: true,
        key: input,
      };

      textInputViewModel.setState({
        ...obj,
      });
      viewModel.push(textInputViewModel);

      console.log(input.value, 'obj');
    }
    this.setState({
      ...this.state,
      items: viewModel,
      isLoading: false,
    });
    this.set('coordinate', {latitude: latlng.lat, longitude: latlng.lng});
  }

  public getAddressByLatLng = async (latlng: any, Pincode?: any) => {
    console.log("userAddress",this.state.userAddress)
    const {inputAddress, inputLocality} = this.state;
    const res = await Geocoder.geocodePosition(latlng);
    let addressDetails: any = {};
    if (Pincode) {
      addressDetails = {
        Locality: inputAddress
          ? ''
          : res[0].subLocality
          ? res[0].subLocality
          : '',
        // Address: inputLocality
        //   ? inputLocality
        //   : res[0].formattedAddress
        //   ? res[0].formattedAddress
        //   : '',
        Address:this.state.inputAddress,
        City: res[0].locality ? res[0].locality : '',
        PinCode: Pincode,
      };

      console.log(Pincode, addressDetails);
    } else {
      addressDetails = {
        Locality: res[0].subLocality ? res[0].subLocality : '',
        // Address: res[0].formattedAddress ? res[0].formattedAddress : '',
        Address:this.state.inputAddress,
        City: res[0].locality ? res[0].locality : '',
        PinCode: res[0].postalCode ? res[0].postalCode : '',
      };
    }

    await this.getInputFieldAutoComplete(addressDetails, latlng);
  };
  public async getLatLongByPincode(Pincode?) {
    try {
      this.setState({
        ...this.state,
        // isLoading: true,
      });
      
      const data = {
        pincode: Pincode
          ? Pincode
          : this.state.items[3].state.value
          ? this.state.items[3].state.value
          : '600091',
      };
      const response = await this.userRepository.getLatLongByPincode(data);
      if (response && response.length) {
        const latlng = {
          lat: Number(response[0].lat),
          lng: Number(response[0].lon),
        };
        if (Pincode) {
          await this.getAddressByLatLng(latlng, Pincode);
        }
        this.setState({
          ...this.state,
          isLoading: false,
        });
      }
      return response;
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }
  }
}

export interface TextInputState {
  label: string;
  value: any;
  isUpdated: boolean;
  key: any;
}

export class TextInputViewModel extends BaseViewModel {
  protected state: TextInputState;

  constructor() {
    super();
    this.state = this.defaultState();
  }

  protected defaultState() {
    return {
      label: '',
      value: '',
      key: '',
      isUpdated: false,
    };
  }
}

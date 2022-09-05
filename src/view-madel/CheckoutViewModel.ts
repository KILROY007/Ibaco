import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import {Platform} from 'react-native';
import {AddressTypeEnumArray} from '../domain/enumerations/AddressTypeEnum';
import {GenderEnum} from '../domain/enumerations/GenderEnum';
import AsyncStorage from '@react-native-community/async-storage';
import {CartRepository} from '../domain/repository/CartRepository';
import {PaymentMethodEnum} from '../domain/enumerations/PaymentMethodEnum';
import {DeleveryAddressTypeEnum} from '../domain/enumerations/DeleveryAddressTypeEnum';
import constants from '../resources/constants';

export interface CheckoutState {
  isLoading: boolean;
  items: any[];
  loadError?: Error;
  error?: Error;
  addressType: any[];
  AddressSelectedIndex: any;
  onSuccess: boolean;
  showChangeDelivery: boolean;
  deliveryError: Error;
  adressItem: any[];
  isSaved: boolean;
  gender: string;
  walletButton: boolean;
  showStorePopup:boolean;
  paymentMethod: string;
  response: any;
  pickUpAddressItemsIs: any[];
  alertDetails: any;
  deliveryMode: any;
  customerId: any;
  storeId: any;
  userInfo:any;
  loggedInUser: string;
  phoneNumber: string;
  shippingInfoResponse: any;
  canProceed:any;
  isPriceDetailsPressed: boolean;
  pickUpInventorySources: any[];
  selectedDeliveryAddress: any;
  walletBalance: any;
  customizationText: string;
}

export class CheckoutViewModel extends BaseViewModel {
  protected state: CheckoutState;
  SelectedAddressPinCode: any;

  constructor(
    private userRepository: UserRepository,
    private cartRepository: CartRepository,
  ) {
    super();
    this.state = this.defaultState();
    this.userRepository = userRepository;
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
      adressItem: [],
      gender: '',
      walletButton: true,
      paymentMethod: PaymentMethodEnum.RAZORPAY,
      response: undefined,
      pickUpAddressItemsIs: [],
      alertDetails: undefined,
      deliveryMode: 1,
      userInfo:{},
      showChangeDelivery: false,
      showStorePopup:false,
      isSaved: false,
      canProceed:false,
      deliveryError: undefined,
      customerId: [],
      loggedInUser: '',
      storeId: '',
      phoneNumber: '',
      shippingInfoResponse: undefined,
      isPriceDetailsPressed: false,
      pickUpInventorySources: [],
      selectedDeliveryAddress: '',
      walletBalance: '',
      customizationText: '',
    };
  }

  public async load() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      this.SelectedAddressPinCode = this.userRepository.getState().pincode;
      const {isDelivery} = this.userRepository.getState();
     
      this.setState({
        ...this.state,
        deliveryMode: isDelivery
          ? DeleveryAddressTypeEnum.DELIVERY
          : DeleveryAddressTypeEnum.PICKUP,
      });
      let adressItems: any = [];
      const viewModel: any = [];
      const id: any = [];
      const loggedInUser = await this.userRepository.getState().loggedInUser;
      const inventorySources = this.userRepository.getState().inventorySources
        .items;
      const addressValue = {
        locality: '',
        city: '',
        address: '',
        pinCode: '',
        region: '',
        country_id: '',
        custom_attributes: '',
      };

      if (loggedInUser) {
        if (loggedInUser.addresses && loggedInUser.addresses.length > 0) {
          const unique = loggedInUser.addresses.filter(
            (item, index, arr) =>
              arr.findIndex(
                obj =>
                  obj.street[0] === item.street[0] &&
                  obj.street[1] === item.street[1]&&obj.postcode=== item.postcode
                  &&obj.custom_attributes[0].value ===
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
                address.street[1] ? address.street[1] : 'address not mentioned'
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
            this.state.adressItem.push({key: address, value: adressItems});
            id.push(address.id);
          });
        }

        const sourcePincode = this.userRepository.getState().sourcePincode;
        let selectedPickUpAddress:any=[];
        inventorySources.map((pickUpAddress, key) => {
          if (pickUpAddress.postcode === sourcePincode) {
            selectedPickUpAddress.push(pickUpAddress);
          }
        });
        selectedPickUpAddress.map((address:any)=>{
        const pickUpAddressItems = [
          {label: 'Street', value: `${address.street}`},
          {label: 'City', value: `${address.city}`},
          {label: 'PinCode', value: `${address.postcode}`},
          {label: 'Region', value: `${address.region}`},
          {label: 'Country_id', value: `${address.country_id}`},
          {label: 'name', value: `${address.name}`},
        ];
        this.state.pickUpAddressItemsIs.push({
          key:address,
          value: pickUpAddressItems,
        });

      })
      }
      this.setState({
        ...this.state,
        items: viewModel,
        customerId: id,
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

  public async loadForCheckoutPayment() {
    const {loggedInUser} = await this.userRepository.getState();
    const inventorySources = this.userRepository.getState().inventorySources
      .items;
      let {userInfo}=this.state
    const loggedInUserName = `${loggedInUser.firstname} ${
      loggedInUser.lastname
    }`;
    userInfo.name=loggedInUser.firstname
    let phone_number;
    loggedInUser.custom_attributes.length &&
      loggedInUser.custom_attributes.map((item, index) => {
        if (item.attribute_code === 'phone_number') {
          phone_number = item.value;
        }
      });
      userInfo.phone_number=phone_number
      userInfo.email=loggedInUser.email

    this.setState({
      ...this.state,
      loggedInUser: `${loggedInUserName}  ${phone_number}`,
      userInfo
    });
    if (loggedInUser && inventorySources.length > 0) {
    }

  ;
    await this.setShippingAndBillingAddress();
  }

  public async setShippingAndBillingAddress() {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    const {loggedInUser, sourcePincode} = this.userRepository.getState();
    try {
      const billingAddress = {
        address: {
          email: loggedInUser.email,
          customer_id: loggedInUser.id,
          firstname: loggedInUser.firstname,
          lastname: loggedInUser.lastname,
          same_as_billing: 1,
        },
      };
      if (this.state.deliveryMode === 1) {
        const item = this.state.selectedDeliveryAddress;
        billingAddress.address['region_code'] = item.region.region_code;
        billingAddress.address['region'] = item.region.region;
        billingAddress.address['region_id'] = item.region.region_id;
        billingAddress.address['country_id'] = item.country_id;
        billingAddress.address['street'] = [
          `${this.state.selectedDeliveryAddress.street}`,
        ];
        billingAddress.address['telephone'] = item.telephone;
        billingAddress.address['postcode'] = item.postcode;
        billingAddress.address['city'] = item.city;
      } else {
        const item = this.state.selectedDeliveryAddress;
        billingAddress.address['region_code'] = 'TN';
        billingAddress.address['region'] = item.region;
        billingAddress.address['region_id'] = item.region_id;
        billingAddress.address['country_id'] = item.country_id;
        billingAddress.address['street'] = [
          `${this.state.selectedDeliveryAddress.street}`,
        ];
        billingAddress.address['telephone'] =
          loggedInUser.custom_attributes[0].value;
        billingAddress.address['postcode'] = item.postcode;
        billingAddress.address['city'] = item.city;
      }

      await this.saveLatLng();
      await this.userRepository.estimateShippingMethods(billingAddress);
      const shippingInfo = {
        addressInformation: {
          shipping_address: billingAddress.address,
          shipping_method_code:
            this.state.deliveryMode === 1
              ? billingAddress.address['postcode'] !== sourcePincode
                ? 'customshipping'
                : 'flatrate'
              : 'storepickup',
          shipping_carrier_code:
            this.state.deliveryMode === 1
              ? billingAddress.address['postcode'] !== sourcePincode
                ? 'customshipping'
                : 'flatrate'
              : 'storepickup',
          billing_address: billingAddress.address,
        },
      };

      const shippingInfoResponse = await this.userRepository.shippingInformation(
        shippingInfo,
      );
      if(this.state.deliveryMode === 1){
      const dunzoResponse =
        (await shippingInfoResponse.totals.total_segments) &&
        shippingInfoResponse.totals.total_segments[1]['code'].includes(
          'Dunzo'
        ) &&
        shippingInfoResponse.totals.total_segments[1]['value'];
        console.log(dunzoResponse,"dunzoresponse")
        console.log(shippingInfoResponse,"dunzo")
      if (!dunzoResponse || isNaN(dunzoResponse)) {
        this.setState({
          ...this.state,
          isLoading: false,
          deliveryError: dunzoResponse,
          showChangeDelivery: true,
        });
      }else{
        this.setState({
          ...this.state,
          isLoading: false,
        canProceed:true
        })
      }
    }else{
      this.setState({
        ...this.state,
        isLoading: false,
      canProceed:true
      })
    }

      await this.userRepository.getCartDetails();
      await this.checkWalletbalance();
      this.setState({
        ...this.state,
        isLoading: false,
        shippingInfoResponse: shippingInfoResponse.totals,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async orderPlaced(
    cod,
    addressMethode,
    razorpayData?,
    walletUpdateData?,
  ) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const {loggedInUser} = this.userRepository.getState();
      const paymentMethods = await this.userRepository.getPaymentMethods();
      let paymentMethodCode;
      if (paymentMethods && paymentMethods.length) {
        for (const method of paymentMethods) {
          if (method.title === this.state.paymentMethod) {
            paymentMethodCode = method.code;
          }
        }
      }
      const paymentInfo = {
        paymentMethod: {
          method: cod ? 'checkmo' : paymentMethodCode,
          additional_data:
            this.state.paymentMethod === PaymentMethodEnum.CHECKMO || cod
              ? {delivery_mode: addressMethode}
              : {
                  rzp_payment_id: razorpayData.razorpay_payment_id,
                  rzp_order_id: razorpayData.razorpay_order_id,
                  rzp_signature: razorpayData.razorpay_signature,
                  delivery_mode: addressMethode,
                },
        },
        billingAddress: {
          email: loggedInUser.email,
          firstname: loggedInUser.firstname,
          lastname: loggedInUser.lastname,
        },
      };
      const storeId= await AsyncStorage.getItem("storeSelectedPincode")
      const quoteId=await this.userRepository.getCartId()
      const customRazorpayData: any = {
        object:{
          customerId:loggedInUser.id,
          quoteId,
          storeId,
          rzp_payment_id:razorpayData?razorpayData.razorpay_payment_id:"",
          rzp_order_id: razorpayData?razorpayData.razorpay_order_id:"",
          rzp_signature: razorpayData?razorpayData.razorpay_signature:""
        }
      }
      const customrazorpay = await this.userRepository.updateCustomPaymentInfo(customRazorpayData);
      console.log("custom razorpay return value",customrazorpay);
      if (this.state.deliveryMode === 1) {
        paymentInfo.billingAddress[
          'region_code'
        ] = this.state.selectedDeliveryAddress.region.region_code;
        paymentInfo.billingAddress[
          'region'
        ] = this.state.selectedDeliveryAddress.region.region;
        paymentInfo.billingAddress[
          'region_id'
        ] = this.state.selectedDeliveryAddress.region.region_id;
        paymentInfo.billingAddress[
          'country_id'
        ] = this.state.selectedDeliveryAddress.country_id;
        paymentInfo.billingAddress['street'] = [
          `${this.state.selectedDeliveryAddress.street}`,
        ];
        paymentInfo.billingAddress[
          'telephone'
        ] = this.state.selectedDeliveryAddress.telephone;
        paymentInfo.billingAddress[
          'postcode'
        ] = this.state.selectedDeliveryAddress.postcode;
        paymentInfo.billingAddress[
          'city'
        ] = this.state.selectedDeliveryAddress.city;
      } else {
        const item = this.state.selectedDeliveryAddress;
        paymentInfo.billingAddress['region_code'] = 'KA';
        paymentInfo.billingAddress['region'] = item.region;
        paymentInfo.billingAddress['region_id'] = item.region_id;
        paymentInfo.billingAddress['country_id'] = item.country_id;
        paymentInfo.billingAddress['street'] = [
          `${this.state.selectedDeliveryAddress.street}`,
        ];
        paymentInfo.billingAddress['telephone'] =
          loggedInUser.custom_attributes[0].value;
        paymentInfo.billingAddress['postcode'] = item.postcode;
        paymentInfo.billingAddress['city'] = item.city;
      }
      const response = await this.userRepository.paymentInformation(
        paymentInfo,
      );
      const OrderItemresponse = await this.userRepository.orderByPaymentId(
        response,
        addressMethode == 1 ? true : false,
      );
      if(this.state.deliveryMode === 1){
      const storeId = await AsyncStorage.getItem('storeSelectedPincode')
      // const NearStore=await AsyncStorage.getItem(constants.NEAREST_STORE);
      const trackResponse=await this.userRepository.postOrderDetails(response, storeId);
      // await AsyncStorage.setItem(constants.TRACK_ID+response,trackResponse.tracking_id)
      }
      else{
        const storeId=this.state.selectedDeliveryAddress.source_code
        const trackResponse=await this.userRepository.postOrderDetails(response, storeId);
      // await AsyncStorage.setItem(constants.TRACK_ID,trackResponse.tracking_id)
      }
      if (this.state.customizationText) {
        await this.addCustomization(response);
      }
      if (walletUpdateData) {
        await this.updateWalletBalance(
          walletUpdateData.res,
          walletUpdateData.rzp_order,
        );
      }
      this.setState({
        ...this.state,
        isLoading: false,
        onSuccess: true,
        response,
      });
      this.updateCart();
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        loadError: error,
      });
    }
  }
  public async addCustomization(orderId) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const data = {
        customization: {
          customization_id: orderId,
          customization: this.state.customizationText,
        },
      };
      const response = await this.userRepository.addCustmization(data);
      this.setState({
        ...this.state,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        // error,
      });
    }
  }

  public async updateCart() {
    await this.userRepository.emptyCart();
  }

  public async getProfileInfo() {
    const loggedInUser = await this.userRepository.getState().loggedInUser;
    return loggedInUser;
  }

  public async getOrderDetails() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const orderDetails = await this.userRepository.getOrderId(
        this.state.walletButton,
      );
      this.setState({
        ...this.state,
        isLoading: false,
      });
      return orderDetails[0];
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        loadError: error,
      });
    }
  }

  public async logout() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      await this.userRepository.logout();
      await this.userRepository.emptyCart();
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

  public async checkWalletbalance() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      const response = await this.userRepository.checkWalletbalance();
      this.setState({
        ...this.state,
        walletBalance: response[response.length - 1],
        walletButton: response[response.length - 1] ? true : false,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async updateWalletBalance(data, rzpOrder) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });

      const loggedInUser = await this.getProfileInfo();

      const reqbody = {
        user_id: loggedInUser.id,
        amount: 0,
        rzp_order: rzpOrder,
        razorpay_signature: data.razorpay_signature
          ? data.razorpay_signature
          : '',
        razorpay_payment_id: data.razorpay_payment_id
          ? data.razorpay_payment_id
          : '',
        module: 'checkout',
      };
      const response = await this.userRepository.updateWalletBalance(reqbody);
      this.userRepository.set('walletBalance', response[response.length - 1]);
      this.setState({
        ...this.state,
        isLoading: false,
        walletBalance: response[response.length - 1],
        response: response[1],
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }
  saveLatLng = async () => {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const userInfo = this.userRepository.getState().loggedInUser;
      const storeId=await AsyncStorage.getItem('storeSelectedPincode');
      console.log(storeId)
      const NearStore=await AsyncStorage.getItem(constants.NEAREST_STORE);
      let data: any = {};
      const {selectedDeliveryAddress} = this.state
      if(this.state.deliveryMode===1)
      {
      if(storeId){
        data.storeId = storeId;
      }
      else if(NearStore){
        data.storeId=NearStore;
      } 
      selectedDeliveryAddress.custom_attributes.map((item: any) => {
        if (item.attribute_code === 'latitude') data.latitude = item.value;
        if (item.attribute_code === 'longitude') data.longitude = item.value;
      });
      }
      else{
        data.storeId = selectedDeliveryAddress.source_code
        data.latitude=selectedDeliveryAddress.latitude
        data.longitude=selectedDeliveryAddress.longitude
      }
      
      data.customerId = userInfo.id;
      data.quoteId = await this.userRepository.getCartId()
      data.shipping_option = this.state.deliveryMode===1 ? "delivery" : "pickup";
      data.is_checkout="yes"
     if(data.storeId!==null){
         await this.userRepository.saveLatLng(data);
    }
    else{
      this.setState({
        ...this.state,
        showStorePopup:true, 
        isLoading: false,
      });
    }
      
    } catch (error) {
      console.log(error);
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }
  };
}

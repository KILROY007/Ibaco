import { BaseViewModel } from './BaseViewModel';
import { UserRepository } from '../domain/repository/UserRepository';
import { Platform } from 'react-native';
import { ValidationUtils } from '../core/ValidationUtils';
import { CartRepository } from '../domain/repository/CartRepository';
import Strings from '../resources/String';

export interface LoginState {
  isLoading: boolean;
  mobileNumber: string;
  mobileNumberForLogin: string;
  loadError?: Error;
  error?: Error;
  otp: string;
  otpForLogin: string;
  clickOTPButton: boolean;
  clickOTPButtonForLogin: boolean;
  googleForm:{
    firstname:string,
    lastname:string,
    auth_id: any
    email:string,
    email_verified:number,
    phone_number:number,
    img_url:any
  };
  newGoogleUser:boolean;
  newGoogleUserAlert:boolean;
  googleUserName:string;
  oldGoogleUser:boolean;
  isLogin: boolean;
  lastname: string;
  firstname: string;
  email: string;
  isSignin: boolean;
  showAllTextField: boolean;
  validationError?: Error;
  onSuccess: boolean;
  onOtpSendSuccess: boolean;
  onLogInSuccess: boolean;
  onSendOtp: boolean;
  invalidOtp: boolean;
  isSignUpSuccess: boolean;
  onOtpVerifiedSuccesfully: boolean;
  shouldShowAccountStack: boolean;
  alertDetails: any;
  editNumber: boolean;
  onUpdatePhoneSuccess: boolean;
}

export class LoginViewModel extends BaseViewModel {
  protected state: LoginState;

  constructor(
    private userRepository: UserRepository,
    private validationUtils: ValidationUtils,
    private cartRepository: CartRepository,
  ) {
    super();
    this.userRepository = userRepository;
    this.validationUtils = validationUtils;
    this.state = this.defaultState();
  }

  protected defaultState() {
    return {
      mobileNumber: '',
      lastname: '',
      firstname: '',
      email: '',
      isLoading: false,
      loadError: undefined,
      error: undefined,
      otp: '',
      otpForLogin: '',
      clickOTPButton: false,
      clickOTPButtonForLogin: false,
      isLogin: false,
      isSignin: true,
      showAllTextField: true,
      validationError: undefined,
      onSuccess: false,
      onOtpSendSuccess: false,
      onLogInSuccess: false,
      onSendOtp: false,
      invalidOtp: false, 
      googleForm:{
        firstname:'',
        lastname:'',
        auth_id:'',
        email:'',
        email_verified:0,
        phone_number:0,
        img_url:''
      },
      newGoogleUser:false,
      newGoogleUserAlert:false,
      googleUserName:"",
      oldGoogleUser:false,
      isSignUpSuccess: false,
      onOtpVerifiedSuccesfully: false,
      shouldShowAccountStack: false,
      mobileNumberForLogin: '',
      alertDetails: undefined,
      editNumber: false,
      onUpdatePhoneSuccess: false,
    };
  }
 private googleValidate(){
  let error;
  if(
  this.validationUtils.isMobileNumberValid(
    this.state.googleForm.phone_number.replace(/\s/g, ''),
  ) === false
) {
  error = Error(Strings.error_invalid_phoneNo);

  this.setState({
    ...this.state,
    validationError: error,
  });
}
 }
  private isSignInValid() {
    let error;
    if (this.state.isLogin) {
      if (
        this.validationUtils.isMobileNumberValid(
          this.state.mobileNumberForLogin.replace(/\s/g, ''),
        ) === false
      ) {
        error = Error(Strings.error_invalid_phoneNo);

        this.setState({
          ...this.state,
          validationError: error,
        });
      }
    } else if (this.state.isSignin) {
      if (
        this.validationUtils.isMobileNumberValid(
          this.state.mobileNumber.replace(/\s/g, ''),
        ) === false
      ) {
        error = Error(Strings.error_invalid_phoneNo);

        this.setState({
          ...this.state,
          validationError: error,
        });
      } else if (this.validationUtils.isEmpty(this.state.firstname)) {
        error = Error(Strings.error_invalid_firstName);

        this.setState({
          ...this.state,
          validationError: error,
        });
      }else if (this.validationUtils.isNameValid(this.state.firstname) === false) {
        error =Error("First name should only contain alphabets"),
        this.setState({
          ...this.state,
          validationError: error,
        });
      }  else if (this.validationUtils.isEmpty(this.state.lastname)) {
        error = Error(Strings.error_invalid_lastName);

        this.setState({
          ...this.state,
          validationError: error,
        });
      } else if (this.validationUtils.isNameValid(this.state.lastname) === false) {
        error= Error("Last name should only contain alphabets")
        this.setState({
          ...this.state,
          validationError: error,
        });
      }else if (this.validationUtils.isEmpty(this.state.email)) {
        error = Error(Strings.error_invalid_empty_email);

        this.setState({
          ...this.state,
          validationError: error,
        });
      } else if (
        this.validationUtils.isEmailValid(this.state.email) === false
      ) {
        error = Error(Strings.error_invalid_email);

        this.setState({
          ...this.state,
          validationError: error,
        });
      }
    }
  }

  // SEND OTP TO USER

  public async generateOtp() {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
      });
      this.isSignInValid();
      if (this.state.validationError) {
        this.setState({
          ...this.state,
          isLoading: false,
        });
        return;
      }
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const data = {
        customerNumber: this.state.isSignin
          ? this.state.mobileNumber
          : this.state.mobileNumberForLogin,
      };
      const response = await this.userRepository.generateOtp(data);
      if (response && this.state.isSignin) {
        this.setState({
          ...this.state,
          onOtpSendSuccess: true,
          clickOTPButton: true,
          isLoading: false,
        });
      } else {
        this.setState({
          ...this.state,
          onOtpSendSuccess: true,
          clickOTPButtonForLogin: true,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        onSendOtp: true,
        isLoading: false,
      });
    }
  }

  public async verifyOtp(data: any) {
    if (this.state.validationError) {
      return;
    }
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const cartDetails = await this.getCartDetails();
      const response = await this.userRepository.verifyotp(data);
      if (response) {
        const cartid = await this.userRepository.getCartId();
        await this.updateGuestCartDetails(cartDetails, cartid);
        this.setState({
          ...this.state,
          onOtpVerifiedSuccesfully: true,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        invalidOtp: true,
        isLoading: false,
      });
    }
  }

  // LOGIN USER

  public async logIn() {
    try {
      const cartDetails = await this.getCartDetails();
      this.isSignInValid();
      if (this.state.validationError) {
        return;
      }
      this.setState({
        ...this.state,
        isLoading: true,
      });
      const data = {
        customerNumber: Number(this.state.mobileNumberForLogin),
        otp: Number(this.state.otpForLogin),
      };
      const response = await this.userRepository.login(data);
      if (response) {
        const cartid = await this.userRepository.getCartId();
        await this.updateGuestCartDetails(cartDetails, cartid);
        this.setState({
          ...this.state,
          onLogInSuccess: true,
          isLoading: false,
        });
      }
      // await this.userRepository.getProfileInfo()
    } catch (error) {
      this.setState({
        ...this.state,
        invalidOtp: true,
        isLoading: false,
      });
    }
  }

  public setShouldShowAccountStack() {
    this.userRepository.setShouldShowAccountStack();
  }

  public reset() {
    this.setState(this.defaultState());
  }

  //  SIGN IN USER

  public async signUp() {
    this.isSignInValid();
    if (this.state.validationError) {
      return;
    }
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      // const customer = {
      //   email: this.state.email,
      //   firstname: this.state.firstname,
      //   lastname: this.state.lastname,
      //   gender: '1',
      //   custom_attributes: [
      //     {
      //       attribute_code: 'phone_number',
      //       value: this.state.mobileNumber,
      //     },
      //   ],
      // };
      // const data = {
      //   customer,
      // };
      const params = {
        email: this.state.email,
        firstname: this.state.firstname,
        lastname: this.state.lastname,
        gender: '1',
        phone_number: this.state.mobileNumber,
      };
      const data = {
        params,
      };
      const response = await this.userRepository.signUp(data);

      if (response) {
        this.setState({
          ...this.state,
          onSuccess: true,
          isLoading: false,
          editNumber: true,
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        loadError: error,
        isLoading: false,
        editNumber: false,
      });
    }
  }
  //UPDATE MOBILE NUMBER
  public async updateMobileNumber(data) {
    this.isSignInValid();
    if (this.state.validationError) {
      return;
    }
    this.setState({
      ...this.state,
      isLoading: true,
    });
    try {
      const response = await this.userRepository.updateMobileNumber(data);

      if (response) {
        this.setState({
          ...this.state,
          isLoading: false,
          editNumber: true,
          onUpdatePhoneSuccess: true,
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        // loadError: error,
        isLoading: false,
        editNumber: false,
        error,
      });
    }
  }
  public createUserFromGoogle = async () => {
    try {
      const {firstname,lastname,email_verified,phone_number,email,auth_id,img_url} = this.state.googleForm;
      const user = JSON.stringify({
        params:{
        firstname,lastname,email_verified,phone_number,email,auth_id,img_url 
      }});
     const response=await this.userRepository.createUserFromGoogle(user)
      if(response){
        const cartDetails = await this.getCartDetails();
        const cartid = await this.userRepository.getCartId();
        await this.updateGuestCartDetails(cartDetails, cartid);
      }
      return response;
    } catch (error) {
      this.setState({ ...this.state, isLoading: false, error });
      return false;
    }
  }
  public checkUserFromGoogle = async (email:any) => {
    try {
      this.setState({ ...this.state, isLoading: true }); 
      const response=await this.userRepository.checkUserFromGoogle(email);
     
      this.setState({ ...this.state,googleForm:{
        ...this.state.googleForm,
        phone_number:response[0].mobile
      }, isLoading: false}); 

      return response;
    } catch (error) {
      this.setState({ ...this.state, isLoading: false, error });
      return false;
    }
  }
public validateGoogleUser=async()=>{
  try{
    this.googleValidate()
    if (this.state.validationError) {
      this.setState({
        ...this.state,
        isLoading: false,
      });
      return;
    }
    const response = await this.createUserFromGoogle();
    return response
  }catch (error) {
    this.setState({ ...this.state, isLoading: false, error });
    return false;
  }
}
  public async getCartDetails() {
    return await this.userRepository.getState();
  }

  public async updateGuestCartDetails(cartDetails, cartid) {
    try {
      if (
        cartDetails &&
        cartDetails.cartItems &&
        cartDetails.cartItems.length
      ) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < cartDetails.cartItems.length; i++) {
          const guestCartItem = cartDetails.cartItems[i];
          let sku = '';
          const skus = guestCartItem.sku.split('-');
          const oLength =
            guestCartItem.product_option &&
              guestCartItem.product_option.extension_attributes &&
              guestCartItem.product_option.extension_attributes.custom_options &&
              guestCartItem.product_option.extension_attributes.custom_options
                .length
              ? guestCartItem.product_option.extension_attributes.custom_options
                .length
              : 0;
          if (oLength) {
            for (let i = 0; i < skus.length - oLength; i++) {
              sku = `${sku ? sku + '-' : sku}${skus[i]}`;
            }
            if (guestCartItem.name === guestCartItem.sku) {
              sku = guestCartItem.sku;
            }
          } else {
            sku = guestCartItem.sku;
          }
          const cartItem = {
            cartItem: {
              qty: guestCartItem.qty,
              quote_id: cartid,
              sku,
              name: guestCartItem.name,
              product_option: guestCartItem.product_option,
              extension_attributes: {},
            },
          };
          await this.userRepository.addToCart(cartItem);
          let addToCartObject = {
            'currency': 'INR',
            'items': [{
                'quantity':guestCartItem.qty,
                'item_id': JSON.stringify(guestCartItem.item_id),
                'item_name': guestCartItem.name,
            }],
            'value': guestCartItem.price
           };
          await this.userRepository.logAddToCart(addToCartObject)
          if (
            cartDetails.cartItems[i].name ===
            cartDetails.cartItems[cartDetails.cartItems.length - 1].name
          ) {
            const couponCode = this.userRepository.getState().couponCode
            if (couponCode) {
              await this.userRepository.applyCoupon(couponCode)
            } else {
              this.userRepository.set('isCouponApplied', false)
              this.userRepository.set('couponCode', '')
            }
            await this.userRepository.getCartDetails();
            await this.userRepository.getCartItems({});
          }
        }
      } else {
        await this.userRepository.getCartDetails();
        await this.userRepository.getCartItems({});
      }

    } catch (error) {
      // this.setState({
      //   ...this.state,
      //   error,
      // });
    }
  }
}
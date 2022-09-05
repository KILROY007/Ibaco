import axios from 'axios'
import { HatsunError } from './HatsunError'
import constants from '../../resources/constants'

export class ApiManager {

    private preferences: any
    public logOutListener: any 

    constructor(preferences: any) {
        // axios.defaults.baseURL = 'http://3.17.182.96/index.php/rest' // Development base URL
        //axios.defaults.baseURL = 'https://shopadmin.hapdaily.com/hatsun.prod/rest' // Production base URL
        // axios.defaults.baseURL = 'http://13.234.199.227/hatsun/rest' // staging base URL
        axios.defaults.baseURL = 'http://15.206.227.103/magento/rest' //IBACO  Production base URL

        this.preferences = preferences
    }

    private async defaultHeaders(isCustomerToken: boolean) {
        const headers: any = {}
        const loginToken = await this.preferences.getItem(constants.LOGGED_IN_TOKEN)
  
        // const websiteToken = 'nmii5me8o62cje2ku7q0q1ojb6ixh04u' // admin token
        const websiteToken  = 'eny3tvx94fhyav1zttfnu34b8kq5x1o9';
        if (loginToken !== undefined) {
            if (isCustomerToken) {
                headers.Authorization = `Bearer ${loginToken}`
            }
            else {
                headers.Authorization = `Bearer ${websiteToken}`
            }
        }
        headers['Content-Type'] = 'application/json'
        return headers
    }

    private processError(error: any) {
        console.log({ error })
        if (axios.isCancel(error)) {
            return new HatsunError('Canceled', 499)
        } else {

            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                const message = error.response.data.message
                const code = error.response.data.code
                if(error.response.status==401){
                 this.preferences.clear()
                return new HatsunError("You have been logged out,please log in to continue", 401) 
                }
                return new HatsunError(message, code)
            } else {
                if (error.response) {
                    return new HatsunError(error.message, error.response.status)
                } else {
                    return new HatsunError(error.message, 400)
                }
            }
        }
    }

    public async signUp(data) {
        try {
            const headers = await this.defaultHeaders(false)

            console.log(JSON.stringify(data), 'signupData')
            const response = await axios.post('/V1/create-customer', data, { headers })
            console.log(response.data, 'signup')
            return response.data
        } catch (error) {

            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    public async saveFcm(data) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post('/V1/savefcm', data, { headers })
            console.log("saveFcm",response.data)
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    //
    //send otp
    public async generateOtp(data) {
        try {
            const headers = await this.defaultHeaders(false)

            const response = await axios.post('/V1/chopserve/login', data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    //update mobile number

    public async updateMobileNumber(data) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post('/V1/chopserve/resend-or-update', data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    //verify otp
    public async verifyotp(data) {
        try {
            console.log(data, 'verifyOTP')
            const { customerNumber, otp } = data
          
            const response = await axios.post("/V1/hatsun/verifyNumber", null, { data })
            console.log(response, 'verifyOTPResp')
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    //login by otp login
    public async login(data) {
        try {
            console.log(data, 'loginOTP')
            const headers = await this.defaultHeaders(false)
            const response = await axios.post('/V1/chopserve/otp', data, { headers })
            console.log(response, 'loginOTP-Resp')
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getCustomerToken(data) {
        try {
            const headers = await this.defaultHeaders(false)

            const response = await axios.post('/V1/integration/customer/token', data, { headers })
            console.log("customer token", response.data);

            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getCarousel() {
        try {
            const response = await axios.get('https://wordpress.yutitech.in/wp-json/wp/v2/posts?categories=2')
            return response.data
        } catch (error) {
            throw error
        }
    }

    // get categories
    public async getCategories() {
        try {
            const headers = await this.defaultHeaders(false);


            const params: any = {
                "searchCriteria[sortOrders][0][direction]": "asc",
                "searchCriteria[sortOrders][0][field]": "position"
            };
            const response = await axios.get("/V1/categories/list", {
                headers,
                params,
            });
            return response.data;
        } catch (error) {
            const processError = this.processError(error);
            if (processError) {
                throw processError;
            }
        }
    }

    public async getProducts(id: any, source_code: any) {
       
        try {
            const headers = await this.defaultHeaders(false);

            const param: any = {
                "source_code": source_code ? source_code : "default",
                "category_id": id?id:13
            }
            const response = await axios.post(`/V1/getstoreproducts`, param, {
                headers
            });
            // const response = await axios.get("/V1/products", { headers, params });
            return response.data;
        } catch (error) {
            const processError = this.processError(error);
            if (processError) {
                throw processError;
            }
        }
    }
    // async getStores(postcode: any) {
    //     try {
    //         const headers = await this.defaultHeaders(false);
    //         const params: any = {
    //             "searchCriteria[filterGroups][0][filters][0][field]": "postcode",
    //             "searchCriteria[filterGroups][0][filters][0][value]": postcode,
    //             "searchCriteria[filterGroups][0][filters][0][conditionType]": "like",
    //         };

    //         const response = await axios.get(`/V1/inventory/sources`, { headers, params });
    //         console.log("get stores log", response.data)
    //         return response.data;
    //     } catch (error) {
    //         const processError = this.processError(error);
    //         if (processError) {
    //             throw processError;
    //         }
    //     }
    // }
    async getStores(postcode: any) {
        try {
            const headers = await this.defaultHeaders(false);

            const response = await axios.post(`http://15.206.227.103/magento/rest/V1/newsourcestores?pincode=${postcode}`, { headers });
            console.log("get stores log", response.data)
            return response.data;
        } catch (error) {
            const processError = this.processError(error);
            if (processError) {
                throw processError;
            }
        }
    }
    public async getAllProducts(searchKey) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`/V1/products?searchCriteria[filterGroups][0][filters][0][field]=sku&searchCriteria[filterGroups][0][filters][0][value]=%25${searchKey}%25&searchCriteria[filterGroups][0][filters][0][conditionType]=like&searchCriteria[pageSize]=0&searchCriteria[filterGroups][0][filters][1][field]=name&searchCriteria[filterGroups][0][filters][1][value]=%25${searchKey}%25&searchCriteria[filterGroups][0][filters][1][conditionType]=like`, { headers })
           
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    async getUserReviews(productId: any) {
        try {

            const headers = await this.defaultHeaders(false);
            const params = {
                "product_id": productId
            }
            const response = await axios.get(`/V1/product/reviewlist`, { headers, params });
            return response.data;
        } catch (error) {
            const processError = this.processError(error);
            if (processError) {
                throw processError;
            }
        }
    }
    async postUserReviews(reviewData: any, productId: any, userId: any) {
        try {

            const headers = await this.defaultHeaders(true);
            const body = JSON.stringify({
                params: {
                    customer_id: userId,
                    product_id: productId,
                    ...reviewData
                }
            })
            console.log(body);
            const response = await axios.post(`/V1/product/review/post`, body, { headers });
            return response.data;
        } catch (error) {
            const processError = this.processError(error);
            if (processError) {
                throw processError;
            }
        }
    }
    public async getProductDescription(sku: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const params = {
                'searchCriteria[filterGroups][0][filters][0][field]': 'sku',
                'searchCriteria[filterGroups][0][filters][0][value]': sku,
                'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',

            }
            const response = await axios.get(`/V1/products`, { headers, params })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getRelevantProductsDetails(productRelevantSku: any) {
        try {
            const headers = await this.defaultHeaders(false)
            let params = ''
            productRelevantSku.map((product: any, index: any) => {
                params += `searchCriteria[filterGroups][0][filters][${index}][field]=sku&
          searchCriteria[filterGroups][0][filters][${index}][value]=${product}&`
            })
            const response = await axios.get(`/V1/products?${params}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async activateCart() {
        try {
            const headers = await this.defaultHeaders(true)

            const response = await axios.post('/V1/carts/mine', null, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getCartDetails() {
        try {
            const headers = await this.defaultHeaders(true)

            const response = await axios.get('V1/carts/mine/totals', { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getCartItems() {
        try {
            const headers = await this.defaultHeaders(true)

            const response = await axios.get('V1/carts/mine/items', { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async deleteCartItem(itemId) {
        try {
            const headers = await this.defaultHeaders(true)

            const response = await axios.delete(`/V1/carts/mine/items/${itemId}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    // update information
    public async updateProfileInfo(data) {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.put('V1/customers/me', data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async addToCart(data) {
        console.log("sss",data)
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.post('V1/carts/mine/items', data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async productInCartAfterDecrease(data, itemId) {
        try {
            const itemIdIs = String(itemId)
            const headers = await this.defaultHeaders(true)
            const response = await axios.put(`/V1/carts/mine/items/${itemId}`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
   
    public async getOrderHistoryList(data) {
        try {
            const headers = await this.defaultHeaders(false)
            const params = {
                'searchCriteria[filterGroups][0][filters][0][field]': 'customer_id',
                'searchCriteria[filterGroups][0][filters][0][value]': data,
                'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
            }
            const response = await axios.get(`/V1/orders`, { headers, params })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    // place order....
    public async estimateShippingMethods(data) {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.post(`/V1/carts/mine/estimate-shipping-methods`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    public async getDeliveryFee(data) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post(`/V1/getFees`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    public async shippingInformation(data) {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.post(`/V1/carts/mine/shipping-information`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    public async paymentInformation(data) {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.post(`/V1/carts/mine/payment-information`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    public async orderByPaymentId(data) {
        try {
            const id = parseInt(data)
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`/V1/orders/${id}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    // cancelOrder
    public async cancelOrder(data) {
        try {
            const headers = await this.defaultHeaders(false);
            console.log(data,"derr")
            const response = await axios.post(`/V1/cancelorder`, data, { headers });
            console.log(response,"derr")
            return response.data;
          } catch (error) {
            const processError = this.processError(error);
            if (processError) {
              throw processError;
            }
          }
    }
    async getTrackingId(orderId:any){
        try {
          const headers = await this.defaultHeaders(false);
          let bodyFormData = new FormData();
          bodyFormData.append('orderId',orderId);
          const response = await axios.post(`/V1/dunzo-trackingId`, bodyFormData, { headers });
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
      async getOrderStatus(trackId:any){
        try {
          const headers = await this.defaultHeaders(false);
          const data={
            "task_id":trackId
          }
          const response = await axios.post(`/V1/dunzo-tasks-status`,data,{ headers });
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
       }
    // get data have to remove
    // get coupon
    public async getCouponCode() {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.get(`/V1/carts/mine/coupons`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    // applyCoupon
    public async applyCoupon(couponCode) {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.put(`/V1/carts/mine/coupons/${couponCode}`, null, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    // delete coupon
    public async deletCoupon() {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.delete(`/V1/carts/mine/coupons`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }


    // get data have to remove
    public async getProfileInfo() {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.get('/V1/customers/me', { headers })
            console.log("get customer info", response);

            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getSourcePincode(pincode) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`/V1/source-mapping/get-source?pincode=${pincode}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getSources() {
        try {
            const headers = await this.defaultHeaders(false)
            const params = {
                'searchCriteria[pageSize]': 0,
            }
            const response = await axios.get(`/V1/inventory/sources`, { headers, params })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getInventorySourceItems(sourceCode) {
        try {
            const headers = await this.defaultHeaders(false)
            const params = {
                'searchCriteria[filterGroups][0][filters][0][field]': 'source_code',
                "searchCriteria[filterGroups][0][filters][0][value]": sourceCode ? sourceCode : "560050",
                'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
            }
            const response = await axios.get(`/V1/inventory/source-items`, { headers, params })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getOrderId(useWalletBalance) {
        try {
            const headers = await this.defaultHeaders(true)
            const params: any = {
                use_wallet: useWalletBalance,
            }
            const response = await axios.get(`/V1/customers/orderId`, { params, headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    // /V1/carts/mine/payment-methods
    public async getPaymentMethods() {
        try {
            const headers = await this.defaultHeaders(true)
            const response = await axios.get(`/V1/carts/mine/payment-methods`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    async updateCustomPaymentInfo(data: any) {
        const headers = await this.defaultHeaders(true);
        try {
          console.log(data);
          const response = await axios.post("V1/save-custom-razorpay", data, {
            headers,
          });
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
    // Guest carts

    public async getGuestUserToken() {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post('/V1/guest-carts', null, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError
            }
        }
    }

    public async addToGuestCart(data) {
        try {
            const headers = await this.defaultHeaders(false)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            data.cartItem.quote_id = tokens
            const response = await axios.post(`/V1/guest-carts/${tokens}/items`, data, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError
            }
        }
    }

    public async getGuestCartItems() {
        try {
            const headers = await this.defaultHeaders(false)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.get(`/V1/guest-carts/${tokens}/items`, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError
            }
        }
    }

    public async getGuestCartSummary() {
        try {
            const headers = await this.defaultHeaders(false)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.get(`V1/guest-carts/${tokens}/totals`, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError   
            }
        }
    }

    public async deleteProductFromGuestCart(itemid) {
        try {
            const headers = await this.defaultHeaders(false)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.delete(`/V1/guest-carts/${tokens}/items/${itemid}`, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError
            }
        }
    }

    public async deleteProductInGuestCart(itemid) {
        try {
            const headers = await this.defaultHeaders(false)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.delete(`/V1/guest-carts/${tokens}/items/${itemid}`, {
                headers,
            })
            return response.data
        } catch (error) {
            const processedError = this.processError(error)
            if (processedError) {
                throw processedError
            }
        }
    }
    public async updateProductInGuestCart(data, itemId) {
        try {
            const id = String(itemId)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            data.cartItem.quote_id = tokens
            const headers = await this.defaultHeaders(true)
            const response = await axios.put(`/V1/guest-carts/${tokens}/items/${id}`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }

    }
    public async applyGuestCartCoupon(couponCode) {
        try {
            const headers = await this.defaultHeaders(true)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.put(`/V1/guest-carts/${tokens}/coupons/${couponCode}`, null, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    //getGuestCouponCode
    public async getGuestCouponCode() {
        try {
            const headers = await this.defaultHeaders(true)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.get(`/V1/guest-carts/${tokens}/coupons`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    //deletGuestCoupon
    public async deletGuestCoupon() {
        try {
            const headers = await this.defaultHeaders(true)
            const tokens = await this.preferences.getItem(constants.GUEST_USER_TOKEN)
            const response = await axios.delete(`/V1/guest-carts/${tokens}/coupons`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getRelevantProductsName(productName: string) {
        try {
            const headers = await this.defaultHeaders(false)
            const params = {
                'searchCriteria[filterGroups][0][filters][0][field]': 'name',
                'searchCriteria[filterGroups][0][filters][0][value]': productName,
                'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
            }
            const response = await axios.get(`/V1/products`, { headers, params })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getRelavantProductsDetails(productRelevantSku: any) {
        try {
            const headers = await this.defaultHeaders(false)
            let params = ''
            productRelevantSku.map((product: any, index: any) => {
                params += `searchCriteria[filterGroups][0][filters][${index}][field]=sku&
          searchCriteria[filterGroups][0][filters][${index}][value]=${product}&`
            })
            const response = await axios.get(`/V1/products?${params}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getIWantStrings(id) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`https://shopadmin.hapdaily.com/hatsun_content/index.php/wp-json/wp/V2/posts?categories=${id}&per_page=100`, { headers })
            console.log(response,"cleaning")
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async sendEmailOnSubmit(data: any) {
        try {
            const headers: any = {};
            headers['Content-Type'] = 'application/json'
            const response = await axios.post('/V1/email/sendemail', data, { headers })
            return response.data
        } catch (error) {
            throw error
        }
    }
    public async getRecentProductsId(userId:any) {
        try {
          const headers = await this.defaultHeaders(true);
          const params = {
            "customer_id":userId
          };
          
          let bodyFormData = new FormData();
          bodyFormData.append('customer_id',userId);
      
          const response = await axios.post(`/V1/recently-viewed-product`,bodyFormData);
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
        public async createRecentProducts(productId:any,userId:any) {
          try {
            const headers = await this.defaultHeaders(true);
      
            const body=JSON.stringify({
              product : {
                customer_id:userId,
                product_id:productId
              } 
            })
            const response = await axios.post(`/V1/view-product`,body,{headers});
            return response
          }catch (error) {
            const processError = this.processError(error);
            if (processError) {
              throw processError;
            } 
          
          }
        }
        public async getRecentProductsDetails(id: any) {
            try {
              const headers = await this.defaultHeaders(false);
              const params = {
                "searchCriteria[filterGroups][0][filters][0][field]": "entity_id",
                "searchCriteria[filterGroups][0][filters][0][value]": id,
                "searchCriteria[filterGroups][0][filters][0][conditionType]": "eq",
              };
              const response = await axios.get("/V1/products", { headers, params });
              return response.data;  
            } catch (error) {  
              const processError = this.processError(error);
              if (processError) {
                throw processError;
              }
            }
          }
          async getTimeToCancel(){
            try {
              const response: any = await axios.get("/V1/get-time-to-cancel");
              return response.data;
            } catch (error) {
              const processError = this.processError(error);
              if (processError) {
                throw processError;
              }
            }
           }
    public async getLatLongByPincode(data: any) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=in ${data.pincode}`)
            return response.data
        } catch (error) {
            throw error
        }
    }

    public async getAddressByLatLng(data: any) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.lat}&lon=${data.lng}`)
            return response.data
        } catch (error) {
            throw error
        }
    }
   
      async getRelevantAddresses(value:any){
        try {
          const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php?key=pk.5884129f7147ad6bbbec5a991367cecd&q=${value}&viewbox=80.2%2C12.98333333%2C80.31666667%2C13.15&bounded=1&limit=5&countrycodes=in`)
          
          return response.data
        } catch (error) {
          throw error
        }
      }
    public async checkWalletbalance(data: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post(`/V1/wallet/checkbalance`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async updateWalletBalance(data: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post(`/V1/wallet/updatebalance`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getOrderIdForWallet(data: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.post(`/V1/customers/balance`, data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async addCustumization(data: any) {
        try {
            const headers = await this.defaultHeaders(true);
            const response = await axios.post('/V1/customization', data, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    async saveLatLng(data: any) {
        try {
          const headers = await this.defaultHeaders(true);
         const body=JSON.stringify({
          object:{
            ...data
          }
         })
         console.log(data,"---save-lat-data")
          const response = await axios.post(`V1/save-lat-long`,body,{headers})
          return response
        } catch (error) {
          throw error
        }
      }
      public async postOrderDetails(orderId:any,storeId:any) {
    
        try {
          const headers = await this.defaultHeaders(false)
          const body=JSON.stringify({
            order_id:orderId,
            source_code:storeId,
          })
          console.log("body",body);
          const response = await axios.post(`/V1/setsource`,body,{headers})     
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
    public async getBlogCategaries() {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get('https://prodbackend.chopserve.com/cs-content/index.php/wp-json/wp/V2/tags', { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getBlogDetails(tag: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`https://prodbackend.chopserve.com/cs-content/index.php/wp-json/wp/V2/posts?filter[tag]=${tag}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getTelyportId(orderId: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`/V1/telyport/gettelyport?order_id=${orderId}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getTelyportOrderDetails(id: any) {
        try {
            const headers: any = {}
            headers['Content-Type'] = 'application/json'
            headers['ApiKey'] = constants.PRODUCTION_TELYPORT_API_KEY
            const response = await axios.get(`https://telyport.com/api/order_details/${id}`, { headers })
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }

    public async getFavouriteItems(id: any) {
        try {
            const headers = await this.defaultHeaders(false)
            const response = await axios.get(`/V1/wishlist/items/${id}`, {headers});
            return response.data
        } catch (error) {
            const processError = this.processError(error)
            if (processError) {
                throw processError
            }
        }
    }
    public async createUserFromGoogle(userData:any){
        try{
          const headers = await this.defaultHeaders(false);
        const response = await axios.post("/V1/sociallogin/userinfo",userData,{ headers })
            return response.data
        }
      catch (error) {
        const processError = this.processError(error);
        if (processError) {
          throw processError;
        }
      }
      }
      public async checkUserFromGoogle(email:any){
        try{
          const headers = await this.defaultHeaders(false);
          const body=JSON.stringify({
            params:{
              email
            }
          })
        const response = await axios.post("/V1/sociallogin/checkmail",body,{ headers })
            return response.data
        }
      catch (error) {
        const processError = this.processError(error);
        if (processError) {
          throw processError;
        }
      }
      }
    public async removeWishListItems(productId:any,userId:any){
        try {
          const headers = await this.defaultHeaders(false);
          const params={
            "customer_id":userId,
           "wishlist_item_id":productId
        }
          const response = await axios.delete(`/V1/wishlist/delete`, {headers,params});
          return response.data;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
      public async removeAllWishListItems(userId:any){
        try { 
          const headers = await this.defaultHeaders(true)
          const params={
            "customer_id":userId
        }
        //@ts-ignore
          const response = await axios.post(`/V1/wishlist/delete/all`,params,{headers});
          return response;
        } catch (error) {
          const processError = this.processError(error);
          if (processError) {
            throw processError;
          }
        }
      }
public async addToWishList(productId:any,id:any) {
    try {
      const headers = await this.defaultHeaders(true);
      const body=JSON.stringify({
        customer_id:id,
        product_id:productId
    }) 
    console.log(body,"wishh")
      const response = await axios.post(`/V1/wishlist/add`,body,{headers});
      console.log(response,"wishh")
      return response
    }catch (error) {
        console.log(error,"wishh")
      const processError = this.processError(error);
      
      if (processError) {
        throw processError;
      }  
    }
}
}
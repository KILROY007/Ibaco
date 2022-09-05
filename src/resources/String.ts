const Strings = {
  /*
    * HOW TO DECLARE THE STRINGS?
    
    - BUTTON TEXT should be prefixed with 'button_'
    - ERROR TEXT should be prefixed with 'error_'
    - MESSAGE TEXT should be prefixed with 'msg_'
    - NAVIGATION TITLE TEXT should be prefixed with 'nav_title_'
    - PLACEHOLDER, LABEL TEXT should be prefixed with 'text_'
    
    */

  //  ***********Alert texts***********

  alert_title: 'Ibaco Says',
  alert_logout_title: 'Logout',
  alert_empty_title: '',
  alert_logged_out:"You've been logged out",
  alert_logged_out_description:`You've been logged out,Please log back in `,
  //1.LOGIN && SIGNUP
  alert_signup_success: 'Sign Up successful. Please enter OTP.',
  alert_phoneNo_valid_success:
    'Phone number update successfully. Please enter OTP.',
  alert_onOtpSend: 'OTP sent to your registered mobile number.',
  alert_login_success: 'Login Successful.',
  alert_onNoUser_found: 'No User found,Please signup.',
  alert_onSend_invalidOTP: 'Please enter a valid OTP.',
  alert_otpVerified_success: 'Otp verified successfully.',
  alert_logout_confirm: 'Do you want to logout ?',

  //2.SHOP
  alert_location_title: 'Location',
  alert_location_permition_denied: 'Permission denied',
  alert_location_gps: 'Please turn on your GPS ',
  alert_location_timeOut: 'Timed out. Please try again ',
  alert_onRemoveItem_onChange_location:
    'Your cart already have items with Different location. Do you want to discard the items and change the location? ',

  //3.CART
  alert_add_item_toCart: 'The item is added to the cart ',
  alert_remove_item_fromCart: 'The item removed from the cart ',
  alert_couponCode_delete_success: 'Coupon deleted successfully',
  alert_invalid_couponCode: 'Invalid coupon code.Try another coupons .',

  //4.ACCOUNT
  alert_addNew_address_forDelivery:
    'New address for delivery added successfully',
  alert_profile_update_success: 'Profile updated successfully',
  alert_confirm_location:"Please make sure that the marker location on map is pointed correctly",
  alert_address_deleted_success:'Address deleted successfully',

  // *************************Button texts************************* /
  button_ok: 'OK',
  button_retry: 'Retry',
  button_save: 'SAVE',

  //1.LOGIN && SIGNUP
  button_logout: 'LOGOUT',
  button_login: 'LOGIN',
  button_signUp: 'SIGN UP',
  button_getOtp: `GET OTP`,
  button_resendOtp: 'RESEND OTP',
  button_edit_phoneNumber: 'EDIT NUMBER',
  button_register: `REGISTER`,
  button_update: `UPDATE`,
  button_verify: `VERIFY`,
  button_google_login: 'LOGIN WITH GOOGLE',

  //2.SHOP
  button_price: 'Sort by price',
  button_buyNow: 'BUY NOW',
  button_decrease: '-',
  button_increase: '+',
  button_add_toCart: 'ADD TO CART',
  button_outOfStock: 'OUT OF STOCK',
  button_add: 'ADD',

  //3.CART
  button_apply_coupon: `APPLY`,
  button_remove_coupon: `REMOVE COUPON`,
  button_checkOut: 'PROCEED TO CHECKOUT',
  button_add_more: '+ ADD MORE',
  button_add_new_address: 'ADD A NEW ADDRESS',
  button_home: 'Home',
  button_delivery: 'Delivery',
  button_pickUp: 'Pick Up',
  button_checkout_deliveryHere: `DELIVER HERE`,
  button_checkout_pickupHere: `PICK UP FROM HERE`,
  button_change: 'CHANGE',
  button_cashON_delivery: 'Cash on delivery',
  button_cashOn_delivery_substring: 'Please keep exact change ready',
  button_payment_getway: 'Payment Gateway',
  button_payment_getway_substring: 'Choose from your preferred payment gateway',
  button_order_placed: 'PLACE ORDER',

  //4.ORDER
  button_bill_details: 'Item(s) details',
  button_order_status: `ORDER STATUS`,
  button_order_cancel: `ORDER CANCELLED`,
  button_reorder: 'REORDER',
  button_help: 'HELP',
  button_review_order: 'REVIEW YOUR ORDER',
  button_no: 'NO',
  button_yes: 'YES',
  button_cancel_ordertracking: 'CANCEL ORDER',
  button_submit: 'SUBMIT',
  button_refunded: 'REFUNDED',

  //5.ACCOUNT
  button_update_address: 'UPDATE ADDRESS',
  button_add_and_deliver: 'Add & Deliver Here',
  button_edit_address: 'EDIT',

  // ******************************Error texts**************************** /
  error_invalid_phoneNo: `Please enter a valid phone number`,
  error_invalid_firstName: `Please enter a firstname `,
  error_invalid_lastName: `Please enter a lastname `,
  error_invalid_empty_email: `Please enter a email `,
  error_invalid_email: `Please enter a valid email `,
  error_invalid_pincode: 'Please enter valid pincode',
  error_store_not_selected:'Please select a store to continue',
  error_invalid_location: 'We are not serving to this location',

  // ************************Placeholder & label texts************************** /
  text_ok: 'OK',
  text_cancel: 'CANCEL',
  //1.LOGIN && SIGN UP
  text_phone_number: 'Phone Number',
  text_otp: 'Enter OTP',
  text_first_name: 'First Name',
  text_last_name: 'Last Name',
  text_email: 'Email',
  text_or: 'or',
  

  //2.SHOP
  text_search: 'Search for your favorite items',
  text_noProduct_found: 'No products found',
  text_short_description: 'short Description',
  text_description: 'Description',
  text_price: 'Price:',
  text_out_of_stock: ' OUT OF STOCK',
  text_people_can_also_brought: 'People who bought this also bought',
  text_recently_viewed: 'Recently viewed products',

  //3.ACCOUNT
  text_edit_address: 'Edit address',
  text_add_new_address: 'Add New Address',
  text_get_location:"Get my current location",
  text_personal_details: 'PERSONAL DETAILS',
  text_gender: 'Gender',
  text_male: 'Male',
  text_femal: 'Female',
  text_others: 'Others',
  text_address_book: 'ADDRESS BOOK',
 //4.FAVOURITE
  text_no_fav_greeting: 'Hey!',
  text_no_fav_askQuestion: 'No favourites added yet',
  text_heart: 'HEART',
  text_add_fav: ' to add your favourites',

  //4.ORDER
  text_no_order_greeting: 'Hi there',
  text_no_order_askQuestion: 'May I take your order please?',
  text_tapOn: 'Tap on ',
  text_shop: 'SHOP',
  text_view_menu: ' to view our menu',
  text_order_delivered: 'Order Delivered',
  text_item_delivered: 'Items delivered',
  text_item_picked: 'Items picked up',
  text_order_item_on_way: 'Items are on the way',
  text_order_recived: 'Order Received',
  text_order_confirm: 'Order Confirmed',
  text_order_onThe_way: 'Order On the way',
  text_order_recived_subTitle: 'Waiting for store to confirm order',
  text_order_confirm_subTitle:
    'Items are being packed and will be delivered shortly at your doorstep',
  text_order_onThe_way_subTitle: 'Our valet is on the way to deliver your order',
  text_order_Delivered_subTitle: 'Enjoy your treat. Have a good day',
  text_order_onthe_way_pickup: 'Items are ready for pickup',
  text_order_confirm_subTitle_pickUp: 'Items are being packed ',
  text_order_onThe_way_subTitle_pickUp: 'Kindly pickup your order from',
  text_order_cancel: ' Order Cancelled',
  text_order_deliver_description:
    'We have successfully delivered your order. Thank you for choosing Ibaco. Have a great day!',
  text_order_cancel_description:
    ' Please reach out to us at ',
  text_contact_details:"ecommerce@ibaco.in",
  text_order_status: 'Order Status',
  text_hurry: 'Hurray',
  text_order_placed: 'Your order has been placed',
  text_delivery_partner: 'Delivery Partner',
  text_call_store: 'Call Store',
  text_cancel_order: 'CANCEL ORDER',
  text_cancel_order_confirmation: 'Are you sure you want to cancel this order?',
  text_delivery_confirm: 'Order has been successfully delivered',
  text_order_id: 'ORDER ID:',
  text_bill_value: 'Bill Value:',
  text_paid_via: 'paid via :-',
  text_cash_on_delivery: 'Cash on Delivery',
  text_online_payment: 'Online Payment',
  text_cancel_order_orderhistry: 'ORDER CANCELLED',
  text_no_order_histry: 'No Order History',
  text_order_tracking: 'Order Tracking',
  text_help_assistance: 'Please let us know what you need assistance with',
  text_help_went_wrong: 'What went wrong?',
  text_help_model_header:
    'We have received your request and we are looking into it, and we shall get back to you at our earliest to serve you on this.',
  text_help_model_header_subtitle:
    'As an organisation, we are always thriving to serve you better, and we hope to do the same in our future endeavours.',
  text_help_thank: 'Thank you once again for choosing Ibaco daily.',
  text_for_queries:'For any related queries you can mail us at : ',
  
  //5.CART
  text_bill_details: 'Bill Details',
  text_item_total: 'Item Total',
  text_delivery_fee: 'Delivery fee',
  text_discount_fee: 'Discount Fee',
  text_taxes_charges: 'Taxes and charges',
  text_packaging:'Packaging charges',
  text_total_pay_amount: 'Total Payable Amount:',
  text_secure_checkout: 'SECURE CHECKOUT',
  text_seure_checkout_login_confirm: 'Log in or Sign Up to place your order',
  text_add_favourites: 'ADD FAVOURITES',
  text_add_favourites_login_confirm: 'Log in or Sign Up to list your favourites',
  text_home: 'Home',
  text_work: 'Work',
  text_others_place: 'Others',
  text_cart_new_address_content: `Locality, Street, City, region Name, country Name, pinCode`,
  text_hours: '',
  text_do_u_want_to_change:"Do you want to change",
  text_cannot_deliver:"We currently do not deliver to the selected location",
  text_store_not_seleted:"Store is not been selected yet",
  text_CHANGE_DEL_ADD:"Delivery Address",
  text_CHANGE_STORE:"Store Location",
  text_select_delivery_location: `Select Delivery Location`,
  text_select_pickup_location: ` Select a Pickup Location`,
  text_loggedIn_as: 'Logged in as',
  text_delivery_to: `Delivery location`,
  text_pickup_from: `Pickup From`,
  text_cart_payment_default_address: `Locality, Street, City, region Name, country Name, pinCode`,
  text_payment: 'Payment',
  text_selet_payment_mode: 'Select Payment Mode',
  text_you_may_also_add: 'You may also add',

  // ***************************Navigation title texts******************************** /
  nav_title_advanced_search: 'Advanced search',
};

export default Strings;
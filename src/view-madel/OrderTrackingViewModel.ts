import {BaseViewModel} from './BaseViewModel';
import {UserRepository} from '../domain/repository/UserRepository';
import {Platform} from 'react-native';
import MapView, {PROVIDER_GOOGLE, AnimatedRegion} from 'react-native-maps';
import {DateUtils} from '../core/DateUtils';
import ImageAssets from '../assets';
import Strings from '../resources/String';
import AsyncStorage from '@react-native-community/async-storage';
import constants from '../resources/constants';

export interface OrderTrackingState {
  isLoading: boolean;
  itemSelected: string;
  radioItem: any[];
  radioItem2: any[];
  radioValue: string;
  showPopUp: boolean;
  showCancelBtn: boolean;
  name: string;
  phoneNumber: string;
  currentPage: number;
  timeToCancel: number;
  minutes: any;
  seconds: any;
  trackingState: any;
  response: any;
  shouldShowOrderPlacedState: boolean;
  shouldShowOrderState: boolean;
  refreshing: boolean;
  onSuccess: boolean;
  isOrderCancelled: boolean;
  addresstype: boolean;
  telyportTrackableId: any;
  error?: Error;
}

export class OrderTrackingViewModel extends BaseViewModel {
  private dateUtils = new DateUtils();
  protected state: OrderTrackingState;
  constructor(private userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
    this.state = this.defaultState();
  }

  protected defaultState() {
    return {
      isLoading: false,
      itemSelected: 'first',
      radioItem: [
        {
          Title: Strings.text_order_recived,
          subTitle: Strings.text_order_recived_subTitle,
          value: '1',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
        {
          Title: Strings.text_order_confirm,
          subTitle: Strings.text_order_confirm_subTitle,
          value: '2',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
        {
          Title: Strings.text_order_item_on_way,
          subTitle: Strings.text_order_onThe_way_subTitle,
          value: '3',
          radioImage: ImageAssets.order_tracking_radiobutton_itemOnWay,
        },
        {
          Title: Strings.text_item_delivered,
          subTitle: Strings.text_order_Delivered_subTitle,
          value: '4',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
      ],
      radioItem2: [
        {
          Title: Strings.text_order_recived,
          subTitle: Strings.text_order_recived_subTitle,
          value: '1',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
        {
          Title: Strings.text_order_confirm,
          subTitle: Strings.text_order_confirm_subTitle_pickUp,
          value: '2',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
        {
          Title: Strings.text_order_onthe_way_pickup,
          subTitle: Strings.text_order_onThe_way_subTitle_pickUp,
          value: '3',
          radioImage: ImageAssets.order_tracking_radiobutton_itemOnWay,
        },
        {
          Title: Strings.text_item_picked,
          subTitle: Strings.text_order_Delivered_subTitle,
          value: '4',
          radioImage: ImageAssets.order_tracking_radiobutton_complete,
        },
      ],
      addresstype: false,
      currentPage: 0,
      radioValue: '1',
      showPopUp: false,
      name: '',
      phoneNumber: '',
      trackingState: '',
      response: undefined,
      timeToCancel: 5,
      shouldShowOrderPlacedState: false,
      showCancelBtn: false,
      refreshing: false,
      shouldShowOrderState: false,
      onSuccess: false,
      isOrderCancelled: false,
      error: undefined,
      telyportTrackableId: '',
    };
  }
  public async loadData(id: any) {
    const OrderItem = await this.userRepository.orderByPaymentId(id);
    const createdAt =
      this.dateUtils.format(OrderItem.created_at, 'DD MMMM YYYY') +
      ' ' +
      this.dateUtils.format(OrderItem.created_at, 'hh:mm:ss A');
    this.orderCountdown(createdAt);
    const response = await this.userRepository.getTrackingId(id);
    if (response.length > 0) {
      this.getRegularStatus(response[0].tracking_id);
    }
  }
  orderCountdown = async (createdAt: any) => {
    let countDownDate = new Date(createdAt).getTime();
    let time = await this.userRepository.getTimeToCancel();
    //@ts-ignore
    let x = setInterval(() => {
      let now = new Date().getTime();

      let distance = now - countDownDate;
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (minutes >= time) {
        clearInterval(x);
        this.setState({...this.state, showCancelBtn: false});
      } else {
        this.setState({
          timeToCancel: time,
          minutes: time - 1 - minutes,
          seconds: 60 - seconds < 10 ? '0' + (60 - seconds) : 60 - seconds,
          showCancelBtn: true,
        });
      }
    }, 1000);
  };
  getRegularStatus = async (trackId: any) => {
    const status = await this.userRepository.getOrderStatus(trackId);
    if (status[0].state) {
      this.setState({
        ...this.state,
        // trackingState: status[0].state,
        trackingState: status[0].state,
      });
    }
  };
  public async getOrderTrackingUpdate(id: any) {
    try {
      let currentPage;
      let radioValue;
      let shouldShowOrderState = false;
      let OrderItemresponse;
      let name="";
      let phoneNumber="";
      let isOrderCancelled=false;
      let onSuccess = false;
      this.setState({
        ...this.state,
        isLoading: true,
        loadError: undefined,
      });
      if (this.state.addresstype) {
        const response = await this.userRepository.getTrackingId(id);
        if (response.length > 0) {
          OrderItemresponse = await this.userRepository.getOrderStatus(
            response[0].tracking_id,
          );
          if(OrderItemresponse[0].runner){
          name=OrderItemresponse[0].runner.name;
          phoneNumber=OrderItemresponse[0].runner.phone_number;}
          switch (OrderItemresponse[0].state) {
            case 'created':
            case 'queued':
              currentPage = 0;
              radioValue = 1;
              break;
              case 'runner_accepted':
              case 'reached_for_pickup':
            case 'pickup_complete':
              currentPage = 1;
              radioValue = 2;
              break;
            case 'started_for_delivery':
            case 'reached_for_delivery':
              currentPage = 2;
              radioValue = 3;
              shouldShowOrderState = false;
              break;
            case 'runner_cancelled':
              currentPage = 0;
              radioValue = 1;
              break;
            case 'delivered':
              currentPage = undefined;
              radioValue = undefined;
              shouldShowOrderState = true;
              onSuccess = true;
              break;
            case 'cancelled':
              isOrderCancelled=true;
              break;
            default:
              currentPage = 0;
              radioValue = 1;
              break;
              
          }
        } else {
          OrderItemresponse = await this.userRepository.orderByPaymentId(
            id,
            this.state.addresstype,
          );
          if (OrderItemresponse.status === 'pending') {
            currentPage = 0;
            radioValue = 1;
          } else if (OrderItemresponse.status === 'processing') {
            currentPage = 1;
            radioValue = 2;
          } else if (OrderItemresponse.status === 'awaiting_pickup') {
            currentPage = 1;
            radioValue = 2;
          } else if (OrderItemresponse.status === 'picked_up') {
            currentPage = 2;
            radioValue = 3;
            shouldShowOrderState = false;
          } else if (OrderItemresponse.status === 'complete') {
            currentPage = undefined;
            radioValue = undefined;
            shouldShowOrderState = true;
            onSuccess = true;
          } else {
            currentPage = 0;
            radioValue = 1;
          }
        }
      } else {
        OrderItemresponse = await this.userRepository.orderByPaymentId(
          id,
          this.state.addresstype,
        );
        if (OrderItemresponse.state === 'new') {
          currentPage = 0;
          radioValue = 1;
        } else if (OrderItemresponse.state === 'processing') {
          if (OrderItemresponse.status === 'picked_up') {
            currentPage = 2;
            radioValue = 3;
          } else {
            currentPage = 1;
            radioValue = 2;
          }
          shouldShowOrderState = false;
        } else if (OrderItemresponse.state === 'complete') {
          if (OrderItemresponse.status === 'picked_up') {
            currentPage = 2;
            radioValue = 3;
            shouldShowOrderState = false;
          } else {
            currentPage = undefined;
            radioValue = undefined;
            shouldShowOrderState = true;
            onSuccess = true;
          }
        } else {
          currentPage = 0;
          radioValue = 1;
        }
      }
      this.setState({
        ...this.state,
        isLoading: false,
        currentPage,
        radioValue,
        name,
        phoneNumber,
        isOrderCancelled,
        shouldShowOrderState,
        onSuccess,
        response: OrderItemresponse,
        loadError: undefined,
      });
    } catch (error) {
      // await this.getTelyportId(OrderItemresponse.increment_id);
      this.setState({
        ...this.state,
        error,
        isLoading: false,
      });
    }
  }

  public async cancelOrder(id) {
    try {
      this.setState({
        ...this.state,
        isLoading: true,
        loadError: undefined,
      });
      const track = await this.userRepository.getTrackingId(id);
      let task_id = '';
      if (track.length > 0) {
        task_id = track[0].tracking_id;
      }
      const data = JSON.stringify({
        param: {
          task_id,
          order_id: id,
          cancellation: {
            cancellation_reason: 'Changed my mind',
          },
        },
      });
      const response = await this.userRepository.cancelOrder(data);

      this.setState({
        ...this.state,
        isLoading: false,
        isOrderCancelled: response,
        loadError: undefined,
      });
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }

  public async getTelyportId(orderId) {
    try {
      const response = await this.userRepository.getTelyportId(orderId);
      if (response) {
        const res = await this.userRepository.getTelyportOrderDetails(response);
        this.setState({
          ...this.state,
          isLoading: false,
          telyportTrackableId: res && res.data ? res.data.trackableID : '',
        });
      }
    } catch (error) {
      this.setState({
        ...this.state,
        isLoading: false,
        error,
      });
    }
  }
}
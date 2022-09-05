import { BaseViewModel } from './BaseViewModel'
import { UserRepository } from '../domain/repository/UserRepository'
import { Platform } from 'react-native'

export interface UserWalletState {
    isLoading: boolean,
    walletBalance: string,
    paymentChoose: string,
    updatedBalance: string
    amountArrayIs: any[],
    userInfo:any,
    response: any,
    error?: Error,
    alertDetails: any,
    refreshing: boolean,
}

export class UserWalletViewModel extends BaseViewModel {

    protected state: UserWalletState

    constructor(private userRepository: UserRepository) {
        super()
        this.state = this.defaultState()
    }

    protected defaultState() {
        return {
            isLoading: false,
            walletBalance: '250',
            paymentChoose: '250',
            updatedBalance: '500',
            amountArrayIs: [
                { price: '250' }, { price: '500' }, { price: '1000' }
            ],
            response: undefined,
            userInfo:{},
            error: undefined,
            alertDetails: undefined,
            refreshing: false,
        }
    }

    public async checkWalletbalance() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            });
            const response = await this.userRepository.checkWalletbalance();
            let {userInfo}=this.state
            const loggedInUser = await this.getProfileInfo();
            userInfo.name=loggedInUser.firstname
            userInfo.email=loggedInUser.email
            this.userRepository.set('walletBalance', response[response.length - 1])
            loggedInUser.custom_attributes.length &&
            loggedInUser.custom_attributes.map((item, index) => {
            if (item.attribute_code === 'phone_number') {
            userInfo.phone_number = item.value;
                }
      });
            this.setState({
                ...this.state,
                isLoading: false,
                userInfo,
                walletBalance: response[response.length - 1],
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
            })

            const loggedInUser = await this.getProfileInfo()

            const reqbody = {
                user_id: loggedInUser.id,
                amount: this.state.updatedBalance,
                rzp_order: rzpOrder,
                razorpay_signature: data.razorpay_signature,
                razorpay_payment_id: data.razorpay_payment_id,
                module: 'wallet',
            }

            const response = await this.userRepository.updateWalletBalance(reqbody)
            this.userRepository.set('walletBalance', response[response.length - 1])
            this.setState({
                ...this.state,
                isLoading: false,
                walletBalance: response[response.length - 1],
                response: response[1],
            })
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                error,
            });
        }
    }

    public async getOrderIdForWallet() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const amount = Number(this.state.updatedBalance) * 100
            const response = await this.userRepository.getOrderIdForWallet(amount)
            this.setState({
                ...this.state,
                isLoading: false,
            });
            return response[0]
        } catch (error) {
            this.setState({
                ...this.state,
                isLoading: false,
                loadError: error,
            });
        }
    }

    public async getProfileInfo() {
        const loggedInUser = await this.userRepository.getState().loggedInUser
        return loggedInUser
    }
}
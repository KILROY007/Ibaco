import { BaseViewModel } from './BaseViewModel'
import { UserRepository } from '../domain/repository/UserRepository'
import { Platform } from 'react-native'
import { CartRepository } from '../domain/repository/CartRepository'
import { HelpCategoriesEnum } from '../domain/enumerations/HelpCategoriesEnum'

export interface HelpState {
    iwantToItems: any,
    iwantResponse: any,
    selectedHeaderIndex: number,
    error?: Error,
    alertDetails: any,
    isLoading: boolean,
    openSubmitModal: boolean,
    enableSubmit: boolean,
    othersText: string,
    selectedHeader: string,
    selectedOption: string
}

export class HelpViewModel extends BaseViewModel {

    protected state: HelpState

    constructor(private userRepository: UserRepository) {
        super()
        this.state = this.defaultState()
    }

    protected defaultState() {
        return {
            iwantToItems: [],
            iwantResponse: [],
            selectedHeaderIndex: 0,
            error: undefined,
            alertDetails: undefined,
            isLoading: false,
            openSubmitModal: false,
            enableSubmit: false,
            othersText: '',
            selectedHeader: '',
            selectedOption: '',
        }
    }

    public async getIWantStrings() {
        try {
            this.setState({
                ...this.state,
                isLoading: true,
            })
            const responses: any = []
            const data = [HelpCategoriesEnum.COMPLAINID, HelpCategoriesEnum.RETURNID, HelpCategoriesEnum.REFUNDID]
            const iwantResponse = await this.userRepository.getIWantStrings(HelpCategoriesEnum.WANTID)
            for (const id of data) {
                const res = await this.userRepository.getIWantStrings(id)
                const newResponse = res.reverse()
                newResponse.isActive = false
                responses.push(newResponse)

            }
            setTimeout(() => {
                this.setState({
                    ...this.state,
                    isLoading: false,
                    iwantToItems: responses,
                    iwantResponse,
                })
            }, 1000)
        } catch (error) {
            this.setState({
                ...this.state,
                pageLoadError: error,
                isLoading: false,
            })
        }

    }

    sendEmailOnSubmit = async (selectedOrder) => {
        try {
            this.setState({ ...this.state, isLoading: true })
            const data = {
                param: {
                    email: selectedOrder.customer_email,
                    orderId: selectedOrder.increment_id,
                    heading: this.state.selectedHeader,
                    option: this.state.selectedOption,
                },
            }
            const response = await this.userRepository.sendEmailOnSubmit(data)
            this.setState({ ...this.state, isLoading: false, openSubmitModal: true })

        } catch (error) {
            this.setState({ ...this.state, isLoading: false })
        }
    }

}

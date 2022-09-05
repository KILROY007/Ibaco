import ImageAssets from "../../assets"

export enum AddressTypeEnum {
    'Home' = 'Home',
    'Work' = 'Work',
    'Others' = 'Others',
}

export class AddressTypeEnumArray {

    public static getAddressTypeEnumArray() {
        const options = [
            {
                id: 0,
                title: AddressTypeEnum.Home,
                isActive: true,
                imageSrc: ImageAssets.home_white,
            },
            {
                id: 1,
                title: AddressTypeEnum.Work,
                isActive: false,
                imageSrc: ImageAssets.work_dark,
            },
            {
                id: 2,
                title: AddressTypeEnum.Others,
                isActive: false,
                imageSrc: ImageAssets.others,
            },
        ]
        return options
    }
}

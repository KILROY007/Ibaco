export class ValidationUtils {
    public isNameValid(name:string){
        const regX = new RegExp(/^[a-zA-Z\s]+$/);
        return regX.test(name);
       }
       public isMobileNumberValid(ph: string) {
        const regX = new RegExp(/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/);
        return regX.test(ph);
    }
    isValidPincode(pincode: string) {
        const regX = new RegExp(/^[0-9]{6,6}$/)
        return regX.test(pincode)
    }
    isEmpty(str: string) {
        return (str.length === 0) ? true : false
    }
    isEmailValid(email: string) {
        const regX = new RegExp(/^[a-zA-Z0-9_]+(\.[_a-zA-Z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/)
        return regX.test(email)
    }
}
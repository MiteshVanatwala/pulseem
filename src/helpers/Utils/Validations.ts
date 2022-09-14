export class Validation {
    Email(value: string) {
        if (value === '' || value === undefined) {
            return false;
        }
        return value?.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\-0-9]{2,}))$/)
    }

    Phone(value: string) {
        if (value === '' || value === undefined) {
            return false;
        }
        const phoneRegex = /^[0-9-]+$/
        return phoneRegex.test(value)
    }
}
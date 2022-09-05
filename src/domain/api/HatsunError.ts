export class HatsunError extends Error {

    constructor(message, public code: Number) {
        super(message)
    }
}
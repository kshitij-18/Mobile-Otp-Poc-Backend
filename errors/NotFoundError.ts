interface IErrorType {
    message: string,
    code: number,
}

export class NotFoundError extends Error {
    public code;
    constructor (params: IErrorType) {
        super(params.message);
        this.code = params.code;
    }
};
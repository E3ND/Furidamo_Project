export interface IGetToken {
    getToken: (params: IGetToken.Params) => IGetToken.Response;
}

export namespace IGetToken {
    export type Params = {
        id: string,
        name: string,
        email: string,
        iat: number,
        exp: number,
    }

    export type Response = Promise<IGetToken.Params>;
}
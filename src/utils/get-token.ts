import { IGetToken } from "src/auth"

export function getToken(req:any) {
    const userToken:IGetToken.Params = {
        id: req['user'].id,
        name: req['user'].name,
        email: req['user'].email,
        iat: req['user'].iat,
        exp: req['user'].exp
    }
    
    return userToken
}
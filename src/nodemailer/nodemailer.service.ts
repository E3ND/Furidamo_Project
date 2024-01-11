import * as nodemialer from 'nodemailer'
import { NodeMail } from './contract/nodemial.type';

const transporter = nodemialer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass:  process.env.PASSWORD_EMAIL,
    },
})

export class NodeMailerService {
    constructor() {}

    async sendMail(params: NodeMail.Params) {
        await transporter.sendMail({
            from: params.emailService, 
            to: params.emailUser, 
            subject: params.bodySubject, 
            text: params.body,
            html: params.html 
        });
    }
}
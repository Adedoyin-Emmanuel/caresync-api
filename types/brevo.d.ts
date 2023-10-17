// types/brevo.d.ts

declare module "@getbrevo/brevo" {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      "api-key": {
        apiKey: string;
      };
    };
  }

  export class SendSmtpEmail {
    subject: string;
    htmlContent: string;
    sender: {
      name: string;
      email: string;
    };
    to: {
      email: string;
      name: string;
    }[];
    replyTo: {
      email: string;
      name: string;
    };
    headers: {
      [key: string]: string;
    };
    params: {
      [key: string]: string;
    };
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }
}

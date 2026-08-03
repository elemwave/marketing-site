/** Port for delivering a confirmation code to a visitor's email. */
export interface CodeSender {
  send(email: string, code: string): Promise<void>;
}

/** Mock delivery: logs to the server console instead of sending an email. */
export class MockCodeSender implements CodeSender {
  async send(email: string, code: string): Promise<void> {
    console.log("[booking mock email] code %s for %s", code, email);
  }
}

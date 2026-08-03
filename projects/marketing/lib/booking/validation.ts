import { CODE_LENGTH } from "./constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email);

export const isValidCode = (code: string) =>
  new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code);

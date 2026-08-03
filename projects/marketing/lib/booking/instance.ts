import { MockCodeSender } from "./code-sender";
import { BookingService } from "./service";
import { InMemoryCodeStore } from "./store";

/** Server-side singleton used by the API route handlers. */
export const bookingService = new BookingService(
  new InMemoryCodeStore(),
  new MockCodeSender(),
);

/**
 * Shared `react-calendly` mock for a test that needs to close the popup
 * itself — `BookingModalProvider.test.tsx` and `NavToggle.test.tsx` both
 * drive the "Close calendly" button to assert what happens once the booking
 * dialog closes. `vi.mock`'s factory is hoisted, so importing it here keeps
 * both call sites identical without duplicating the block.
 */
export function calendlyPopupWithCloseButton() {
  return {
    PopupModal: ({ onModalClose }: { onModalClose: () => void }) => (
      <div data-testid="calendly">
        <button onClick={onModalClose}>Close calendly</button>
      </div>
    ),
  };
}

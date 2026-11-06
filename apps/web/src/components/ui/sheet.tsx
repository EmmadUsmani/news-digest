import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from './button';

export function Sheet({
  trigger,
  children,
  title = 'News Digest admin',
  onCloseAutoFocus,
}: {
  trigger: ReactNode;
  title?: string;
  children: ReactNode;
  onCloseAutoFocus?: Dialog.DialogContentProps['onCloseAutoFocus'];
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-[var(--surface)] p-6 shadow-xl"
        >
          <Dialog.Title className="mt-0 font-sans text-lg font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              aria-label="Close menu"
            >
              <X />
            </Button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export const SheetClose = Dialog.Close;

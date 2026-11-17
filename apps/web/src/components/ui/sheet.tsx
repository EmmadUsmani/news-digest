import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from './button';

export function Sheet({
  trigger,
  children,
  title = 'News Digest admin',
  onCloseAutoFocus,
  onOpenAutoFocus,
  onOpenChange,
}: {
  trigger: ReactNode;
  title?: string;
  children: ReactNode;
  onCloseAutoFocus?: Dialog.DialogContentProps['onCloseAutoFocus'];
  onOpenAutoFocus?: Dialog.DialogContentProps['onOpenAutoFocus'];
  onOpenChange?: Dialog.DialogProps['onOpenChange'];
}) {
  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          onOpenAutoFocus={onOpenAutoFocus}
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-full flex-col overflow-hidden bg-[var(--surface)] shadow-xl"
        >
          <div className="relative shrink-0 px-[24px] py-[24px]">
            <Dialog.Title className="m-0 pr-[44px] font-sans text-lg font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-[12px] right-[12px] size-[44px] min-h-[44px] min-w-[44px] [&_svg]:size-[20px]"
                aria-label="Close menu"
              >
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 overflow-y-auto px-[24px] pb-[24px]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export const SheetClose = Dialog.Close;

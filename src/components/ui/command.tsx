import * as React from 'react';
import * as CommandPrimitive from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command
      ref={ref}
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground', className)}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.Command.displayName;

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command.Input>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command.Input>>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Command.Input
        ref={ref}
        className={cn('flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground', className)}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = CommandPrimitive.Command.Input.displayName;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command.List ref={ref} className={cn('max-h-64 overflow-y-auto', className)} {...props} />
  )
);
CommandList.displayName = CommandPrimitive.Command.List.displayName;

const CommandEmpty = CommandPrimitive.Command.Empty;
const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command.Group ref={ref} className={cn('overflow-hidden px-2 py-3 text-xs font-medium text-muted-foreground', className)} {...props} />
  )
);
CommandGroup.displayName = CommandPrimitive.Command.Group.displayName;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command.Item
      ref={ref}
      className={cn('flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground', className)}
      {...props}
    />
  )
);
CommandItem.displayName = CommandPrimitive.Command.Item.displayName;

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Command.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command.Separator>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command.Separator ref={ref} className={cn('-mx-1 h-px bg-border', className)} {...props} />
  )
);
CommandSeparator.displayName = CommandPrimitive.Command.Separator.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut };

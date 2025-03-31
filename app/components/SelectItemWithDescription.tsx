import React from "react";
import { SelectItem } from "@/components/ui/select";

interface SelectItemWithDescriptionProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
  description?: string;
}

const SelectItemWithDescription = React.forwardRef<HTMLDivElement, SelectItemWithDescriptionProps>(
  ({ value, children, description, ...props }, ref) => {
    return (
      <SelectItem value={value as string} ref={ref} {...props}>
        <div>
          <div>{children}</div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </SelectItem>
    );
  }
);
SelectItemWithDescription.displayName = 'SelectItemWithDescription';

export default SelectItemWithDescription; 
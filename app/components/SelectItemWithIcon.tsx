import React from "react";
import { SelectItem } from "@/components/ui/select";
import Image from "next/image";

interface SelectItemWithIconProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
  icon?: string;
}

const SelectItemWithIcon: React.FC<SelectItemWithIconProps> = ({ 
  children, 
  icon,
  ...props 
}) => {
  return (
    <SelectItem {...props}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex items-center justify-center w-5 h-5">
            <Image 
              src={icon} 
              alt={`${children} icon`} 
              width={20} 
              height={20}
              className="max-w-full max-h-full"
            />
          </div>
        )}
        <span>{children}</span>
      </div>
    </SelectItem>
  );
};

export default SelectItemWithIcon; 
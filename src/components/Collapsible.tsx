"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronsUpDown } from "lucide-react";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface PropsBasedCollapsibleProps {
  trigger: string;
  makeTriggerParagraph?: boolean;
  children: React.ReactNode;
}

const PropsBasedCollapsible = ({
  trigger,
  makeTriggerParagraph = true,
  children,
}: PropsBasedCollapsibleProps) => {
  return (
    <Collapsible>
      <p>
        <CollapsibleTrigger>
          {trigger} <ChevronsUpDown className="h-4 w-4" />
        </CollapsibleTrigger>
      </p>
      <CollapsibleContent className="mb-4 border-2 px-5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  PropsBasedCollapsible,
};

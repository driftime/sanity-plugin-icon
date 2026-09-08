import { CloseIcon } from "@sanity/icons/Close";
import { Button, Flex } from "@sanity/ui";
import { useState } from "react";
import type { ObjectInputProps } from "sanity";
import { set, setIfMissing, unset } from "sanity";

import { Drawing } from "@/components/drawing";
import { Picker } from "@/components/picker/picker";
import { defaultIconProps } from "@/config/defaults";
import type { LibraryIcon } from "@/lib/library";
import { resolveIconNode, serialiseIconNode } from "@/lib/nodes";
import { convertCase, isDefined } from "@/lib/utils";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

export type InputProps = ObjectInputProps<Partial<SanityIcon>>;

export function Input({ id, value, onChange, readOnly }: InputProps) {
  const { name, node } = value ?? {};

  const [open, setOpen] = useState(false);

  const selectedNode = resolveIconNode(node);
  const selectedLabel = isDefined(name) ? convertCase(name, "sentence") : undefined;

  function handleSelect(icon: LibraryIcon) {
    onChange([
      setIfMissing({ _type: iconTypeName satisfies SanityIcon["_type"] }),
      set(icon.name, ["name" satisfies keyof SanityIcon]),
      set(serialiseIconNode(icon.node), ["node" satisfies keyof SanityIcon]),
    ]);

    setOpen(false);
  }

  return (
    <Flex gap={2}>
      <Button
        id={id}
        type="button"
        mode="ghost"
        icon={isDefined(selectedNode) ? <Drawing node={selectedNode} {...defaultIconProps} /> : undefined}
        text={selectedLabel ?? "Select icon"}
        disabled={readOnly}
        onClick={() => {
          setOpen(true);
        }}
        aria-label={isDefined(selectedLabel) ? `${selectedLabel} currently selected` : "Select icon"}
      />
      {isDefined(value) && (
        <Button
          type="button"
          mode="ghost"
          tone="critical"
          icon={<CloseIcon {...defaultIconProps} />}
          text="Clear"
          disabled={readOnly}
          onClick={() => {
            onChange(unset());
          }}
          aria-label="Clear the currently selected icon."
        />
      )}
      {open && (
        <Picker
          id={`${id}-library`}
          selected={name}
          onSelect={handleSelect}
          onClose={() => {
            setOpen(false);
          }}
          onClickOutside={() => {
            setOpen(false);
          }}
        />
      )}
    </Flex>
  );
}

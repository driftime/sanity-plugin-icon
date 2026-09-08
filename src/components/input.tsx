import { CloseIcon } from "@sanity/icons/Close";
import { Button, Flex } from "@sanity/ui";
import { useState } from "react";
import type { ObjectInputProps, ObjectSchemaType } from "sanity";
import { set, setIfMissing, unset } from "sanity";

import { Drawing } from "@/components/drawing";
import { Picker } from "@/components/picker/picker";
import { defaultIconProps } from "@/config/defaults";
import type { LibraryIcon } from "@/lib/library";
import { resolveIconNode, serialiseIconNode } from "@/lib/nodes";
import { convertCase, isDefined } from "@/lib/utils";
import type { SanityIconName, SanityIconOptions } from "@/plugin";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

/** Compiled shape of an icon field, carrying the options the field itself was given. */
interface IconSchemaType extends ObjectSchemaType {
  options?: SanityIconOptions;
}

export type InputProps = ObjectInputProps<Partial<SanityIcon>, IconSchemaType>;

/**
 * Creates the input an icon field is drawn with, holding the icons the plugin was configured with so
 * a field naming its own replaces them rather than adding to them.
 *
 * @param icons - Icons every field offers, or nothing to offer them all.
 * @returns The input component.
 */
export function createInput(icons?: SanityIconName[]) {
  function Input({ id, schemaType, value, onChange, readOnly }: InputProps) {
    const { name, node } = value ?? {};

    const [open, setOpen] = useState(false);

    const allowed = schemaType.options?.icons ?? icons;
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
            allowed={allowed}
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

  return Input;
}

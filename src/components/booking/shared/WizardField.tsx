"use client";

// ─── VanJet · Wizard Field ────────────────────────────────────
// Consistent field wrapper using Chakra v3 Field components.
// Supports shake animation on error and premium sizing.

import { type ReactNode } from "react";
import { Field, Box } from "@chakra-ui/react";
import { wizardTokens } from "./tokens";

export interface WizardFieldProps {
  /** Field label text */
  label: string;
  /** Field name for accessibility */
  name: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the field */
  helper?: string;
  /** Mark field as required */
  required?: boolean;
  /** The form control (Input, Select, etc.) */
  children: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

export function WizardField({
  label,
  name,
  error,
  helper,
  required,
  children,
  className,
}: WizardFieldProps) {
  return (
    <Field.Root
      invalid={!!error}
      required={required}
      className={className}
    >
      <Field.Label
        htmlFor={name}
        fontSize="sm"
        fontWeight="600"
        color="gray.700"
        mb={1.5}
        _dark={{ color: "gray.200" }}
      >
        {label}
        {required && (
          <Box as="span" color="red.500" ms={0.5}>
            *
          </Box>
        )}
      </Field.Label>

      <Box
        className={error ? "wizard-shake" : undefined}
        css={{
          "& input, & select, & textarea": {
            minHeight: wizardTokens.fieldMinHeight,
            borderRadius: wizardTokens.wizardInputRadius,
            fontSize: "15px",
            transition: "all 0.2s ease-out",
            "&:focus": {
              borderColor: "var(--chakra-colors-purple-500)",
              boxShadow: "0 0 0 3px var(--chakra-colors-purple-100)",
            },
          },
        }}
      >
        {children}
      </Box>

      {helper && !error && (
        <Field.HelperText
          fontSize="xs"
          color="gray.500"
          mt={1}
          _dark={{ color: "gray.400" }}
        >
          {helper}
        </Field.HelperText>
      )}

      {error && (
        <Field.ErrorText
          fontSize="xs"
          color="red.500"
          mt={1}
          fontWeight="500"
        >
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}

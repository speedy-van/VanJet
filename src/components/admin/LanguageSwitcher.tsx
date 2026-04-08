"use client";

// ─── VanJet · Admin Language Switcher ─────────────────────────
// Switches between Arabic and English, persists in NEXT_LOCALE cookie

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, HStack, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale || isChanging) return;

    setIsChanging(true);
    
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    
    // Refresh the page to apply the new locale
    startTransition(() => {
      router.refresh();
      // Small delay to ensure cookie is set before refresh completes
      setTimeout(() => setIsChanging(false), 500);
    });
  };

  const otherLocale = locales.find((l) => l !== currentLocale) as Locale;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => handleLocaleChange(otherLocale)}
      disabled={isPending || isChanging}
      loading={isPending || isChanging}
      aria-label={`Switch to ${localeNames[otherLocale]}`}
    >
      <HStack gap={1}>
        <Globe size={16} />
        <Text fontSize="sm" fontWeight="500">
          {localeNames[otherLocale]}
        </Text>
      </HStack>
    </Button>
  );
}

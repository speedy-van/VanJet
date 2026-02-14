"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Stack,
} from "@chakra-ui/react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { getMapboxPrecision } from "@/lib/address-utils";

interface ConfirmAddressModalProps {
  pickupAddress: string;
  pickupNeedsConfirm: boolean;
  dropoffAddress: string;
  dropoffNeedsConfirm: boolean;
  onConfirmPickup: (data: {
    address: string;
    lat: number;
    lng: number;
    addressLine1?: string;
    city?: string;
    postcode?: string;
  }) => void;
  onConfirmDropoff: (data: {
    address: string;
    lat: number;
    lng: number;
    addressLine1?: string;
    city?: string;
    postcode?: string;
  }) => void;
  onClose: () => void;
}

export function ConfirmAddressModal({
  pickupAddress,
  pickupNeedsConfirm,
  dropoffAddress,
  dropoffNeedsConfirm,
  onConfirmPickup,
  onConfirmDropoff,
  onClose,
}: ConfirmAddressModalProps) {
  // Pickup state
  const [pickupAutocomplete, setPickupAutocomplete] = useState(pickupAddress);
  const [pickupManualLine1, setPickupManualLine1] = useState("");
  const [pickupManualCity, setPickupManualCity] = useState("");
  const [pickupManualPostcode, setPickupManualPostcode] = useState(pickupAddress);
  const [pickupLat, setPickupLat] = useState(0);
  const [pickupLng, setPickupLng] = useState(0);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [pickupMode, setPickupMode] = useState<"autocomplete" | "manual">("autocomplete");

  // Dropoff state
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(dropoffAddress);
  const [dropoffManualLine1, setDropoffManualLine1] = useState("");
  const [dropoffManualCity, setDropoffManualCity] = useState("");
  const [dropoffManualPostcode, setDropoffManualPostcode] = useState(dropoffAddress);
  const [dropoffLat, setDropoffLat] = useState(0);
  const [dropoffLng, setDropoffLng] = useState(0);
  const [dropoffConfirmed, setDropoffConfirmed] = useState(false);
  const [dropoffMode, setDropoffMode] = useState<"autocomplete" | "manual">("autocomplete");

  const handlePickupAutocompleteSelect = (r: {
    address: string;
    lat: number;
    lng: number;
    featureType: string;
  }) => {
    const precision = getMapboxPrecision(r.featureType);
    if (precision === "full") {
      setPickupLat(r.lat);
      setPickupLng(r.lng);
      setPickupConfirmed(true);
      onConfirmPickup({ address: r.address, lat: r.lat, lng: r.lng });
    } else {
      // Still postcode-only, stay in modal
      setPickupAutocomplete(r.address);
    }
  };

  const handlePickupManualConfirm = () => {
    if (!pickupManualLine1 || !pickupManualPostcode) return;
    const fullAddress = `${pickupManualLine1}, ${pickupManualCity ? pickupManualCity + ", " : ""}${pickupManualPostcode}, UK`;
    // For manual, we'll use the same lat/lng (postcode center) but mark as confirmed
    onConfirmPickup({
      address: fullAddress,
      lat: pickupLat || 0,
      lng: pickupLng || 0,
      addressLine1: pickupManualLine1,
      city: pickupManualCity,
      postcode: pickupManualPostcode,
    });
    setPickupConfirmed(true);
  };

  const handleDropoffAutocompleteSelect = (r: {
    address: string;
    lat: number;
    lng: number;
    featureType: string;
  }) => {
    const precision = getMapboxPrecision(r.featureType);
    if (precision === "full") {
      setDropoffLat(r.lat);
      setDropoffLng(r.lng);
      setDropoffConfirmed(true);
      onConfirmDropoff({ address: r.address, lat: r.lat, lng: r.lng });
    } else {
      setDropoffAutocomplete(r.address);
    }
  };

  const handleDropoffManualConfirm = () => {
    if (!dropoffManualLine1 || !dropoffManualPostcode) return;
    const fullAddress = `${dropoffManualLine1}, ${dropoffManualCity ? dropoffManualCity + ", " : ""}${dropoffManualPostcode}, UK`;
    onConfirmDropoff({
      address: fullAddress,
      lat: dropoffLat || 0,
      lng: dropoffLng || 0,
      addressLine1: dropoffManualLine1,
      city: dropoffManualCity,
      postcode: dropoffManualPostcode,
    });
    setDropoffConfirmed(true);
  };

  const allConfirmed =
    (!pickupNeedsConfirm || pickupConfirmed) &&
    (!dropoffNeedsConfirm || dropoffConfirmed);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="xl"
        shadow="2xl"
        maxW="600px"
        w="full"
        maxH="90vh"
        overflowY="auto"
        p={{ base: 5, md: 8 }}
      >
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="800" color="gray.800" mb={2}>
              Confirm Your Full Address
            </Text>
            <Text fontSize="sm" color="gray.600">
              We need your complete address (house/flat number + street) to provide accurate quotes and service.
            </Text>
          </Box>

          {/* Pickup Section */}
          {pickupNeedsConfirm && !pickupConfirmed && (
            <Box
              borderWidth="2px"
              borderColor="blue.300"
              borderRadius="lg"
              p={5}
              bg="blue.50"
            >
              <Text fontSize="lg" fontWeight="700" color="gray.800" mb={4}>
                📍 Confirm Pickup Address
              </Text>
              <Text fontSize="sm" color="gray.700" mb={3}>
                Current: <strong>{pickupAddress}</strong>
              </Text>

              <Stack gap={4}>
                {pickupMode === "autocomplete" ? (
                  <>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={2}>
                        Search for your full address:
                      </Text>
                      <AddressAutocomplete
                        value={pickupAutocomplete}
                        onChange={setPickupAutocomplete}
                        onSelect={handlePickupAutocompleteSelect}
                        placeholder="Type house number and street..."
                      />
                    </Box>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPickupMode("manual")}
                    >
                      Or enter manually →
                    </Button>
                  </>
                ) : (
                  <>
                    <VStack gap={3} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Address Line 1 *
                        </Text>
                        <Input
                          value={pickupManualLine1}
                          onChange={(e) => setPickupManualLine1(e.target.value)}
                          placeholder="e.g. 10 Downing Street"
                          bg="white"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          City / Town
                        </Text>
                        <Input
                          value={pickupManualCity}
                          onChange={(e) => setPickupManualCity(e.target.value)}
                          placeholder="e.g. London"
                          bg="white"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Postcode *
                        </Text>
                        <Input
                          value={pickupManualPostcode}
                          onChange={(e) => setPickupManualPostcode(e.target.value)}
                          placeholder="e.g. SW1A 2AA"
                          bg="white"
                        />
                      </Box>
                    </VStack>
                    <HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPickupMode("autocomplete")}
                      >
                        ← Back to search
                      </Button>
                      <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={handlePickupManualConfirm}
                        disabled={!pickupManualLine1 || !pickupManualPostcode}
                      >
                        Confirm Pickup Address
                      </Button>
                    </HStack>
                  </>
                )}
              </Stack>
            </Box>
          )}

          {/* Dropoff Section */}
          {dropoffNeedsConfirm && !dropoffConfirmed && (
            <Box
              borderWidth="2px"
              borderColor="green.300"
              borderRadius="lg"
              p={5}
              bg="green.50"
            >
              <Text fontSize="lg" fontWeight="700" color="gray.800" mb={4}>
                📦 Confirm Drop-off Address
              </Text>
              <Text fontSize="sm" color="gray.700" mb={3}>
                Current: <strong>{dropoffAddress}</strong>
              </Text>

              <Stack gap={4}>
                {dropoffMode === "autocomplete" ? (
                  <>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={2}>
                        Search for your full address:
                      </Text>
                      <AddressAutocomplete
                        value={dropoffAutocomplete}
                        onChange={setDropoffAutocomplete}
                        onSelect={handleDropoffAutocompleteSelect}
                        placeholder="Type house number and street..."
                      />
                    </Box>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDropoffMode("manual")}
                    >
                      Or enter manually →
                    </Button>
                  </>
                ) : (
                  <>
                    <VStack gap={3} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Address Line 1 *
                        </Text>
                        <Input
                          value={dropoffManualLine1}
                          onChange={(e) => setDropoffManualLine1(e.target.value)}
                          placeholder="e.g. 10 Downing Street"
                          bg="white"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          City / Town
                        </Text>
                        <Input
                          value={dropoffManualCity}
                          onChange={(e) => setDropoffManualCity(e.target.value)}
                          placeholder="e.g. London"
                          bg="white"
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1}>
                          Postcode *
                        </Text>
                        <Input
                          value={dropoffManualPostcode}
                          onChange={(e) => setDropoffManualPostcode(e.target.value)}
                          placeholder="e.g. SW1A 2AA"
                          bg="white"
                        />
                      </Box>
                    </VStack>
                    <HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDropoffMode("autocomplete")}
                      >
                        ← Back to search
                      </Button>
                      <Button
                        size="sm"
                        colorPalette="green"
                        onClick={handleDropoffManualConfirm}
                        disabled={!dropoffManualLine1 || !dropoffManualPostcode}
                      >
                        Confirm Drop-off Address
                      </Button>
                    </HStack>
                  </>
                )}
              </Stack>
            </Box>
          )}

          {/* Success Messages */}
          {pickupNeedsConfirm && pickupConfirmed && (
            <Box bg="green.100" p={3} borderRadius="md">
              <Text fontSize="sm" fontWeight="600" color="green.800">
                ✓ Pickup address confirmed
              </Text>
            </Box>
          )}
          {dropoffNeedsConfirm && dropoffConfirmed && (
            <Box bg="green.100" p={3} borderRadius="md">
              <Text fontSize="sm" fontWeight="600" color="green.800">
                ✓ Drop-off address confirmed
              </Text>
            </Box>
          )}

          {/* Action Buttons */}
          <HStack justify="flex-end" pt={4} borderTop="1px solid" borderColor="gray.200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={onClose}
              disabled={!allConfirmed}
              opacity={allConfirmed ? 1 : 0.5}
            >
              {allConfirmed ? "Continue to Payment →" : "Confirm addresses to continue"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

import React from "react";
import { StyleSheet, Text } from "react-native";
import { PayerId } from "../db/schema";
import { usePayerDisplayName } from "../store/useSettingsStore";

interface PayerChipProps {
  payerId: PayerId;
  size?: "small" | "medium";
}

export function PayerChip({ payerId, size = "medium" }: PayerChipProps) {
  const displayName = usePayerDisplayName(payerId);
  const isHubby = payerId === "hubby";

  return (
    <Text
      style={[
        styles.chip,
        isHubby ? styles.hubbyChip : styles.wifeyChip,
        size === "small" ? styles.smallChip : styles.mediumChip,
      ]}
    >
      {displayName}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    fontWeight: "600",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
  smallChip: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  mediumChip: {
    fontSize: 14,
  },
  hubbyChip: {
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
  },
  wifeyChip: {
    backgroundColor: "#F3E5F5",
    color: "#7B1FA2",
  },
});

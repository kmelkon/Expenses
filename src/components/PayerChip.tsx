import React from "react";
import { StyleSheet, Text } from "react-native";
import { PayerId } from "../db/sqlite";

interface PayerChipProps {
  payerId: PayerId;
  size?: "small" | "medium";
}

const USERS = {
  you: "Karam",
  partner: "Kazi",
} as const;

export function PayerChip({ payerId, size = "medium" }: PayerChipProps) {
  const isYou = payerId === "you";

  return (
    <Text
      style={[
        styles.chip,
        isYou ? styles.youChip : styles.partnerChip,
        size === "small" ? styles.smallChip : styles.mediumChip,
      ]}
    >
      {USERS[payerId]}
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
  youChip: {
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
  },
  partnerChip: {
    backgroundColor: "#F3E5F5",
    color: "#7B1FA2",
  },
});

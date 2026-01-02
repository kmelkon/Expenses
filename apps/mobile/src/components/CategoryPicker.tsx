import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Category } from "../db/schema";
import { useCategories } from "../store/useSettingsStore";
import { Theme, useTheme } from "../theme";

interface CategoryPickerProps {
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  placeholder?: string;
}

export function CategoryPicker({
  selectedCategory,
  onSelect,
  placeholder = "Select category",
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const categories = useCategories();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSelect = (category: Category) => {
    onSelect(category);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.picker, !selectedCategory && styles.placeholder]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedCategory && styles.placeholderText,
          ]}
        >
          {selectedCategory || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.categoryList}
              showsVerticalScrollIndicator={true}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.name &&
                      styles.selectedCategory,
                  ]}
                  onPress={() => handleSelect(category.name)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.name &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    picker: {
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 8,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    placeholder: {
      borderColor: theme.colors.border,
    },
    pickerText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    placeholderText: {
      color: theme.colors.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      ...theme.typography.headingSm,
      color: theme.colors.text,
    },
    cancelButton: {
      ...theme.typography.bodyStrong,
      color: theme.colors.accent,
    },
    categoryList: {
      flexGrow: 0,
    },
    categoryItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    selectedCategory: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    categoryText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    selectedCategoryText: {
      color: theme.colors.accentStrong,
      fontWeight: "600",
    },
  });

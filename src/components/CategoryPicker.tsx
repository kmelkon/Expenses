import React, { useState } from "react";
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

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  placeholder: {
    borderColor: "#CCC",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cancelButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedCategory: {
    backgroundColor: "#E3F2FD",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#1565C0",
    fontWeight: "500",
  },
});

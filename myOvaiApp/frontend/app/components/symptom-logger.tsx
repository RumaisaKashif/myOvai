import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import Slider from '@react-native-community/slider';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type Cycle = {
  id: string;
  month: string;
  phases: { start: string | null; end: string | null; color: string; name: string }[];
  symptoms?: Record<string, number>;
};

type SymptomLoggerProps = {
  userId: string | undefined;
  cycles: Cycle[];
  isVisible: boolean;
  onClose: () => void;
  onSave: (updatedCycles: Cycle[]) => void;
};

const SYMPTOMS = ["Cramps", "Bloating", "Mood Swings", "Fatigue"];

export default function SymptomLogger({ userId, cycles, isVisible, onClose, onSave }: SymptomLoggerProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [symptomSeverities, setSymptomSeverities] = useState<Record<string, number>>(
    SYMPTOMS.reduce((acc, symptom) => ({ ...acc, [symptom]: 0 }), {})
  );

  // Load existing symptoms when a cycle is selected
  const onSelectCycle = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    const selectedCycle = cycles.find((cycle) => cycle.id === cycleId);
    if (selectedCycle?.symptoms) {
      setSymptomSeverities(
        SYMPTOMS.reduce(
          (acc, symptom) => ({
            ...acc,
            [symptom]: selectedCycle.symptoms?.[symptom] || 0,
          }),
          {}
        )
      );
    } else {
      setSymptomSeverities(SYMPTOMS.reduce((acc, symptom) => ({ ...acc, [symptom]: 0 }), {}));
    }
  };

  // Update symptom severity
  const updateSymptomSeverity = (symptom: string, value: number) => {
    setSymptomSeverities((prev) => ({ ...prev, [symptom]: Math.round(value) }));
  };

  // Save symptoms to Firebase
  const saveSymptoms = async () => {
    if (!userId) {
      alert("Please sign in to save symptoms.");
      return;
    }
    if (!selectedCycleId) {
      alert("Please select a cycle.");
      return;
    }

    // Filter out symptoms with severity 0
    const nonZeroSymptoms = Object.fromEntries(
      Object.entries(symptomSeverities).filter(([_, value]) => value > 0)
    );

    const updatedCycles = cycles.map((cycle) =>
      cycle.id === selectedCycleId
        ? { ...cycle, symptoms: nonZeroSymptoms }
        : cycle
    );

    try {
      const userDoc = doc(db, "users", userId);
      await setDoc(userDoc, { cycles: updatedCycles }, { merge: true });
      onSave(updatedCycles);
      onClose();
    } catch (error) {
      console.error("Error saving symptoms:", error);
      alert("Failed to save symptoms.");
    }
  };

  return (
    <Modal animationType="slide" visible={isVisible} onRequestClose={onClose} transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Log Symptoms</Text>

          {/* Cycle Selection */}
          <ScrollView
            style={styles.cycleSelector}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {cycles.map((cycle) => (
              <TouchableOpacity
                key={cycle.id}
                style={[
                  styles.cycleSelectorButton,
                  selectedCycleId === cycle.id && styles.cycleSelectorButtonSelected,
                ]}
                onPress={() => onSelectCycle(cycle.id)}
              >
                <Text
                  style={[
                    styles.cycleSelectorText,
                    selectedCycleId === cycle.id && styles.cycleSelectorTextSelected,
                  ]}
                >
                  {cycle.month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Symptom Sliders */}
          {selectedCycleId && (
            <ScrollView style={styles.symptomContainer}>
              {SYMPTOMS.map((symptom) => (
                <View key={symptom} style={styles.symptomItem}>
                  <Text style={styles.symptomLabel}>{symptom}</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderValue}>{symptomSeverities[symptom]}</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={10}
                      step={1}
                      value={symptomSeverities[symptom]}
                      onValueChange={(value) => updateSymptomSeverity(symptom, value)}
                      minimumTrackTintColor="#770737"
                      maximumTrackTintColor="#ccc"
                      thumbTintColor="#583C8A"
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>0</Text>
                      <Text style={styles.sliderLabel}>10</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Buttons */}
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSave} onPress={saveSymptoms}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    color: "#770737",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Helvetica",
    marginBottom: 15,
  },
  cycleSelector: {
    maxHeight: 40,
    marginBottom: 20,
  },
  cycleSelectorButton: {
    backgroundColor: "#eee",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  cycleSelectorButtonSelected: {
    backgroundColor: "#770737",
    borderColor: "#8B0000",
  },
  cycleSelectorText: {
    color: "#444",
    fontWeight: "600",
    fontFamily: "Helvetica",
  },
  cycleSelectorTextSelected: {
    color: "white",
  },
  symptomContainer: {
    maxHeight: 320,
    marginBottom: 20,
  },
  symptomItem: {
    marginBottom: 20,
  },
  symptomLabel: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 6,
    color: "#770737",
    fontFamily: "Helvetica",
  },
  sliderContainer: {
    paddingHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: "#2D1B3D",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Helvetica",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Helvetica",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonSave: {
    flex: 1,
    backgroundColor: "#770737",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Helvetica",
  },
});
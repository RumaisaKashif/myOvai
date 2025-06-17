import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type CyclePhase = {
    start: string | null;
    end: string | null;
    color: string;
    name: string;
};

type Cycle = {
    id: string;
    month: string;
    phases: CyclePhase[];
    symptoms?: Record<string, number>;
};

type CycleOverviewProps = {
    nextPeriodDays: number | null;
    isLoggingMode: boolean;
    setIsLoggingMode: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectingPhase: React.Dispatch<React.SetStateAction<"start" | "end" | null>>;
    setTempSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
    setCurrentCycleId: React.Dispatch<React.SetStateAction<string | null>>;
    cycles: Cycle[];
    setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>;
    setNextPeriodDays: React.Dispatch<React.SetStateAction<number | null>>;
    openModal: () => void;
    openSymptomModal: () => void;
};

export default function CycleOverview({
    nextPeriodDays,
    isLoggingMode,
    setIsLoggingMode,
    setSelectingPhase,
    setTempSelectedDate,
    setCurrentCycleId,
    cycles,
    setCycles,
    setNextPeriodDays,
    openModal,
    openSymptomModal,
}: CycleOverviewProps) {
    const { user } = useAuth();
    const userName = user?.displayName || user?.email?.split("@")[0] || "User";

    // Save to Firebase Firestore
    const saveToFirebase = async (newCycle: Cycle[]): Promise<boolean> => {
        if (!user || !user.uid) {
            console.error("No authenticated user found.");
            alert("Please sign in to save your cycle.");
            return false;
        }
        try {
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, { cycles: newCycle }, { merge: true });
            console.log("Data saved to Firestore for user:", user.uid);
            return true;
        } catch (error) {
            console.error("Error saving cycle:", error);
            if (error instanceof Error) {
                alert(`Failed to save cycle: ${error.message}`);
            } else {
                alert('Failed to save cycle: Unknown error occurred');
            }
            return false;
        }
    };

    // Toggle logging mode
    const toggleLoggingMode = () => {
        if (isLoggingMode) {
            // Exit logging mode
            setIsLoggingMode(false);
            setSelectingPhase(null);
            setTempSelectedDate(null);
            setCurrentCycleId(null);
        } else {
            // Enter logging mode
            setIsLoggingMode(true);
            setSelectingPhase("start");
            setTempSelectedDate(null);
        }
    };

    // Reset all cycles
    const handleReset = async () => {
        const reset: Cycle[] = [];
        const saved = await saveToFirebase(reset);
        if (saved) {
            setCycles(reset);
            setIsLoggingMode(false);
            setCurrentCycleId(null);
            setSelectingPhase(null);
            setTempSelectedDate(null);
            setNextPeriodDays(null);
        }
    };

    return (
        <View style={styles.predictionContainer}>
            <Text style={styles.statsTitle}>Cycle Overview</Text>
            <Text style={styles.predictionText}>
                {nextPeriodDays !== null
                    ? `Your next period starts in ${nextPeriodDays} days`
                    : "Select your cycle dates"}
            </Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.logButton, isLoggingMode && styles.logButtonActive]}
                    onPress={toggleLoggingMode}
                >
                    <Text style={styles.buttonText}>
                        {isLoggingMode ? "Log Dates" : "Log Dates"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.symptomButton} onPress={openSymptomModal}>
                    <Text style={styles.buttonText}>Add Symptoms</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={openModal}>
                    <Text style={styles.buttonText}>Edit Cycle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.buttonText}>Reset Cycles</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    predictionContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(45, 27, 61, 0.1)',
        marginHorizontal: 8,
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 30,
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statsTitle: {
        color: '#2D1B3D',
        fontFamily: "Helvetica",
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
        marginBottom: 8,
    },
    predictionText: {
        color: '#2D1B3D',
        fontFamily: "Helvetica",
        fontSize: 16,
        opacity: 0.8,
        textAlign: "center",
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
    },
    logButton: {
        backgroundColor: "#583C8A",
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logButtonActive: {
        backgroundColor: "#9279BA",
        shadowColor: "#9279BA",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    symptomButton: {
        backgroundColor: "#2E8B57",
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resetButton: {
        backgroundColor: "rgba(45, 27, 61, 0.85)",
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    editButton: {
        backgroundColor: "#770737",
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontFamily: "Helvetica",
        fontWeight: '600',
    },
});
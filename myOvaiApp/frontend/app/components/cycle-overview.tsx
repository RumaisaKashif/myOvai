import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    const fadeAnim = useRef(new Animated.Value(0)).current;
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

    // Animation for instructions to user when logging mode is enabled
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isLoggingMode ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isLoggingMode]);

    return (
        <View style={styles.predictionContainer}>
            <Text style={styles.statsTitle}>Cycle Overview</Text>
            <Text style={styles.predictionText}>
                {nextPeriodDays !== null
                    ? `Your next period starts in ${nextPeriodDays} days`
                    : "Select your cycle dates"}
            </Text>
            {isLoggingMode && (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.loggingMessage}>
                        To indicate the start or end date of your period, click a date on the calendar below.
                    </Text>
                </Animated.View>
            )}
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                        style={[styles.button, isLoggingMode && styles.buttonActive]}
                        onPress={toggleLoggingMode}
                    >
                        <Ionicons name="calendar-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.buttonLabel}>Log Dates</Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={openSymptomModal}>
                        <Ionicons name="medkit-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.buttonLabel}>Add Symptoms</Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={openModal}>
                        <Ionicons name="pencil-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.buttonLabel}>Edit Cycle</Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={handleReset}>
                        <Ionicons name="refresh-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.buttonLabel}>Reset Cycles</Text>
                </View>
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
        paddingVertical: 40, 
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
        marginBottom: 10,
    },
    loggingMessage: {
        color: '#2D1B3D',
        fontFamily: "Helvetica",
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    buttonWrapper: {
        alignItems: "center",
        width: "45%", 
        marginVertical: 10,
    },
    button: {
        backgroundColor: "rgba(45, 27, 61, 0.85)",
        borderRadius: 30, 
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonActive: {
        backgroundColor: "#6B4E8A",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    buttonLabel: {
        color: '#2D1B3D',
        fontFamily: "Helvetica",
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: "center",
        marginTop: 8,
    },
});
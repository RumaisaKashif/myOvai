import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Dimensions, StyleSheet, 
    TouchableOpacity, Modal, TextInput, ScrollView, Platform } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import moment from "moment";

// Types
type DayPress = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

type Marking = {
    customStyles: {
        container: object;
        text: object;
  };
};

type CyclePhase = {
    start: string | null;
    end: string | null;
    color: string;
    name: string;
};

type Cycle = {
    id: string; // Unique ID for each cycle
    month: string; // Add for user friendly dropdown
    phases: CyclePhase[];
};

// Constants
const PHASES = {
    menstrual: { color: "#DC2626", name: "Menstrual" }, // Red
    follicular: { color: "#FFBEC8", name: "Follicular" }, // Pink 
    ovulatory: { color: "#90E0B9", name: "Ovulatory" }, // Green
    luteal: { color: "#BCA4E3", name: "Luteal" }, // Purple
};

const AVERAGE_CYCLE_LENGTH = 28;
const PHASE_DURATIONS = {
    menstrual: 5,
    follicular: 9,
    ovulatory: 3,
    luteal: 11,
};


export default function CalendarView() {
    const { height } = Dimensions.get("window");
    const { user } = useAuth();
    const userName = user?.displayName || user?.email?.split("@")[0] || "User";
    const [loading, setLoading] = useState(true);
    const [isLoggingMode, setIsLoggingMode] = useState(false);
    const [selectingPhase, setSelectingPhase] = useState<"start" | "end" | null>(null);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [nextPeriodDays, setNextPeriodDays] = useState<number | null>(null);
    const [tempSelectedDate, setTempSelectedDate] = useState<string | null>(null);
    const [currentCycleId, setCurrentCycleId] = useState<string | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
    const [editedCycle, setEditedCycle] = useState<Cycle | null>(null);

    // Generate unique ID for new cycles
    const generateCycleId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    // Generate cycle name e.g. May 2025
    const generateCycleName = (start: string): string => {
        return moment(start).format("MMMM YYYY"); 
    };    

    // Firebase data fetching
    useEffect(() => {
        if (!user || !user.uid) {
            console.log("No authenticated user found.");
            setLoading(false);
            return;
        }
    
        const retrieveData = async () => {
            try {
                const userDoc = doc(db, "users", user.uid);
                const retrievedDoc = await getDoc(userDoc);
                if (retrievedDoc.exists()) {
                    const data = retrievedDoc.data();
                    console.log("Retrieved Firestore data:", data);
                    const cyclesData = data.cycles || [];
                    const namedCycleData = assignNamesToCycles(cyclesData);
                    setCycles(namedCycleData);
                    updateNextPeriodDays(namedCycleData);
                } else {
                    console.log("No user document found.");
                    await setDoc(userDoc, { cycles: [] }, { merge: true });
                    setCycles([]);
                }
            } catch (error) {
                console.error("Error retrieving cycle data:", error);
                if (error instanceof Error) {
                    alert(`Failed to retrieve cycle data: ${error.message}`);
                } else {
                    alert('Failed to retrieve cycle data: Unknown error occurred');
                }
                setCycles([]);
            } finally {
                setLoading(false);
            }
        };
        retrieveData();
    }, [user]);

    // Save to Firebase
    const saveToFirebase = async (newCycle: Cycle[]): Promise<boolean> => {
        if (!user || !user.uid) {
            console.error("No authenticated user found.");
            alert("Please sign in to save cycle data.");
            return false;
        }
        try {
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, { cycles: newCycle }, { merge: true });
            console.log("Data saved successfully to Firestore for user:", user.uid);
            return true;
        } catch (error) {
            console.error("Error saving cycle data:", error);
            if (error instanceof Error) {
                alert(`Failed to save cycle data: ${error.message}`);
            } else {
                alert('Failed to save cycle data: Unknown error occurred');
            }
            return false;
        }
    };
    

    // Calculate next period days based on latest cycle
    const updateNextPeriodDays = (cycles: Cycle[]) => {
        if (!cycles.length) {
            setNextPeriodDays(null);
            return;
        }
    
        const latestCycle = cycles
        .filter(cycle => { 
            const menstrualPhase = cycle.phases.find(phase => phase.name === "Menstrual");
            return menstrualPhase?.start && menstrualPhase?.end;
        })
        .sort((cycleA, cycleB) => 
            moment(cycleB.phases[0]?.start).diff(moment(cycleA.phases[0]?.start)))[0];
        
        if (!latestCycle) {
            setNextPeriodDays(null);
            return;
        }
    
        const lutealPhase = latestCycle.phases.find(phase => phase.name === "Luteal" && phase.end);

        if (lutealPhase) {
            const nextPeriodDate = moment(lutealPhase.end).add(1, "days");
            const daysUntilNextPeriod = nextPeriodDate.diff(moment(), "days");
            setNextPeriodDays(daysUntilNextPeriod);
        } else {
            setNextPeriodDays(null);
        }
    };
    
    // Calculate phase lengths
    const calculatePhases = (menstrualPhaseStart: string, menstrualPhaseEnd: string): 
    CyclePhase[] => {
        const startDate = moment(menstrualPhaseStart);
        const cyclePhasesArray: CyclePhase[] = [
        { start: menstrualPhaseStart, end: menstrualPhaseEnd, 
            color: PHASES.menstrual.color, name: PHASES.menstrual.name },
        ];

        const follicularPhaseStart = moment(menstrualPhaseEnd)
        .add(1, "days")
        .format("YYYY-MM-DD");
        const follicularPhaseEnd = moment(follicularPhaseStart)
        .add(PHASE_DURATIONS.follicular - 1, "days")
        .format("YYYY-MM-DD");
        cyclePhasesArray.push({ start: follicularPhaseStart, end: follicularPhaseEnd, 
            color: PHASES.follicular.color, name: PHASES.follicular.name });

        const ovulatoryPhaseStart = moment(follicularPhaseEnd)
        .add(1, "days")
        .format("YYYY-MM-DD");
        const ovulatoryPhaseEnd = moment(ovulatoryPhaseStart)
        .add(PHASE_DURATIONS.ovulatory - 1, "days")
        .format("YYYY-MM-DD");
        cyclePhasesArray.push({ start: ovulatoryPhaseStart, end: ovulatoryPhaseEnd, 
            color: PHASES.ovulatory.color, name: PHASES.ovulatory.name });

        const lutealStart = moment(ovulatoryPhaseEnd)
        .add(1, "days")
        .format("YYYY-MM-DD");
        const lutealEnd = moment(lutealStart)
        .add(PHASE_DURATIONS.luteal - 1, "days")
        .format("YYYY-MM-DD");
        cyclePhasesArray.push({ start: lutealStart, end: lutealEnd, 
            color: PHASES.luteal.color, name: PHASES.luteal.name });

        return cyclePhasesArray;
    };

    // Build marked dates for calendar
    const showMarkedDates = (): Record<string, Marking> => {
        const markings: Record<string, Marking> = {};

        if (tempSelectedDate && isLoggingMode) {
        markings[tempSelectedDate] = {
            customStyles: {
            container: {
                backgroundColor: "#D8BFD8",
                borderRadius: 20,
                elevation: 4,
            },
            text: {
                color: "#2E1B4A",
                fontWeight: "600",
            },
            },
        };
        }

        cycles.forEach((cycle) => {
            cycle.phases.forEach((phase) => {
                if (phase.start && phase.end) {
                let currentDate = moment(phase.start);
                const endDate = moment(phase.end);
                while (currentDate <= endDate) {
                    const dateString = currentDate.format("YYYY-MM-DD");
                    if (!markings[dateString] || (tempSelectedDate !== dateString)) {
                    markings[dateString] = {
                        customStyles: {
                        container: {
                            backgroundColor: phase.color,
                            borderRadius: 20,
                            elevation: 4,
                        },
                        text: {
                            color: "white",
                            fontWeight: "600",
                        },
                        },
                    };
                    }
                    currentDate = currentDate.add(1, "days");
                }
                }
            });
        });
        return markings;
    };

    // Handle day press for CRUD operations
    const onDayPress = async (day: DayPress) => {
        if (!isLoggingMode) return;
    
        const date = day.dateString;
        const updatedCycles = cycles.slice();
    
        if (selectingPhase === "start") {
            setTempSelectedDate(date);
    
            const newCycle: Cycle = {
                id: generateCycleId(),
                month: generateCycleName(date),
                phases: [{
                    start: date,
                    end: null,
                    color: PHASES.menstrual.color,
                    name: PHASES.menstrual.name
                }],
            };
    
            setCurrentCycleId(newCycle.id);
            updatedCycles.push(newCycle);
            setSelectingPhase("end");
    
            const namedCycles = assignNamesToCycles(updatedCycles);
            const savedCycles = await saveToFirebase(namedCycles);
            if (savedCycles) {
                setCycles(namedCycles);
            }
        } else if (selectingPhase === "end" && currentCycleId) {
            const currentCycle = updatedCycles.find(cycle => cycle.id === currentCycleId);
    
            if (currentCycle && currentCycle.phases[0].start && date >= currentCycle.phases[0].start) {
                setTempSelectedDate(null);
                currentCycle.phases = calculatePhases(currentCycle.phases[0].start!, date);
                setIsLoggingMode(false);
                setCurrentCycleId(null);
                setSelectingPhase(null);
                updateNextPeriodDays(updatedCycles);
    
                const namedCycles = assignNamesToCycles(updatedCycles);
                const savedCycles = await saveToFirebase(namedCycles);
                if (savedCycles) {
                    setCycles(namedCycles);
                }
            }
        }
    };

    const assignNamesToCycles = (cycles: Cycle[]): Cycle[] => {
        return cycles.map(cycle => {
            const { month, phases } = cycle;
            const startDate = phases[0]?.start || "";
            const newMonth = month || generateCycleName(startDate);
            return { ...cycle, month: newMonth };
        });
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

    // Open modal and automatically select first cycle if logged
    const openModal = () => {
        if (cycles.length > 0) {
            setSelectedCycleId(cycles[0].id);
            setEditedCycle({ ...cycles[0] });
        } else {
            setSelectedCycleId(null);
            setEditedCycle(null);
        }
        setModalVisible(true);
    };

    // Close modal
    const closeModal = () => {
        setModalVisible(false);
        setSelectedCycleId(null);
        setEditedCycle(null);
    };

    // When user selects different cycle in dropdown
    const onSelectCycle = (cycleId: string) => {
        setSelectedCycleId(cycleId);
        const cycleForEdit = cycles.find(cycle => cycle.id === cycleId);
        if (cycleForEdit) {
            setEditedCycle({ ...cycleForEdit });
        }
    };

    // Update edited cycle phases dates from editted inputs
    const updatePhaseDate = (field: "start" | "end", value: string) => {
        if (!editedCycle) return;
    
        // Validate input and format
        if (field === "end" && moment(value).isBefore(moment(editedCycle.phases[0].start))) {
            alert("End date cannot be before start date.");
            return;
        }
    
        const menstrualStart = field === "start" ? value : editedCycle.phases[0].start;
        const menstrualEnd = field === "end" ? value : editedCycle.phases[0].end;
    
        // Recalculate the entire cycle for updated menstrual phase data
        const newPhases = calculatePhases(menstrualStart ?? "", menstrualEnd ?? "");
        setEditedCycle({ ...editedCycle, phases: newPhases });
    };

    // Save edited cycle
    const saveEditedCycle = async () => {
        if (!editedCycle) {
            return;
        }
    
        const menstrualPhase = editedCycle.phases[0];
        if (!menstrualPhase.start || !menstrualPhase.end) {
            alert("Please provide valid start and end dates for the menstrual phase.");
            return;
        }
    
        const updatedCycles = cycles.map((cycle) =>
            cycle.id === editedCycle.id ? editedCycle : cycle
        );
    
        const savedCycles = await saveToFirebase(updatedCycles);
        if (savedCycles) {
            setCycles(updatedCycles);
            updateNextPeriodDays(updatedCycles);
            closeModal();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Prediction Section */}
        <View style={[styles.predictionContainer, { height: height / 3 }]}>
            <Text style={styles.greetingText}>Hi, {userName}!</Text>
            <Text style={styles.predictionText}>
                 {nextPeriodDays !== null
                ? `Your next period starts in ${nextPeriodDays} days`
                : "Select your cycle dates"}
            </Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[
                        styles.logButton, 
                        isLoggingMode && styles.logButtonActive
                    ]} 
                    onPress={toggleLoggingMode}
                >
                    <Text style={styles.buttonText}>
                        {isLoggingMode ? "Log Dates" : "Log Dates"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.buttonText}>Reset Cycles</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={openModal}>
                    <Text style={styles.buttonText}>Edit Cycle</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Calendar Section */}
        <View style={[styles.calendarContainer, { height: (1.5 / 3) * height }]}> {/* Adjusted for legend bar */}
        <Calendar
        style={{ width: "100%" }}
        onDayPress={onDayPress}
        markedDates={showMarkedDates()}
        markingType={"custom"}
        theme={{
            backgroundColor: "#F5F0FA",
            calendarBackground: "#F5F0FA",
            textSectionTitleColor: "#2E1B4A",
            todayTextColor: "#9F2B68",
            arrowColor: "#602495",
            monthTextColor: "#2E1B4A",
            textDayFontFamily: "Helvetica",
            textMonthFontFamily: "Helvetica",
            textDayHeaderFontFamily: "Helvetica",
        }}
        />
        </View>

        {/* Legend Bar */}
        <View style={[styles.legendContainer, {height: 0.35 / 3 * height}]}>
            {Object.entries(PHASES).map(([key, phase]) => (
            <View key={key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: phase.color }]} />
                <Text style={styles.legendText}>{phase.name}</Text>
            </View>
            ))}
        </View>

            {/* Modal for Editing */}
            <Modal
                animationType="slide"
                visible={isModalVisible}
                onRequestClose={closeModal}
                transparent={true}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Cycle</Text>

                        {/* Cycle Dropdown */}
                        <ScrollView
                            style={{ maxHeight: 40, marginBottom: 20 }}
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

                        {/* Editing phases */}
                        <View style={{ maxHeight: 320 }}>
                            {editedCycle?.phases[0] && (
                                <View style={styles.phaseEditRow}>
                                    <Text style={styles.phaseLabel}>Menstrual Phase</Text>
                                    <View style={styles.phaseDatesRow}>
                                        <View style={styles.phaseDateInputContainer}>
                                            <Text style={styles.phaseDateLabel}>Start</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={editedCycle.phases[0].start || ""}
                                                placeholder="YYYY-MM-DD"
                                                onChangeText={(text) => updatePhaseDate("start", text)}
                                                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                                            />
                                        </View>

                                        <View style={styles.phaseDateInputContainer}>
                                            <Text style={styles.phaseDateLabel}>End</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={editedCycle.phases[0].end || ""}
                                                placeholder="YYYY-MM-DD"
                                                onChangeText={(text) => updatePhaseDate("end", text)}
                                                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity style={styles.modalButtonCancel} onPress={closeModal}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButtonSave} onPress={saveEditedCycle}>
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F0FA",
    },
    predictionContainer: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E6D9F5",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    greetingText: {
        fontSize: 20,
        fontWeight: "500",
        color: "#2E1B4A",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom: 10,
    },
    predictionText: {
        fontSize: 24,
        fontWeight: "600",
        color: "#2E1B4A",
        fontFamily: "Helvetica",
        textAlign: "center",
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 15,
    },
    logButton: {
        backgroundColor: "#602495",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    logButtonActive: {
        backgroundColor: "#9279BA",
        shadowColor: "#9279BA",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    resetButton: {
        backgroundColor: "#9F2B68",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    editButton: {
        backgroundColor: "#770737",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginHorizontal: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Helvetica",
    },
    button: {
        backgroundColor: "#9279BA",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        elevation: 3,
        minWidth: 90,
        alignItems: "center",
    },
    calendarContainer: {
        width: "100%",
        backgroundColor: "#F5F0FA",
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#E6D9F5",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 60,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2E1B4A",
        fontFamily: "Helvetica",
    },
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
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 15,
        color: "#770737",
        textAlign: "center",
    },
    cycleSelectorButton: {
        backgroundColor: "#eee",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    cycleSelectorButtonSelected: {
        backgroundColor: "#8B0000",
        borderColor: "#8B0000",
    },
    cycleSelectorText: {
        color: "#444",
        fontWeight: "600",
    },
    cycleSelectorTextSelected: {
        color: "white",
    },
    phaseEditRow: {
        marginBottom: 20,
    },
    phaseLabel: {
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 6,
        color: "#8B0000",
    },
    phaseDatesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    phaseDateInputContainer: {
        flex: 1,
        marginRight: 10,
    },
    phaseDateLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: Platform.OS === "ios" ? 10 : 6,
        fontSize: 14,
        color: "#222",
    },
    modalButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    modalButtonCancel: {
        backgroundColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    modalButtonSave: {
        backgroundColor: "#770737",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    modalButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});
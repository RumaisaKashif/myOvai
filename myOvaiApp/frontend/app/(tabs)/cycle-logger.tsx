import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import CycleOverview from '../components/cycle-overview';
import CalendarView from '../components/calendar';
import SymptomLogger from '../components/symptom-logger';
import { AuthProvider, useAuth } from "../../AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import moment from "moment";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Modal, TouchableOpacity, TextInput } from "react-native";

// Types
type DayPress = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

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

// Prop Types for Components
interface CycleOverviewProps {
    nextPeriodDays: number | null;
    isLoggingMode: boolean;
    setIsLoggingMode: Dispatch<SetStateAction<boolean>>;
    setSelectingPhase: Dispatch<SetStateAction<"start" | "end" | null>>;
    setTempSelectedDate: Dispatch<SetStateAction<string | null>>;
    setCurrentCycleId: Dispatch<SetStateAction<string | null>>;
    cycles: Cycle[];
    setCycles: Dispatch<SetStateAction<Cycle[]>>;
    setNextPeriodDays: Dispatch<SetStateAction<number | null>>;
    openModal: () => void;
    openSymptomModal: () => void;
}

interface CalendarViewProps {
    cycles: Cycle[];
    isLoggingMode: boolean;
    tempSelectedDate: string | null;
    onDayPress: (day: DayPress) => Promise<void>;
}

// Constants
const PHASES = {
    menstrual: { color: "#DC143C", name: "Menstrual" },
    follicular: { color: "#9F2B68", name: "Follicular" },
    ovulatory: { color: "#FF69B4", name: "Ovulatory" },
    luteal: { color: "#C71585", name: "Luteal" },
};

const AVERAGE_CYCLE_LENGTH = 28;
const PHASE_DURATIONS = {
    menstrual: 5,
    follicular: 9,
    ovulatory: 3,
    luteal: 11,
};

// Child component to encapsulate logic requiring AuthContext
function CycleLoggerContent() {
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
    const [isSymptomModalVisible, setSymptomModalVisible] = useState(false);
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
                    console.log("No user doc found.");
                    await setDoc(userDoc, { cycles: [] }, { merge: true });
                    setCycles([]);
                }
            } catch (error) {
                console.error("Error retrieving cycle:", error);
                if (error instanceof Error) {
                    alert(`Failed to retrieve cycle: ${error.message}`);
                } else {
                    alert('Failed to retrieve cycle: Unknown error occurred');
                }
                setCycles([]);
            } finally {
                setLoading(false);
            }
        };
        retrieveData();
    }, [user]);

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
    const calculatePhases = (menstrualPhaseStart: string, menstrualPhaseEnd: string): CyclePhase[] => {
        const startDate = moment(menstrualPhaseStart);

        // Initialise with menstrual phase data
        const cyclePhasesArray: CyclePhase[] = [
            {
                start: menstrualPhaseStart,
                end: menstrualPhaseEnd,
                color: PHASES.menstrual.color,
                name: PHASES.menstrual.name
            },
        ];

        const follicularPhaseStart = moment(menstrualPhaseEnd)
            .add(1, "days")
            .format("YYYY-MM-DD");
        const follicularPhaseEnd = moment(follicularPhaseStart)
            .add(PHASE_DURATIONS.follicular - 1, "days")
            .format("YYYY-MM-DD");
        cyclePhasesArray.push({
            start: follicularPhaseStart,
            end: follicularPhaseEnd,
            color: PHASES.follicular.color,
            name: PHASES.follicular.name
        });

        const ovulatoryPhaseStart = moment(follicularPhaseEnd)
            .add(1, "days")
            .format("YYYY-MM-DD");
        const ovulatoryPhaseEnd = moment(ovulatoryPhaseStart)
            .add(PHASE_DURATIONS.ovulatory - 1, "days")
            .format("YYYY-MM-DD");
        cyclePhasesArray.push({
            start: ovulatoryPhaseStart,
            end: ovulatoryPhaseEnd,
            color: PHASES.ovulatory.color,
            name: PHASES.ovulatory.name
        });

        const lutealStart = moment(ovulatoryPhaseEnd)
            .add(1, "days")
            .format("YYYY-MM-DD");
        const lutealEnd = moment(lutealStart)
            .add(PHASE_DURATIONS.luteal - 1, "days")
            .format("YYYY-MM-DD");
        cyclePhasesArray.push({
            start: lutealStart,
            end: lutealEnd,
            color: PHASES.luteal.color,
            name: PHASES.luteal.name
        });

        return cyclePhasesArray;
    };

    // Handle day pressing for CRUD operations
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

    // Assign names to cycles e.g. May 2025
    const assignNamesToCycles = (cycles: Cycle[]): Cycle[] => {
        return cycles.map(cycle => {
            const { month, phases } = cycle;
            const startDate = phases[0]?.start || "";
            const newMonth = month || generateCycleName(startDate);
            return { ...cycle, month: newMonth };
        });
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

    // Open symptom modal
    const openSymptomModal = () => {
        if (cycles.length > 0) {
            setSelectedCycleId(cycles[0].id);
        } else {
            setSelectedCycleId(null);
        }
        setSymptomModalVisible(true);
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

    // Update edited cycle phases dates from edited inputs
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

    // Handle symptom save
    const handleSymptomSave = (updatedCycles: Cycle[]) => {
        setCycles(updatedCycles);
        updateNextPeriodDays(updatedCycles);
    };

    return (
        <>
            <ScrollView style={styles.contentContainer}>
                <CycleOverview
                    nextPeriodDays={nextPeriodDays}
                    isLoggingMode={isLoggingMode}
                    setIsLoggingMode={setIsLoggingMode}
                    setSelectingPhase={setSelectingPhase}
                    setTempSelectedDate={setTempSelectedDate}
                    setCurrentCycleId={setCurrentCycleId}
                    cycles={cycles}
                    setCycles={setCycles}
                    setNextPeriodDays={setNextPeriodDays}
                    openModal={openModal}
                    openSymptomModal={openSymptomModal}
                />
                <CalendarView
                    cycles={cycles}
                    isLoggingMode={isLoggingMode}
                    tempSelectedDate={tempSelectedDate}
                    onDayPress={onDayPress}
                />
            </ScrollView>
            {/* Edit Cycle Modal */}
            <Modal
                animationType="slide"
                visible={isModalVisible}
                onRequestClose={closeModal}
                transparent={true}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Cycle</Text>

                        {/* Cycle Selection */}
                        <ScrollView
                            style={{ maxHeight: 40, marginBottom: 20 }}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {/* Buttons for each Cycle */}
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
                                <View style={styles.phaseEdit}>
                                    <Text style={styles.phaseLabel}>Menstrual Phase</Text>
                                    <View style={styles.phaseDates}>
                                        <View style={styles.phaseDatesContainer}>
                                            <Text style={styles.phaseDatesStartEnd}>Start</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={editedCycle.phases[0].start || ""}
                                                placeholder="YYYY-MM-DD"
                                                onChangeText={(text) => updatePhaseDate("start", text)}
                                                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
                                            />
                                        </View>

                                        <View style={styles.phaseDatesContainer}>
                                            <Text style={styles.phaseDatesStartEnd}>End</Text>
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

            {/* Symptom Logger Modal */}
            <SymptomLogger
                userId={user?.uid}
                cycles={cycles}
                isVisible={isSymptomModalVisible}
                onClose={() => setSymptomModalVisible(false)}
                onSave={handleSymptomSave}
            />
        </>
    );
}

export default function CycleLoggerScreen() {
    return (
        <LinearGradient
            colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>Cycle Logger</Text>
                </View>
                <AuthProvider>
                    <CycleLoggerContent />
                </AuthProvider>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        alignItems: 'center',
    },
    titleContainer: {
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 25,
        alignItems: "center",
        backgroundColor: "rgba(45, 27, 61, 0.85)",
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pageTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 10,
        paddingTop: 20,
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
        color: "#770737",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 15,
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
    },
    cycleSelectorTextSelected: {
        color: "white",
    },
    phaseEdit: {
        marginBottom: 20,
    },
    phaseLabel: {
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 6,
        color: "#770737",
    },
    phaseDates: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    phaseDatesContainer: {
        flex: 1,
        marginRight: 10,
    },
    phaseDatesStartEnd: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 8,
        fontSize: 14,
        color: "#222",
        paddingVertical: Platform.OS === "ios" ? 10 : 6,
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
    },
});
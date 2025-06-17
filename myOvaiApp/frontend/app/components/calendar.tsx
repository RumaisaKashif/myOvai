import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";

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
    id: string;
    month: string;
    phases: CyclePhase[];
};

const PHASES = {
    menstrual: { color: "#DC143C", name: "Menstrual" },
    follicular: { color: "#9F2B68", name: "Follicular" },
    ovulatory: { color: "#FF69B4", name: "Ovulatory" },
    luteal: { color: "#C71585", name: "Luteal" },
};

type CalendarViewProps = {
    cycles: Cycle[];
    isLoggingMode: boolean;
    tempSelectedDate: string | null;
    onDayPress: (day: DayPress) => void;
};

export default function CalendarView({
    cycles,
    isLoggingMode,
    tempSelectedDate,
    onDayPress,
}: CalendarViewProps) {
    // Display colored dates for calendar
    const showColoredDates = (): Record<string, Marking> => {
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
                    let currDate = moment(phase.start);
                    const endDate = moment(phase.end);
                    while (currDate <= endDate) {
                        const dateString = currDate.format("YYYY-MM-DD");
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
                        currDate = currDate.add(1, "days");
                    }
                }
            });
        });
        return markings;
    };

    return (
        <>
            {/* Calendar Section */}
            <View style={styles.calendarContainer}>
                <Calendar
                    style={{ width: "100%" }}
                    onDayPress={onDayPress}
                    markedDates={showColoredDates()}
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

            {/* Legend Section */}
            <View style={styles.legendContainer}>
                {Object.entries(PHASES).map(([key, phase]) => (
                    <View key={key} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: phase.color }]} />
                        <Text style={styles.legendText}>{phase.name}</Text>
                    </View>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    calendarContainer: {
        backgroundColor: "#F5F0FA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(45, 27, 61, 0.1)',
        marginHorizontal: 8,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    legendContainer: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(45, 27, 61, 0.1)',
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginHorizontal: 8,
        marginBottom: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendColor: {
        borderRadius: 3,
        width: 12,
        height: 12,
    },
    legendText: {
        color: "#2D1B3D",
        fontFamily: "Helvetica",
        fontSize: 12,
        fontWeight: "500",
    },
});
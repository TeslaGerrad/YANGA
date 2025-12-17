import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface ScheduleRideModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}

interface DateOption {
  day: string;
  date: string;
  month: string;
}

interface TimeOption {
  hour: string;
  minute: string;
  period: "AM" | "PM";
}

export default function ScheduleRideModal({
  visible,
  onClose,
  onConfirm,
}: ScheduleRideModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);

  const [selectedDate, setSelectedDate] = useState<DateOption>({
    day: "Wed",
    date: "22",
    month: "Sept",
  });
  const [selectedTime, setSelectedTime] = useState<TimeOption>({
    hour: "03",
    minute: "25",
    period: "PM",
  });

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const dates: DateOption[] = [
    { day: "Thu", date: "23", month: "Sept" },
    { day: "Wed", date: "22", month: "Sept" },
    { day: "Fri", date: "24", month: "Sept" },
  ];

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const handleConfirm = () => {
    const dateString = `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month}`;
    const timeString = `${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`;
    onConfirm(dateString, timeString);
    onClose();
  };

  const renderDatePicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Date</Text>
      <View style={styles.dateOptions}>
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateOption,
              selectedDate.date === date.date && styles.dateOptionSelected,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateDay,
                selectedDate.date === date.date && styles.dateTextSelected,
              ]}
            >
              {date.day}
            </Text>
            <Text
              style={[
                styles.dateNumber,
                selectedDate.date === date.date && styles.dateTextSelected,
              ]}
            >
              {date.date}
            </Text>
            <Text
              style={[
                styles.dateMonth,
                selectedDate.date === date.date && styles.dateTextSelected,
              ]}
            >
              {date.month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimePicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Time</Text>
      <View style={styles.timePickerRow}>
        {/* Hour Picker */}
        <View style={styles.timeColumn}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            snapToInterval={30}
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContent}
          >
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                onPress={() => setSelectedTime({ ...selectedTime, hour })}
              >
                <Text
                  style={[
                    styles.timeOption,
                    selectedTime.hour === hour && styles.timeOptionSelected,
                  ]}
                >
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.timeSeparator}>:</Text>

        {/* Minute Picker */}
        <View style={styles.timeColumn}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            snapToInterval={30}
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContent}
          >
            {minutes.map((minute) => (
              <TouchableOpacity
                key={minute}
                onPress={() => setSelectedTime({ ...selectedTime, minute })}
              >
                <Text
                  style={[
                    styles.timeOption,
                    selectedTime.minute === minute && styles.timeOptionSelected,
                  ]}
                >
                  {minute}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period Picker */}
        <View style={styles.periodColumn}>
          {["AM", "PM"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedTime.period === period && styles.periodOptionSelected,
              ]}
              onPress={() =>
                setSelectedTime({
                  ...selectedTime,
                  period: period as "AM" | "PM",
                })
              }
            >
              <Text
                style={[
                  styles.periodText,
                  selectedTime.period === period && styles.periodTextSelected,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Schedule a Ride</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedInfoCard}>
              <View style={styles.selectedInfo}>
                <Ionicons name="calendar-outline" size={20} color="#FF8200" />
                <Text style={styles.selectedDate}>
                  {selectedDate.day}, {selectedDate.date}{" "}
                  {selectedDate.month.slice(0, 3)}
                </Text>
              </View>
              <View style={styles.selectedInfo}>
                <Ionicons name="time-outline" size={20} color="#FF8200" />
                <Text style={styles.selectedTime}>
                  {selectedTime.hour}:{selectedTime.minute}{" "}
                  {selectedTime.period}
                </Text>
              </View>
            </View>
          </View>

          {/* Date and Time Pickers */}
          <View style={styles.pickersContainer}>
            {renderDatePicker()}
            {renderTimePicker()}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Lato-Bold",
    fontSize: 22,
    color: "#111",
  },
  closeButton: {
    padding: 4,
  },
  selectedInfoCard: {
    backgroundColor: "#FFF5EC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE0C2",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  selectedDate: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
  },
  selectedTime: {
    fontFamily: "Lato-Regular",
    fontSize: 16,
    color: "#111",
  },
  pickersContainer: {
    marginBottom: 24,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  pickerLabel: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
    marginBottom: 12,
  },
  dateOptions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  dateOption: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateOptionSelected: {
    backgroundColor: "#FFF5EC",
    borderColor: "#FF8200",
  },
  dateDay: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#5b5b5b",
    marginBottom: 6,
  },
  dateNumber: {
    fontFamily: "Lato-Bold",
    fontSize: 28,
    color: "#111",
    marginBottom: 6,
  },
  dateMonth: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#5b5b5b",
  },
  dateTextSelected: {
    color: "#FF8200",
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 8,
    height: 120,
  },
  timeColumn: {
    flex: 1,
    height: 90,
  },
  scrollContent: {
    paddingVertical: 30,
  },
  timeOption: {
    fontFamily: "Lato-Regular",
    fontSize: 18,
    color: "#5b5b5b",
    textAlign: "center",
    paddingVertical: 6,
    height: 30,
  },
  timeOptionSelected: {
    fontFamily: "Lato-Bold",
    fontSize: 24,
    color: "#FF8200",
  },
  timeSeparator: {
    fontFamily: "Lato-Bold",
    fontSize: 24,
    color: "#111",
    paddingHorizontal: 4,
  },
  periodColumn: {
    marginLeft: 8,
    gap: 8,
  },
  periodOption: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: "center",
  },
  periodOptionSelected: {
    backgroundColor: "#FF8200",
  },
  periodText: {
    fontFamily: "Lato-Regular",
    fontSize: 14,
    color: "#5b5b5b",
  },
  periodTextSelected: {
    fontFamily: "Lato-Bold",
    color: "#fff",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#111",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#FF8200",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    shadowColor: "#FF8200",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontFamily: "Lato-Bold",
    fontSize: 16,
    color: "#fff",
  },
});

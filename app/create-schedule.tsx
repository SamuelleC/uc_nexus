import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassSchedule } from "../data/class-schedule-data";
import { userScheduleService } from "../data/user-schedule-service";

export default function CreateScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: "create" | "edit" }>();

  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ClassSchedule | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [section, setSection] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");

  const isEditMode = mode === "edit";

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setIsLoading(true);
    const userSchedule = await userScheduleService.getUserSchedule();
    setSchedule(userSchedule);
    setIsLoading(false);
  };

  const handleBack = () => {
    router.replace("/");
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setSection("");
    setCourseCode("");
    setDescription("");
    setIsModalVisible(true);
  };

  const openEditModal = (subject: ClassSchedule) => {
    setEditingSubject(subject);
    setSection(subject.section);
    setCourseCode(subject.courseCode);
    setDescription(subject.description);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingSubject(null);
    setSection("");
    setCourseCode("");
    setDescription("");
  };

  const handleSave = async () => {
    if (!section.trim() || !courseCode.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      if (editingSubject) {
        // Update existing subject
        await userScheduleService.updateSubject(editingSubject.id, {
          section: section.trim(),
          courseCode: courseCode.trim(),
          description: description.trim(),
        });
      } else {
        // Add new subject - time and room will be auto-generated
        await userScheduleService.addSubject({
          section: section.trim(),
          courseCode: courseCode.trim(),
          description: description.trim(),
          schedule: "", // Will be auto-generated
          room: "", // Will be auto-generated
        });
      }

      await loadSchedule();
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Failed to save subject");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Subject",
      "Are you sure you want to delete this subject?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await userScheduleService.deleteSubject(id);
            await loadSchedule();
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header
        title={isEditMode ? "Edit Your Schedule" : "Create Your Schedule"}
        subtitle="Add Subjects"
      />

      {/* Back Button */}
      <View className="px-4 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center mb-2"
        >
          <Ionicons name="arrow-back" size={32} color="#0c3112" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
      >
        {/* Add Subject Button */}
        <TouchableOpacity
          onPress={openAddModal}
          className="bg-white rounded-lg p-4 mb-4 flex-row items-center justify-center border-2 border-dashed border-green-950"
        >
          <View className="bg-green-950 rounded-full p-2 mr-3">
            <Ionicons name="add" size={24} color="white" />
          </View>
          <Text className="text-green-950 font-semibold text-lg">
            Add Subject
          </Text>
        </TouchableOpacity>

        {/* Schedule Table */}
        {schedule.length > 0 ? (
          <View className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <View className="flex-row bg-green-950 p-3">
              <Text
                className="text-white font-bold text-xs"
                style={{ flex: 1.2 }}
              >
                Section
              </Text>
              <Text
                className="text-white font-bold text-xs"
                style={{ flex: 0.8 }}
              >
                Code
              </Text>
              <Text
                className="text-white font-bold text-xs"
                style={{ flex: 1.2 }}
              >
                Description
              </Text>
              <Text
                className="text-white font-bold text-xs"
                style={{ flex: 1 }}
              >
                Schedule
              </Text>
              <Text
                className="text-white font-bold text-xs"
                style={{ flex: 0.5 }}
              >
                Room
              </Text>
              {isEditMode && (
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 0.5 }}
                >
                  Actions
                </Text>
              )}
            </View>

            {/* Table Body */}
            {schedule.map((subject, index) => (
              <View
                key={subject.id}
                className={`flex-row p-3 border-b border-gray-100 items-center ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <Text
                  className="text-gray-700 text-xs"
                  style={{ flex: 1.2 }}
                  numberOfLines={2}
                >
                  {subject.section}
                </Text>
                <Text
                  className="text-gray-800 font-medium text-xs"
                  style={{ flex: 0.8 }}
                >
                  {subject.courseCode}
                </Text>
                <Text
                  className="text-gray-700 text-xs"
                  style={{ flex: 1.2 }}
                  numberOfLines={2}
                >
                  {subject.description}
                </Text>
                <Text className="text-gray-600 text-xs" style={{ flex: 1 }}>
                  {subject.schedule}
                </Text>
                <Text
                  className="text-gray-800 font-medium text-xs"
                  style={{ flex: 0.5 }}
                >
                  {subject.room}
                </Text>
                {isEditMode && (
                  <View style={{ flex: 0.5 }} className="flex-row">
                    <TouchableOpacity
                      onPress={() => openEditModal(subject)}
                      className="mr-2"
                    >
                      <Ionicons name="pencil" size={16} color="#0c3112" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(subject.id)}>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          !isLoading && (
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center text-lg">
                No subjects added yet
              </Text>
              <Text className="text-gray-400 mt-2 text-center">
                Tap the button above to add your first subject
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Add/Edit Subject Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                {editingSubject ? "Edit Subject" : "Add Subject"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Section</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., CITCS 3F Group B"
                value={section}
                onChangeText={setSection}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Course Code
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., CC 106"
                value={courseCode}
                onChangeText={setCourseCode}
                autoCapitalize="characters"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Course Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Application Development"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="mb-6 p-4 bg-gray-100 rounded-lg">
              <Text className="text-gray-500 text-sm text-center">
                Time and Room will be automatically assigned
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-green-950 rounded-lg py-4"
            >
              <Text className="text-white text-center font-semibold text-lg">
                {editingSubject ? "Update Subject" : "Add Subject"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import Header from "@/components/header";
import { SelectField } from "@/components/select-field";
import {
  classScheduleToScheduleTableRow,
  ScheduleTable,
} from "@/components/schedule-table";
import { Ionicons } from "@expo/vector-icons";
import {
  compareSectionDropdownLabels,
  formatSectionDropdownLabel,
  getAllSchedules,
  getCourseCodesForSection,
  getDistinctSectionLabels,
  findCatalogScheduleClass,
  scheduleClassToScheduleTableRow,
  scheduleClassToUserSubjectFields,
  type ScheduleClass,
} from "@/data/api-service";
import { formatBlockSectionDisplay } from "@/utils/section-block";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassSchedule } from "../data/class-schedule-data";
import { userScheduleService } from "../data/user-schedule-service";

const PICKER_PLACEHOLDER_SECTION = "__none_section__";
const PICKER_PLACEHOLDER_CODE = "__none_code__";

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

  const [catalog, setCatalog] = useState<ScheduleClass[]>([]);
  const [catalogState, setCatalogState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const [selectedSection, setSelectedSection] = useState(
    PICKER_PLACEHOLDER_SECTION,
  );
  const [selectedCourseCode, setSelectedCourseCode] = useState(
    PICKER_PLACEHOLDER_CODE,
  );
  const [openSelect, setOpenSelect] = useState<"section" | "course" | null>(
    null,
  );

  const isEditMode = mode === "edit";

  const loadCatalog = useCallback(async () => {
    setCatalogState("loading");
    try {
      const rows = await getAllSchedules();
      setCatalog(rows);
      setCatalogState("ready");
    } catch {
      setCatalog([]);
      setCatalogState("error");
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, []);

  useEffect(() => {
    if (isModalVisible && catalogState === "idle") {
      void loadCatalog();
    }
  }, [isModalVisible, catalogState, loadCatalog]);

  const sectionOptions = useMemo(() => {
    const base = getDistinctSectionLabels(catalog);
    if (editingSubject && catalog.length > 0) {
      const match = catalog.find(
        (r) =>
          r.section.trim() === editingSubject.section.trim() &&
          r.classCode.trim().toUpperCase() ===
            editingSubject.courseCode.trim().toUpperCase(),
      );
      const label = match
        ? formatSectionDropdownLabel(match)
        : editingSubject.section.trim();
      const exists = base.some(
        (b) => b.toUpperCase() === label.toUpperCase(),
      );
      if (label && !exists) {
        return [...base, label].sort(compareSectionDropdownLabels);
      }
    }
    return base;
  }, [catalog, editingSubject]);

  const courseCodeOptions = useMemo(() => {
    if (
      !selectedSection ||
      selectedSection === PICKER_PLACEHOLDER_SECTION
    ) {
      return [] as string[];
    }
    let codes = getCourseCodesForSection(catalog, selectedSection);
    if (editingSubject && catalog.length > 0) {
      const match = catalog.find(
        (r) =>
          r.section.trim() === editingSubject.section.trim() &&
          r.classCode.trim().toUpperCase() ===
            editingSubject.courseCode.trim().toUpperCase(),
      );
      const editSectionLabel = match
        ? formatSectionDropdownLabel(match)
        : editingSubject.section.trim();
      if (
        editSectionLabel.toUpperCase() === selectedSection.trim().toUpperCase()
      ) {
        const c = editingSubject.courseCode.trim();
        if (
          c &&
          !codes.some((x) => x.toUpperCase() === c.toUpperCase())
        ) {
          codes = [...codes, c].sort((a, b) => a.localeCompare(b));
        }
      }
    }
    return codes;
  }, [catalog, selectedSection, editingSubject]);

  const catalogMatch = useMemo(() => {
    if (
      !selectedSection ||
      selectedSection === PICKER_PLACEHOLDER_SECTION ||
      !selectedCourseCode ||
      selectedCourseCode === PICKER_PLACEHOLDER_CODE
    ) {
      return undefined;
    }
    return findCatalogScheduleClass(
      catalog,
      selectedSection,
      selectedCourseCode,
    );
  }, [catalog, selectedSection, selectedCourseCode]);

  const sectionSelectOptions = useMemo(
    () =>
      sectionOptions.map((s) => ({
        label: formatBlockSectionDisplay(s),
        value: s,
      })),
    [sectionOptions],
  );

  const courseSelectOptions = useMemo(
    () => courseCodeOptions.map((code) => ({ label: code, value: code })),
    [courseCodeOptions],
  );

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
    setSelectedSection(PICKER_PLACEHOLDER_SECTION);
    setSelectedCourseCode(PICKER_PLACEHOLDER_CODE);
    setOpenSelect(null);
    setCatalogState(catalog.length > 0 ? "ready" : "idle");
    setIsModalVisible(true);
  };

  const openEditModal = async (subject: ClassSchedule) => {
    setEditingSubject(subject);
    setOpenSelect(null);
    setSelectedCourseCode(
      subject.courseCode.trim() || PICKER_PLACEHOLDER_CODE,
    );
    setIsModalVisible(true);

    let rows = catalog;
    if (rows.length === 0) {
      setCatalogState("loading");
      try {
        rows = await getAllSchedules();
        setCatalog(rows);
        setCatalogState("ready");
      } catch {
        setCatalogState("error");
        rows = [];
      }
    } else {
      setCatalogState("ready");
    }

    const match = rows.find(
      (r) =>
        r.section.trim() === subject.section.trim() &&
        r.classCode.trim().toUpperCase() ===
          subject.courseCode.trim().toUpperCase(),
    );
    setSelectedSection(
      match
        ? formatSectionDropdownLabel(match)
        : subject.section.trim() || PICKER_PLACEHOLDER_SECTION,
    );
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingSubject(null);
    setSelectedSection(PICKER_PLACEHOLDER_SECTION);
    setSelectedCourseCode(PICKER_PLACEHOLDER_CODE);
    setOpenSelect(null);
  };

  const handleSave = async () => {
    if (
      !selectedSection ||
      selectedSection === PICKER_PLACEHOLDER_SECTION ||
      !selectedCourseCode ||
      selectedCourseCode === PICKER_PLACEHOLDER_CODE
    ) {
      Alert.alert("Required", "Please choose a section and a course code.");
      return;
    }

    const match = catalogMatch;
    if (!match) {
      Alert.alert(
        "Not found",
        "No official schedule row matches that section and course. Pick values from the lists.",
      );
      return;
    }

    const payload = scheduleClassToUserSubjectFields(match);

    const duplicate = schedule.some(
      (s) =>
        s.section.trim() === payload.section &&
        s.courseCode.trim().toUpperCase() ===
          payload.courseCode.trim().toUpperCase() &&
        (!editingSubject || s.id !== editingSubject.id),
    );

    if (!editingSubject && duplicate) {
      Alert.alert(
        "Already added",
        "This section and course are already on your schedule.",
      );
      return;
    }

    try {
      if (editingSubject) {
        await userScheduleService.updateSubject(editingSubject.id, payload);
      } else {
        await userScheduleService.addSubject(payload);
      }

      await loadSchedule();
      closeModal();
    } catch {
      Alert.alert("Error", "Failed to save subject");
    }
  };

  const handleDelete = (id: string, onAfterDelete?: () => void) => {
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
            onAfterDelete?.();
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

      <View className="px-4 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          className="mb-2 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={32} color="#0c3112" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
      >
        <TouchableOpacity
          onPress={openAddModal}
          className="mb-4 flex-row items-center justify-center rounded-lg border-2 border-dashed border-green-950 bg-white p-4"
        >
          <View className="mr-3 rounded-full bg-green-950 p-2">
            <Ionicons name="add" size={24} color="white" />
          </View>
          <Text className="text-lg font-semibold text-green-950">
            Add Subject
          </Text>
        </TouchableOpacity>

        {schedule.length > 0 ? (
          <ScheduleTable
            rows={schedule.map(classScheduleToScheduleTableRow)}
            renderActions={
              isEditMode
                ? (row) => (
                    <View className="items-center justify-center">
                      <TouchableOpacity
                        onPress={() => {
                          const s = schedule.find((x) => x.id === row.id);
                          if (s) void openEditModal(s);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="pencil" size={24} color="#0c3112" />
                      </TouchableOpacity>
                    </View>
                  )
                : undefined
            }
          />
        ) : (
          !isLoading && (
            <View className="items-center rounded-lg bg-white p-8">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="mt-4 text-center text-lg text-gray-500">
                No subjects added yet
              </Text>
              <Text className="mt-2 text-center text-gray-400">
                Tap the button above to add your first subject
              </Text>
            </View>
          )
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[90%] rounded-t-3xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">
                {editingSubject ? "Edit Subject" : "Add Subject"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              {catalogState === "loading" && (
                <View className="mb-4 items-center py-6">
                  <ActivityIndicator size="large" color="#052e16" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Loading official schedule options
                  </Text>
                </View>
              )}

              {catalogState === "error" && (
                <View className="mb-4 rounded-lg bg-red-50 p-4">
                  <Text className="text-center text-sm text-red-800">
                    Could not load schedule options. Check your connection.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCatalogState("idle");
                      void loadCatalog();
                    }}
                    className="mt-3 items-center"
                  >
                    <Text className="font-semibold text-green-950">Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {catalogState === "ready" && sectionOptions.length === 0 && (
                <Text className="mb-4 text-center text-sm text-gray-600">
                  No schedules have been published to the mobile app yet. Ask
                  your admin to upload schedules from the web system.
                </Text>
              )}

              {catalogState === "ready" && sectionOptions.length > 0 && (
                <>
                  <SelectField
                    label="Section"
                    placeholder="Select section"
                    value={selectedSection}
                    options={sectionSelectOptions}
                    expanded={openSelect === "section"}
                    onExpandedChange={(next) =>
                      setOpenSelect(next ? "section" : null)
                    }
                    onChange={(v) => {
                      setSelectedSection(v);
                      setSelectedCourseCode(PICKER_PLACEHOLDER_CODE);
                    }}
                  />

                  <SelectField
                    label="Course code"
                    placeholder={
                      selectedSection === PICKER_PLACEHOLDER_SECTION
                        ? "Choose a section first"
                        : "Select course code"
                    }
                    value={selectedCourseCode}
                    options={courseSelectOptions}
                    disabled={
                      selectedSection === PICKER_PLACEHOLDER_SECTION ||
                      courseCodeOptions.length === 0
                    }
                    expanded={openSelect === "course"}
                    onExpandedChange={(next) =>
                      setOpenSelect(next ? "course" : null)
                    }
                    onChange={setSelectedCourseCode}
                  />

                  {catalogMatch && (
                    <View className="mb-6">
                      <Text className="mb-2 text-xs font-bold uppercase text-gray-600">
                        Schedule preview
                      </Text>
                      <ScheduleTable
                        rows={[
                          {
                            ...scheduleClassToScheduleTableRow(catalogMatch),
                            section: formatBlockSectionDisplay(
                              selectedSection,
                            ),
                          },
                        ]}
                      />
                    </View>
                  )}
                </>
              )}

              {editingSubject && (
                <TouchableOpacity
                  onPress={() =>
                    handleDelete(editingSubject.id, closeModal)
                  }
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 py-3.5"
                >
                  <Text className="text-center text-base font-semibold text-red-700">
                    Delete Subject
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSave}
                disabled={
                  !catalogMatch ||
                  catalogState !== "ready" ||
                  sectionOptions.length === 0
                }
                className={`rounded-lg py-4 ${
                  catalogMatch &&
                  catalogState === "ready" &&
                  sectionOptions.length > 0
                    ? "bg-green-950"
                    : "bg-gray-300"
                }`}
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {editingSubject ? "Update Subject" : "Add Subject"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

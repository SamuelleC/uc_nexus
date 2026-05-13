import type { ClassSchedule } from "@/data/class-schedule-data";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { formatBlockSectionDisplay } from "@/utils/section-block";
import { roomCodeOrOriginal } from "@/utils/room-code";

/**
 * Shared horizontal schedule grid (blocks, home, create-schedule).
 * Optional `section` and `renderActions` support the user schedule table.
 */
export type ScheduleTableRow = {
  id: string;
  section?: string | null;
  courseName: string;
  courseCode: string;
  lectureRoom: string;
  lectureInstructor: string;
  lectureTime: string;
  labRoom?: string | null;
  labInstructor?: string | null;
  labTime?: string | null;
};

const W = {
  section: 128,
  courseName: 200,
  courseCode: 108,
  lectureRoom: 124,
  lectureInstructor: 168,
  lectureTime: 180,
  labRoom: 124,
  labInstructor: 168,
  labTime: 180,
  actions: 88,
} as const;

function Cell({
  width,
  header,
  children,
}: {
  width: number;
  header?: boolean;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        width,
        paddingHorizontal: 10,
        paddingVertical: header ? 12 : 10,
        borderRightWidth: 1,
        borderRightColor: header ? "rgba(255,255,255,0.22)" : "#f3f4f6",
        justifyContent: header ? "flex-start" : "flex-start",
      }}
    >
      {children}
    </View>
  );
}

function displayCell(v: string) {
  const t = v?.trim();
  return t && t.length > 0 ? t : "—";
}

/** User-saved subjects → same row shape as official schedule tables. */
export function classScheduleToScheduleTableRow(
  s: ClassSchedule,
): ScheduleTableRow {
  const sec = s.section?.trim();
  return {
    id: s.id,
    ...(sec ? { section: formatBlockSectionDisplay(sec) } : {}),
    courseName: s.description?.trim() || "—",
    courseCode: s.courseCode?.trim() || "—",
    lectureRoom: roomCodeOrOriginal(s.room?.trim() || "—") || "—",
    lectureInstructor: s.instructor?.trim() || "—",
    lectureTime: s.schedule?.trim() || "—",
  };
}

export function ScheduleTable({
  rows,
  renderActions,
}: {
  rows: ScheduleTableRow[];
  renderActions?: (row: ScheduleTableRow) => ReactNode;
}) {
  const nz = (x?: string | null) => !!(x && String(x).trim());
  const showSection = rows.some((r) => nz(r.section));
  const showLab = rows.some((r) => {
    return nz(r.labRoom) || nz(r.labInstructor) || nz(r.labTime);
  });
  const showActions = typeof renderActions === "function";

  const tableWidth =
    (showSection ? W.section : 0) +
    W.courseName +
    W.courseCode +
    W.lectureRoom +
    W.lectureInstructor +
    W.lectureTime +
    (showLab ? W.labRoom + W.labInstructor + W.labTime : 0) +
    (showActions ? W.actions : 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      nestedScrollEnabled
    >
      <View
        style={{ width: tableWidth }}
        className="overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <View className="flex-row bg-green-950">
          {showSection ? (
            <Cell width={W.section} header>
              <Text className="text-[11px] font-bold leading-tight text-white">
                Section
              </Text>
            </Cell>
          ) : null}
          <Cell width={W.courseName} header>
            <Text className="text-[11px] font-bold leading-tight text-white">
              Course Name
            </Text>
          </Cell>
          <Cell width={W.courseCode} header>
            <Text className="text-[11px] font-bold leading-tight text-white">
              Course Code
            </Text>
          </Cell>
          <Cell width={W.lectureRoom} header>
            <Text className="text-[11px] font-bold leading-tight text-white">
              Lecture Room
            </Text>
          </Cell>
          <Cell width={W.lectureInstructor} header>
            <Text className="text-[11px] font-bold leading-tight text-white">
              Lecture Instructor
            </Text>
          </Cell>
          <Cell width={W.lectureTime} header>
            <Text className="text-[11px] font-bold leading-tight text-white">
              Lecture Time
            </Text>
          </Cell>
          {showLab ? (
            <>
              <Cell width={W.labRoom} header>
                <Text className="text-[11px] font-bold leading-tight text-white">
                  Laboratory Room
                </Text>
              </Cell>
              <Cell width={W.labInstructor} header>
                <Text className="text-[11px] font-bold leading-tight text-white">
                  Laboratory Instructor
                </Text>
              </Cell>
              <Cell width={W.labTime} header>
                <Text className="text-[11px] font-bold leading-tight text-white">
                  Laboratory Time
                </Text>
              </Cell>
            </>
          ) : null}
          {showActions ? (
            <Cell width={W.actions} header>
              <Text className="text-[11px] font-bold leading-tight text-white">
                Actions
              </Text>
            </Cell>
          ) : null}
        </View>

        {rows.map((r, index) => (
          <View
            key={r.id}
            className={`flex-row border-b border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
          >
            {showSection ? (
              <Cell width={W.section}>
                <Text
                  className="text-xs leading-snug text-gray-900"
                  numberOfLines={4}
                >
                  {displayCell(r.section ?? "")}
                </Text>
              </Cell>
            ) : null}
            <Cell width={W.courseName}>
              <Text className="text-xs leading-snug text-gray-900" numberOfLines={8}>
                {displayCell(r.courseName)}
              </Text>
            </Cell>
            <Cell width={W.courseCode}>
              <Text className="text-xs font-medium text-gray-900" numberOfLines={4}>
                {displayCell(r.courseCode)}
              </Text>
            </Cell>
            <Cell width={W.lectureRoom}>
              <Text className="text-xs text-gray-800" numberOfLines={4}>
                {displayCell(r.lectureRoom)}
              </Text>
            </Cell>
            <Cell width={W.lectureInstructor}>
              <Text className="text-xs text-gray-800" numberOfLines={6}>
                {displayCell(r.lectureInstructor)}
              </Text>
            </Cell>
            <Cell width={W.lectureTime}>
              <Text className="text-xs text-gray-800" numberOfLines={6}>
                {displayCell(r.lectureTime)}
              </Text>
            </Cell>
            {showLab ? (
              <>
                <Cell width={W.labRoom}>
                  <Text className="text-xs text-gray-800" numberOfLines={4}>
                    {displayCell(r.labRoom ?? "")}
                  </Text>
                </Cell>
                <Cell width={W.labInstructor}>
                  <Text className="text-xs text-gray-800" numberOfLines={6}>
                    {displayCell(r.labInstructor ?? "")}
                  </Text>
                </Cell>
                <Cell width={W.labTime}>
                  <Text className="text-xs text-gray-800" numberOfLines={6}>
                    {displayCell(r.labTime ?? "")}
                  </Text>
                </Cell>
              </>
            ) : null}
            {showActions && renderActions ? (
              <Cell width={W.actions}>{renderActions(r)}</Cell>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

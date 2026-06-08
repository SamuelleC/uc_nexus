/**
 * Supabase REST: published schedules (`schedules_mobile`), blocks, buildings, rooms.
 * Web admin writes to `schedules`; data reaches mobile only after upload to `schedules_mobile`.
 * Prefer env-based `SUPABASE_URL` / `SUPABASE_ANON_KEY` in production.
 */
import { roomCodeOrOriginal } from "@/utils/room-code";

import type { ScheduleTableRow } from "@/components/schedule-table";

const SUPABASE_URL = "https://qapesjenuidodiqjkecd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcGVzamVudWlkb2RpcWprZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTczMTMsImV4cCI6MjA5MDk3MzMxM30.4QTle3oi0qMw3or3llv-R11VGLL-Bio3yfNuo30ZdPg";

/** Published schedule snapshot — populated when web admin uploads to mobile. */
const MOBILE_SCHEDULES_TABLE = "schedules_mobile";

export interface BlockInfo {
  block: string;
  scheduleCount: number;
}

export interface ScheduleClass {
  id: number;
  section: string;
  classCode: string;
  className: string;
  room: string;
  roomId: string | null;
  instructor: string;
  department: string;
  classSize: number;
  date: string | null;
  days: string[];
  startTime: string;
  endTime: string;
  semester: string;
  schoolYear: string;
  yearLevel: string | null;
  term: string | null;
  block: string | null;
  isCITCC: boolean;
  lecRoom: string | null;
  lecInstructor: string | null;
  lecDays: string | null;
  lecStartTime: string | null;
  lecEndTime: string | null;
  labRoom: string | null;
  labInstructor: string | null;
  labDays: string | null;
  labStartTime: string | null;
  labEndTime: string | null;
  /** Populated when mapping from local bundled schedule (no structured times) */
  legacySchedule?: string | null;
}

export interface BlockScheduleData {
  block: string;
  yearLevel: number;
  department: string;
  classes: ScheduleClass[];
}

export interface Building {
  id: string;
  name: string;
  full_name: string;
  floors: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  building_id: string;
  floor: number;
  type: string;
  is_active: boolean;
}

// Raw schedule from Supabase (snake_case)
interface SupabaseSchedule {
  id: number;
  class_code: string;
  class_name: string;
  room_id: string | null;
  room_display: string | null;
  instructor: string | null;
  department_id: string | null;
  class_size: number;
  schedule_date: string | null;
  start_time: string;
  end_time: string;
  days: string | null;
  semester: string | null;
  school_year: string | null;
  is_active: boolean;
  year_level: string | null;
  term: string | null;
  block: string | null;
  is_citcc: boolean;
  lec_room: string | null;
  lec_instructor: string | null;
  lec_days: string | null;
  lec_start_time: string | null;
  lec_end_time: string | null;
  lab_room: string | null;
  lab_instructor: string | null;
  lab_days: string | null;
  lab_start_time: string | null;
  lab_end_time: string | null;
}

async function supabaseFetch<T>(
  table: string,
  query: string = "",
): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? "?" + query : ""}`;
  console.log(`[Supabase] Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    console.log(`[Supabase] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Supabase] Error: ${response.status} - ${errorText}`);
      return [];
    }

    const data = await response.json();
    console.log(`[Supabase] Success! Got ${data.length} records`);
    return data as T[];
  } catch (error) {
    console.error("[Supabase] Fetch error:", error);
    return [];
  }
}

function transformSchedule(s: SupabaseSchedule): ScheduleClass {
  const daysArray = s.days
    ? s.days.split(/[,\/]/).map((d) => d.trim().toLowerCase())
    : [];

  return {
    id: s.id,
    section:
      `${s.department_id || ""} ${s.year_level || ""}${s.block || ""}`.trim(),
    classCode: s.class_code,
    className: s.class_name,
    room: roomCodeOrOriginal(s.room_display || s.room_id || ""),
    roomId: s.room_id,
    instructor: s.instructor || "",
    department: s.department_id || "",
    classSize: s.class_size || 0,
    date: s.schedule_date,
    days: daysArray,
    startTime: s.start_time ? s.start_time.substring(0, 5) : "",
    endTime: s.end_time ? s.end_time.substring(0, 5) : "",
    semester: s.semester || "",
    schoolYear: s.school_year || "",
    yearLevel: s.year_level,
    term: s.term,
    block: s.block,
    isCITCC: s.is_citcc || false,
    lecRoom: s.lec_room ? roomCodeOrOriginal(s.lec_room) : null,
    lecInstructor: s.lec_instructor,
    lecDays: s.lec_days,
    lecStartTime: s.lec_start_time ? s.lec_start_time.substring(0, 5) : null,
    lecEndTime: s.lec_end_time ? s.lec_end_time.substring(0, 5) : null,
    labRoom: s.lab_room ? roomCodeOrOriginal(s.lab_room) : null,
    labInstructor: s.lab_instructor,
    labDays: s.lab_days,
    labStartTime: s.lab_start_time ? s.lab_start_time.substring(0, 5) : null,
    labEndTime: s.lab_end_time ? s.lab_end_time.substring(0, 5) : null,
  };
}

const DAY_ABBREV_MAP: Record<string, string> = {
  monday: "M",
  tuesday: "T",
  wednesday: "W",
  thursday: "Th",
  friday: "F",
  saturday: "S",
  sunday: "Su",
};

function parseDaysFromString(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\/]/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function abbrevDayList(list: string[]): string {
  if (!list.length) return "";
  return list
    .map((d) => DAY_ABBREV_MAP[d] || d.charAt(0).toUpperCase())
    .join("/");
}

function formatTimeShort(time: string | null | undefined): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  if (Number.isNaN(h)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes ?? "00"} ${ampm}`;
}

/** One-line schedule text for calendar / user schedule rows */
export function formatScheduleClassCalendarLine(c: ScheduleClass): string {
  const lecDaysList = parseDaysFromString(c.lecDays);
  const dayList = lecDaysList.length > 0 ? lecDaysList : c.days || [];
  const ab = abbrevDayList(dayList);
  const st = (c.lecStartTime || c.startTime || "").trim();
  const et = (c.lecEndTime || c.endTime || "").trim();
  if (!st && !et) {
    if (c.legacySchedule?.trim()) return c.legacySchedule.trim();
    return "—";
  }
  const range = `${formatTimeShort(st)}-${formatTimeShort(et)}`;
  return ab ? `${ab} ${range}` : range;
}

function rowHasLaboratorySchedule(c: ScheduleClass): boolean {
  return !!(
    c.labRoom?.trim() ||
    c.labInstructor?.trim() ||
    c.labDays?.trim() ||
    c.labStartTime?.trim() ||
    c.labEndTime?.trim()
  );
}

function formatLabTimeLineForClass(c: ScheduleClass): string {
  const dayList = parseDaysFromString(c.labDays);
  const ab = abbrevDayList(dayList);
  const st = (c.labStartTime || "").trim();
  const et = (c.labEndTime || "").trim();
  if (!st && !et) return "";
  const range = `${formatTimeShort(st)}-${formatTimeShort(et)}`;
  return ab ? `${ab} ${range}` : range;
}

/** Single row for `ScheduleTable` (blocks screen, add-subject preview, etc.) */
export function scheduleClassToScheduleTableRow(
  c: ScheduleClass,
): ScheduleTableRow {
  const hasLab = rowHasLaboratorySchedule(c);
  return {
    id: String(c.id),
    courseName: c.className,
    courseCode: c.classCode,
    lectureRoom:
      roomCodeOrOriginal(c.lecRoom?.trim() || c.room?.trim() || "—") || "—",
    lectureInstructor:
      c.lecInstructor?.trim() || c.instructor?.trim() || "—",
    lectureTime: formatScheduleClassCalendarLine(c),
    labRoom: hasLab ? roomCodeOrOriginal(c.labRoom?.trim() || "—") : "",
    labInstructor: hasLab ? c.labInstructor?.trim() || "—" : "",
    labTime: hasLab ? formatLabTimeLineForClass(c) || "—" : "",
  };
}

/** Strip leading "BLOCK" prefix (case-insensitive) from block identifiers */
function stripBlockPrefix(raw: string): string {
  const t = String(raw).trim();
  const stripped = t.replace(/^block\s*/i, "").trim();
  return stripped.length > 0 ? stripped : t;
}

function compactUpper(s: string): string {
  return s.replace(/\s+/g, "").toUpperCase();
}

/**
 * Section label for pickers: `{year}-{block}` e.g. `1-H`, `2-K`, `3-H`.
 */
export function formatSectionDropdownLabel(c: ScheduleClass): string {
  const blockRaw = (c.block ?? "").toString().trim();
  let seg = blockRaw ? stripBlockPrefix(blockRaw) : "";
  if (/^\d{1,2}-.+$/i.test(seg)) {
    return compactUpper(seg);
  }

  const yr = (c.yearLevel ?? "").toString().trim();
  const yNum = yr.replace(/\D/g, "");
  if (yNum && seg) {
    return `${yNum}-${compactUpper(seg)}`;
  }

  const sec = (c.section || "").trim();
  const tail = sec.match(/(\d{1,2})\s*([A-Za-z0-9\-]+)\s*$/);
  if (tail) {
    return `${tail[1]}-${compactUpper(tail[2])}`;
  }

  const fallback = stripBlockPrefix(sec);
  if (fallback) return compactUpper(fallback);

  return compactUpper(sec) || "—";
}

export function compareSectionDropdownLabels(a: string, b: string): number {
  const ma = /^(\d+)-(.+)$/.exec(a);
  const mb = /^(\d+)-(.+)$/.exec(b);
  if (ma && mb) {
    const ya = parseInt(ma[1], 10);
    const yb = parseInt(mb[1], 10);
    if (ya !== yb) return ya - yb;
    return ma[2].localeCompare(mb[2], undefined, { numeric: true });
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

export function getDistinctSectionLabels(rows: ScheduleClass[]): string[] {
  const set = new Set(
    rows
      .map((r) => formatSectionDropdownLabel(r))
      .filter((s) => s && s !== "—"),
  );
  return Array.from(set).sort(compareSectionDropdownLabels);
}

export function getCourseCodesForSection(
  rows: ScheduleClass[],
  sectionDropdownLabel: string,
): string[] {
  const key = sectionDropdownLabel.trim().toUpperCase();
  const codes = new Set(
    rows
      .filter(
        (r) => formatSectionDropdownLabel(r).toUpperCase() === key,
      )
      .map((r) => r.classCode.trim())
      .filter(Boolean),
  );
  return Array.from(codes).sort((a, b) => a.localeCompare(b));
}

export function findCatalogScheduleClass(
  rows: ScheduleClass[],
  sectionDropdownLabel: string,
  classCode: string,
): ScheduleClass | undefined {
  const key = sectionDropdownLabel.trim().toUpperCase();
  const code = classCode.trim().toUpperCase();
  return rows.find(
    (r) =>
      formatSectionDropdownLabel(r).toUpperCase() === key &&
      r.classCode.trim().toUpperCase() === code,
  );
}

/** Map a DB schedule row into fields stored in the user's personal schedule */
export function scheduleClassToUserSubjectFields(c: ScheduleClass): {
  section: string;
  courseCode: string;
  description: string;
  schedule: string;
  room: string;
  instructor?: string;
} {
  const roomDisplay =
    (c.lecRoom && c.lecRoom.trim()) || (c.room && c.room.trim()) || "—";
  const inst =
    (c.lecInstructor && c.lecInstructor.trim()) ||
    (c.instructor && c.instructor.trim()) ||
    "";
  return {
    section: c.section.trim(),
    courseCode: c.classCode.trim(),
    description: c.className.trim(),
    schedule: formatScheduleClassCalendarLine(c),
    room: roomDisplay,
    ...(inst ? { instructor: inst } : {}),
  };
}

/**
 * Get blocks that have schedules for a specific department and year level
 */
export async function getBlocksWithSchedules(
  department: string,
  yearLevel: number,
): Promise<BlockInfo[]> {
  // Query schedules for this department and year level
  const deptUpper = department.toUpperCase();
  const query = `department_id=eq.${deptUpper}&year_level=eq.${yearLevel}&select=block`;

  const schedules = await supabaseFetch<{ block: string | null }>(
    MOBILE_SCHEDULES_TABLE,
    query,
  );

  // Group by block and count
  const blockCounts: Record<string, number> = {};
  for (const s of schedules) {
    if (s.block) {
      blockCounts[s.block] = (blockCounts[s.block] || 0) + 1;
    }
  }

  // Convert to BlockInfo array
  const blocks: BlockInfo[] = Object.entries(blockCounts)
    .map(([block, count]) => ({
      block,
      scheduleCount: count,
    }))
    .sort((a, b) => a.block.localeCompare(b.block));

  console.log(`[Supabase] Found ${blocks.length} blocks with schedules`);
  return blocks;
}

/**
 * Get schedule for a specific block
 */
export async function getBlockSchedule(
  department: string,
  yearLevel: number,
  block: string,
): Promise<BlockScheduleData | null> {
  const deptUpper = department.toUpperCase();
  const blockUpper = block.toUpperCase();
  const query = `department_id=eq.${deptUpper}&year_level=eq.${yearLevel}&block=eq.${blockUpper}&order=start_time`;

  const schedules = await supabaseFetch<SupabaseSchedule>(
    MOBILE_SCHEDULES_TABLE,
    query,
  );

  if (schedules.length === 0) {
    return null;
  }

  return {
    block: blockUpper,
    yearLevel,
    department: deptUpper,
    classes: schedules.map(transformSchedule),
  };
}

/**
 * Get all blocks overview (grouped by department and year)
 */
export async function getBlocksOverview(): Promise<Record<
  string,
  Record<number, BlockInfo[]>
> | null> {
  const query = `select=department_id,year_level,block`;
  const schedules = await supabaseFetch<{
    department_id: string | null;
    year_level: string | null;
    block: string | null;
  }>(MOBILE_SCHEDULES_TABLE, query);

  const overview: Record<string, Record<number, BlockInfo[]>> = {};

  // Group by department, year, block and count
  const counts: Record<string, Record<string, Record<string, number>>> = {};
  for (const s of schedules) {
    if (!s.department_id || !s.year_level || !s.block) continue;

    const dept = s.department_id;
    const year = s.year_level;
    const block = s.block;

    if (!counts[dept]) counts[dept] = {};
    if (!counts[dept][year]) counts[dept][year] = {};
    counts[dept][year][block] = (counts[dept][year][block] || 0) + 1;
  }

  // Convert to overview format
  for (const [dept, years] of Object.entries(counts)) {
    overview[dept] = {};
    for (const [year, blocks] of Object.entries(years)) {
      const yearNum = parseInt(year);
      overview[dept][yearNum] = Object.entries(blocks)
        .map(([block, count]) => ({ block, scheduleCount: count }))
        .sort((a, b) => a.block.localeCompare(b.block));
    }
  }

  return Object.keys(overview).length > 0 ? overview : null;
}

/**
 * Get all schedules
 */
export async function getAllSchedules(): Promise<ScheduleClass[]> {
  const schedules = await supabaseFetch<SupabaseSchedule>(
    MOBILE_SCHEDULES_TABLE,
    "order=start_time",
  );
  return schedules.map(transformSchedule);
}

/**
 * Get schedules by department
 */
export async function getSchedulesByDepartment(
  department: string,
): Promise<ScheduleClass[]> {
  const deptUpper = department.toUpperCase();
  const schedules = await supabaseFetch<SupabaseSchedule>(
    MOBILE_SCHEDULES_TABLE,
    `department_id=eq.${deptUpper}&order=start_time`,
  );
  return schedules.map(transformSchedule);
}

/**
 * Get all buildings
 */
export async function getAllBuildings(): Promise<Building[]> {
  return await supabaseFetch<Building>("buildings", "order=name");
}

/**
 * Get all rooms
 */
export async function getAllRooms(): Promise<Room[]> {
  return await supabaseFetch<Room>("rooms", "is_active=eq.true&order=name");
}

/**
 * Get rooms by building
 */
export async function getRoomsByBuilding(buildingId: string): Promise<Room[]> {
  return await supabaseFetch<Room>(
    "rooms",
    `building_id=eq.${buildingId}&is_active=eq.true&order=floor,name`,
  );
}

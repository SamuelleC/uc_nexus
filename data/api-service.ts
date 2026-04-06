// API Service for fetching data from Supabase
// Supabase provides a REST API that works with mobile apps (no security block!)

// =============================================================================
// CONFIGURATION - Replace these with your Supabase project credentials
// Find them at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
// =============================================================================
const SUPABASE_URL = "https://qapesjenuidodiqjkecd.supabase.co"; // e.g., "https://abcdefgh.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcGVzamVudWlkb2RpcWprZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTczMTMsImV4cCI6MjA5MDk3MzMxM30.4QTle3oi0qMw3or3llv-R11VGLL-Bio3yfNuo30ZdPg"; // The public "anon" key

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// SUPABASE FETCH HELPER
// =============================================================================

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

// =============================================================================
// TRANSFORM HELPERS
// =============================================================================

function transformSchedule(s: SupabaseSchedule): ScheduleClass {
  // Parse days string to array (e.g., "monday,wednesday" -> ["monday", "wednesday"])
  const daysArray = s.days
    ? s.days.split(/[,\/]/).map((d) => d.trim().toLowerCase())
    : [];

  return {
    id: s.id,
    section:
      `${s.department_id || ""} ${s.year_level || ""}${s.block || ""}`.trim(),
    classCode: s.class_code,
    className: s.class_name,
    room: s.room_display || s.room_id || "",
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
    lecRoom: s.lec_room,
    lecInstructor: s.lec_instructor,
    lecDays: s.lec_days,
    lecStartTime: s.lec_start_time ? s.lec_start_time.substring(0, 5) : null,
    lecEndTime: s.lec_end_time ? s.lec_end_time.substring(0, 5) : null,
    labRoom: s.lab_room,
    labInstructor: s.lab_instructor,
    labDays: s.lab_days,
    labStartTime: s.lab_start_time ? s.lab_start_time.substring(0, 5) : null,
    labEndTime: s.lab_end_time ? s.lab_end_time.substring(0, 5) : null,
  };
}

// =============================================================================
// BLOCKS API
// =============================================================================

/**
 * Get blocks that have schedules for a specific department and year level
 */
export async function getBlocksWithSchedules(
  department: string,
  yearLevel: number,
): Promise<BlockInfo[]> {
  // Query schedules for this department and year level
  const deptUpper = department.toUpperCase();
  const query = `department_id=eq.${deptUpper}&year_level=eq.${yearLevel}&is_active=eq.true&select=block`;

  const schedules = await supabaseFetch<{ block: string | null }>(
    "schedules",
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
  const query = `department_id=eq.${deptUpper}&year_level=eq.${yearLevel}&block=eq.${blockUpper}&is_active=eq.true&order=start_time`;

  const schedules = await supabaseFetch<SupabaseSchedule>("schedules", query);

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
  const query = `is_active=eq.true&select=department_id,year_level,block`;
  const schedules = await supabaseFetch<{
    department_id: string | null;
    year_level: string | null;
    block: string | null;
  }>("schedules", query);

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

// =============================================================================
// SCHEDULES API
// =============================================================================

/**
 * Get all schedules
 */
export async function getAllSchedules(): Promise<ScheduleClass[]> {
  const schedules = await supabaseFetch<SupabaseSchedule>(
    "schedules",
    "is_active=eq.true&order=start_time",
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
    "schedules",
    `department_id=eq.${deptUpper}&is_active=eq.true&order=start_time`,
  );
  return schedules.map(transformSchedule);
}

// =============================================================================
// BUILDINGS & ROOMS API
// =============================================================================

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

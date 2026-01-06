import { pgTable, uuid, varchar, text, timestamp, boolean, integer, real, json, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============== ENUMS ==============
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended"]);
export const personStatusEnum = pgEnum("person_status", ["active", "inactive"]);
export const cameraTypeEnum = pgEnum("camera_type", ["entry", "exit"]);
export const cameraStatusEnum = pgEnum("camera_status", ["online", "offline", "degraded"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "running", "ended", "locked"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "late", "absent"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "assigned", "ignored"]);

// ============== ORGANIZATION & AUTH ==============

export const organizations = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    settings: json("settings"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    level: integer("level").default(1).notNull(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references(() => units.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    status: userStatusEnum("status").default("active").notNull(),
    unitId: uuid("unit_id").references(() => units.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
    scopeType: varchar("scope_type", { length: 50 }).default("unit").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
    resource: varchar("resource", { length: 100 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
});

export const userRoles = pgTable("user_roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id").references(() => units.id),
});

// ============== PERSONS & FACE PROFILES ==============

export const persons = pgTable("persons", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    employeeId: varchar("employee_id", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    unitId: uuid("unit_id").notNull().references(() => units.id),
    status: personStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const faceProfiles = pgTable("face_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
    embeddingRef: text("embedding_ref").notNull(),
    imageUrl: text("image_url"),
    qualityScore: real("quality_score").default(0),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============== ROOMS & CAMERAS ==============

export const rooms = pgTable("rooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    location: text("location"),
    capacity: integer("capacity"),
    unitId: uuid("unit_id").notNull().references(() => units.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cameras = pgTable("cameras", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    rtspUrl: text("rtsp_url").notNull(),
    type: cameraTypeEnum("type").default("entry").notNull(),
    roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    roiConfig: json("roi_config"),
    threshold: real("threshold").default(0.85),
    status: cameraStatusEnum("status").default("offline").notNull(),
    lastHeartbeat: timestamp("last_heartbeat"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deviceStatuses = pgTable("device_statuses", {
    id: uuid("id").primaryKey().defaultRandom(),
    cameraId: uuid("camera_id").notNull().references(() => cameras.id, { onDelete: "cascade" }),
    status: cameraStatusEnum("status").notNull(),
    fps: real("fps"),
    errorMsg: text("error_msg"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============== SESSIONS & ATTENDANCE ==============

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    roomId: uuid("room_id").notNull().references(() => rooms.id),
    hostId: uuid("host_id").notNull().references(() => users.id),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    gracePeriod: integer("grace_period").default(15),
    status: sessionStatusEnum("status").default("scheduled").notNull(),
    lockedAt: timestamp("locked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionRosters = pgTable("session_rosters", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
    personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
    isRequired: boolean("is_required").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceRecords = pgTable("attendance_records", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
    personId: uuid("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").default("absent").notNull(),
    checkinTime: timestamp("checkin_time"),
    checkoutTime: timestamp("checkout_time"),
    checkinCameraId: uuid("checkin_camera_id"),
    checkoutCameraId: uuid("checkout_camera_id"),
    isManual: boolean("is_manual").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============== AI EVENTS ==============

export const recognitionEvents = pgTable("recognition_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
    cameraId: uuid("camera_id").notNull().references(() => cameras.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => persons.id),
    confidence: real("confidence").notNull(),
    snapshotRef: text("snapshot_ref"),
    direction: varchar("direction", { length: 20 }).notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const unknownFaces = pgTable("unknown_faces", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
    cameraId: uuid("camera_id").notNull().references(() => cameras.id, { onDelete: "cascade" }),
    snapshotRef: text("snapshot_ref").notNull(),
    embeddingRef: text("embedding_ref"),
    reviewStatus: reviewStatusEnum("review_status").default("pending").notNull(),
    assignedToPersonId: uuid("assigned_to_person_id"),
    reviewedById: uuid("reviewed_by_id"),
    reviewedAt: timestamp("reviewed_at"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============== AUDIT LOG ==============

export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),
    oldValue: json("old_value"),
    newValue: json("new_value"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============== RELATIONS ==============

export const organizationsRelations = relations(organizations, ({ many }) => ({
    units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
    organization: one(organizations, { fields: [units.organizationId], references: [organizations.id] }),
    parent: one(units, { fields: [units.parentId], references: [units.id], relationName: "unitHierarchy" }),
    children: many(units, { relationName: "unitHierarchy" }),
    users: many(users),
    persons: many(persons),
    rooms: many(rooms),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    unit: one(units, { fields: [users.unitId], references: [units.id] }),
    userRoles: many(userRoles),
    sessions: many(sessions),
    auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    permissions: many(rolePermissions),
    userRoles: many(userRoles),
}));

export const personsRelations = relations(persons, ({ one, many }) => ({
    unit: one(units, { fields: [persons.unitId], references: [units.id] }),
    faceProfiles: many(faceProfiles),
    sessionRosters: many(sessionRosters),
    attendanceRecords: many(attendanceRecords),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    unit: one(units, { fields: [rooms.unitId], references: [units.id] }),
    cameras: many(cameras),
    sessions: many(sessions),
}));

export const camerasRelations = relations(cameras, ({ one, many }) => ({
    room: one(rooms, { fields: [cameras.roomId], references: [rooms.id] }),
    deviceStatuses: many(deviceStatuses),
    recognitionEvents: many(recognitionEvents),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
    room: one(rooms, { fields: [sessions.roomId], references: [rooms.id] }),
    host: one(users, { fields: [sessions.hostId], references: [users.id] }),
    rosters: many(sessionRosters),
    attendanceRecords: many(attendanceRecords),
    recognitionEvents: many(recognitionEvents),
    unknownFaces: many(unknownFaces),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
    unit: one(units, { fields: [userRoles.unitId], references: [units.id] }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
    permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const faceProfilesRelations = relations(faceProfiles, ({ one }) => ({
    person: one(persons, { fields: [faceProfiles.personId], references: [persons.id] }),
}));

export const sessionRostersRelations = relations(sessionRosters, ({ one }) => ({
    session: one(sessions, { fields: [sessionRosters.sessionId], references: [sessions.id] }),
    person: one(persons, { fields: [sessionRosters.personId], references: [persons.id] }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
    session: one(sessions, { fields: [attendanceRecords.sessionId], references: [sessions.id] }),
    person: one(persons, { fields: [attendanceRecords.personId], references: [persons.id] }),
}));


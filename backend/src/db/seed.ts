import { db } from "./index";
import { organizations, units, users, roles, permissions, rolePermissions, userRoles, persons, rooms, cameras } from "./schema";
import { hash } from "bcrypt";

async function seed() {
    console.log("🌱 Seeding database...");

    // Create permissions
    const permissionData = [
        { name: "organizations:manage", resource: "organizations", action: "manage" },
        { name: "units:manage", resource: "units", action: "manage" },
        { name: "users:manage", resource: "users", action: "manage" },
        { name: "persons:manage", resource: "persons", action: "manage" },
        { name: "rooms:manage", resource: "rooms", action: "manage" },
        { name: "cameras:manage", resource: "cameras", action: "manage" },
        { name: "sessions:manage", resource: "sessions", action: "manage" },
        { name: "attendance:manage", resource: "attendance", action: "manage" },
        { name: "reports:read", resource: "reports", action: "read" },
        { name: "organizations:read", resource: "organizations", action: "read" },
        { name: "units:read", resource: "units", action: "read" },
        { name: "users:read", resource: "users", action: "read" },
        { name: "persons:read", resource: "persons", action: "read" },
        { name: "rooms:read", resource: "rooms", action: "read" },
        { name: "cameras:read", resource: "cameras", action: "read" },
        { name: "sessions:read", resource: "sessions", action: "read" },
        { name: "attendance:read", resource: "attendance", action: "read" },
        { name: "sessions:create", resource: "sessions", action: "create" },
        { name: "sessions:update", resource: "sessions", action: "update" },
        { name: "attendance:update", resource: "attendance", action: "update" },
    ];

    const createdPerms = await db.insert(permissions).values(permissionData).returning();
    console.log(`✅ Created ${createdPerms.length} permissions`);

    // Create roles
    const [superAdminRole] = await db.insert(roles).values({
        name: "super_admin",
        description: "Full system access",
        scopeType: "system",
    }).returning();

    const [adminRole] = await db.insert(roles).values({
        name: "admin",
        description: "Unit administrator",
        scopeType: "unit",
    }).returning();

    const [hostRole] = await db.insert(roles).values({
        name: "host",
        description: "Session host/teacher",
        scopeType: "unit",
    }).returning();

    const [userRole] = await db.insert(roles).values({
        name: "user",
        description: "Regular user/attendee",
        scopeType: "unit",
    }).returning();

    console.log("✅ Created roles");

    // Assign all permissions to super_admin
    await db.insert(rolePermissions).values(
        createdPerms.map(p => ({ roleId: superAdminRole.id, permissionId: p.id }))
    );

    // Assign read + manage permissions to admin
    const adminPerms = createdPerms.filter(p =>
        p.name.includes(":manage") || p.name.includes(":read")
    );
    await db.insert(rolePermissions).values(
        adminPerms.map(p => ({ roleId: adminRole.id, permissionId: p.id }))
    );

    // Assign host permissions
    const hostPerms = createdPerms.filter(p =>
        p.name.includes("sessions:") ||
        p.name.includes("attendance:") ||
        p.name.includes(":read")
    );
    await db.insert(rolePermissions).values(
        hostPerms.map(p => ({ roleId: hostRole.id, permissionId: p.id }))
    );

    // Assign user permissions (read only)
    const userPerms = createdPerms.filter(p => p.name.includes(":read"));
    await db.insert(rolePermissions).values(
        userPerms.map(p => ({ roleId: userRole.id, permissionId: p.id }))
    );

    console.log("✅ Assigned permissions to roles");

    // Create organization
    const [org] = await db.insert(organizations).values({
        name: "Công ty Demo",
        code: "DEMO",
        settings: { timezone: "Asia/Ho_Chi_Minh" },
    }).returning();

    console.log("✅ Created organization");

    // Create units
    const [mainUnit] = await db.insert(units).values({
        name: "Trụ sở chính",
        level: 1,
        organizationId: org.id,
    }).returning();

    const [itUnit] = await db.insert(units).values({
        name: "Phòng IT",
        level: 2,
        organizationId: org.id,
        parentId: mainUnit.id,
    }).returning();

    const [hrUnit] = await db.insert(units).values({
        name: "Phòng Nhân sự",
        level: 2,
        organizationId: org.id,
        parentId: mainUnit.id,
    }).returning();

    console.log("✅ Created units");

    // Create super admin user
    const passwordHash = await hash("admin123", 10);
    const [adminUser] = await db.insert(users).values({
        email: "admin@demo.com",
        passwordHash,
        fullName: "Super Admin",
        unitId: mainUnit.id,
    }).returning();

    await db.insert(userRoles).values({
        userId: adminUser.id,
        roleId: superAdminRole.id,
    });

    // Create host user
    const [hostUser] = await db.insert(users).values({
        email: "host@demo.com",
        passwordHash,
        fullName: "Nguyễn Văn Host",
        unitId: itUnit.id,
    }).returning();

    await db.insert(userRoles).values({
        userId: hostUser.id,
        roleId: hostRole.id,
    });

    console.log("✅ Created users");

    // Create rooms
    const [room1] = await db.insert(rooms).values({
        name: "Phòng họp A",
        location: "Tầng 1",
        capacity: 20,
        unitId: mainUnit.id,
    }).returning();

    const [room2] = await db.insert(rooms).values({
        name: "Phòng họp B",
        location: "Tầng 2",
        capacity: 50,
        unitId: mainUnit.id,
    }).returning();

    console.log("✅ Created rooms");

    // Create cameras
    await db.insert(cameras).values([
        {
            name: "Camera cửa vào A",
            rtspUrl: "rtsp://192.168.1.100:554/stream",
            type: "entry",
            roomId: room1.id,
            threshold: 0.85,
        },
        {
            name: "Camera cửa ra A",
            rtspUrl: "rtsp://192.168.1.101:554/stream",
            type: "exit",
            roomId: room1.id,
            threshold: 0.85,
        },
        {
            name: "Camera cửa vào B",
            rtspUrl: "rtsp://192.168.1.102:554/stream",
            type: "entry",
            roomId: room2.id,
            threshold: 0.85,
        },
    ]);

    console.log("✅ Created cameras");

    // Create sample persons
    const personNames = [
        "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường",
        "Phạm Thị Dung", "Hoàng Văn Em", "Vũ Thị Phương",
        "Đặng Văn Giang", "Bùi Thị Hương", "Ngô Văn Inh", "Lý Thị Kim"
    ];

    await db.insert(persons).values(
        personNames.map((name, i) => ({
            fullName: name,
            employeeId: `EMP${String(i + 1).padStart(3, "0")}`,
            email: `${name.toLowerCase().replace(/ /g, ".")}@demo.com`,
            unitId: i < 5 ? itUnit.id : hrUnit.id,
        }))
    );

    console.log("✅ Created sample persons");

    console.log("\n🎉 Seed completed!");
    console.log("\n📧 Login credentials:");
    console.log("   Email: admin@demo.com");
    console.log("   Password: admin123");
    console.log("\n   Email: host@demo.com");
    console.log("   Password: admin123");

    process.exit(0);
}

seed().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/userModel");
const Doctor = require("./models/doctorModel");
const Notification = require("./models/notificationModel");
const Appointment = require("./models/appointmentModel");

// MongoDB URI (change the database name if needed)
const MONGO_URI = "mongodb://localhost:27017/your_database_name";

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split("T")[0];
}

function randomTime() {
  const hours = Math.floor(Math.random() * 9 + 9); // 9 AM to 5 PM
  const minutes = Math.random() > 0.5 ? "00" : "30";
  const suffix = hours < 12 ? "AM" : "PM";
  const displayHour = hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes} ${suffix}`;
}

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await mongoose.connection.db.dropDatabase();
    console.log("🧹 Dropped existing database");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Users
    const users = [];
    for (let i = 1; i <= 15; i++) {
      users.push(
        new User({
          firstname: `User${i}`,
          lastname: `Test${i}`,
          email: `user${i}@example.com`,
          password: hashedPassword,
          age: 20 + i,
          gender: i % 2 === 0 ? "male" : "female",
          mobile: 9000000000 + i,
          address: `House No. ${i}, Cityville`,
          isDoctor: i <= 5,
          isAdmin: i === 1,
        })
      );
    }

    const savedUsers = await User.insertMany(users);
    console.log("✅ Inserted Users:");
    console.table(savedUsers.map(u => ({
      name: `${u.firstname} ${u.lastname}`,
      email: u.email,
      isDoctor: u.isDoctor,
      isAdmin: u.isAdmin,
    })));

    // Create Doctors
    const specializations = ["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"];
    const doctors = [];

    for (let i = 0; i < 5; i++) {
      doctors.push(
        new Doctor({
          userId: savedUsers[i]._id,
          email: savedUsers[i].email,
          specialization: specializations[i],
          experience: 3 + i,
          fees: 100 + i * 50,
          isDoctor: true,
        })
      );
    }

    const savedDoctors = await Doctor.insertMany(doctors);
    console.log("✅ Inserted Doctors:");
    console.table(savedDoctors.map(d => ({
      email: d.email,
      specialization: d.specialization,
      experience: d.experience,
      fees: d.fees,
    })));

    // Create Notifications
    const notifications = [];
    for (let i = 5; i < 13; i++) {
      notifications.push(
        new Notification({
          userId: savedUsers[i]._id,
          isRead: i % 2 === 0,
          content: `Notification ${i - 4}: You have a new message from the system.`,
        })
      );
    }

    const savedNotifications = await Notification.insertMany(notifications);
    console.log("✅ Inserted Notifications:");
    console.table(savedNotifications.map(n => ({
      userId: n.userId.toString(),
      isRead: n.isRead,
      content: n.content,
    })));

    // Create Appointments
    const appointments = [];
    const statuses = ["Pending", "Confirmed", "Cancelled"];

    for (let i = 0; i < 10; i++) {
      appointments.push(
        new Appointment({
          userId: savedUsers[i + 5]._id,
          doctorId: savedUsers[i % 5]._id,
          date: randomDate(new Date(2025, 6, 1), new Date(2025, 6, 30)),
          time: randomTime(),
          status: statuses[i % 3],
        })
      );
    }

    const savedAppointments = await Appointment.insertMany(appointments);
    console.log("✅ Inserted Appointments:");
    console.table(savedAppointments.map(a => ({
      userId: a.userId.toString(),
      doctorId: a.doctorId.toString(),
      date: a.date,
      time: a.time,
      status: a.status,
    })));

    console.log("\n🌱 Database seeding complete.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seed();

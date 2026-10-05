
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Organizer@123", 12);

    const result = await mongoose.connection
      .collection("users")
      .updateOne(
        { email: "aryan@example.com" },
        { $set: { password: hashedPassword, role: "organizer" } }
      );

    console.log("Updated accounts:", result.modifiedCount);
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

resetPassword();
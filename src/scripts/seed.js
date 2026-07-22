import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import { auth } from "../auth/auth.js";
import Booking from "../models/Booking.js";
import env from "../config/env.js";

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Seed: MongoDB Connected...");

    // Delete previous test data (Optional)
    // await Tenant.deleteMany({});
    // await User.deleteMany({});
    // await Booking.deleteMany({});

    // Test tenant creation
    const testTenant = await Tenant.create({
      name: "Apex Fitness Center",
      subdomain: "apex",
    });
    
    //admin and customer user creation
    const adminUser = await auth.api.signUpEmail({
      body: {
        tenantId: testTenant._id.toString(),
        name: "John Gym Owner",
        email: "admin@apex.com",
        role: "admin",
        password: "admin.1234",
      },
    });
    const customerUser = await auth.api.signUpEmail({
      body: {
        tenantId: testTenant._id.toString(),
        name: "Mr.Rahim",
        email: "customer@apex.com",
        role: "customer",
        password: "customer.1234",
      },
    });
    

    // Test booking creation
    await Booking.create({
      tenantId: testTenant._id,
      userId: customerUser.user.id,
      bookingDate: new Date(),
      status: "confirmed",
    });

    console.log(
      "Seed Successful! Dummy tenant created: http://apex.localhost:3000",
    );
    await mongoose.connection.close()
    process.exit(0);
  } catch (error) {
    console.error("Seed Failed:", error);
    await mongoose.connection.close()
    process.exit(1);
  }
};

seedDatabase();

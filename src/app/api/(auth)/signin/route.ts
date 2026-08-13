import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  connectDB();

  try {
    const { workEmail, password } = await request.json();
    const business = await Business.findOne({ workEmail });

    if (!business) {
      return Response.json({ error: "User does not exist." }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      return Response.json({ error: "Invalid password." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return Response.json({ error: "Server configuration error." }, { status: 500 });
    }
    const payload = {
        businessId: business._id,
        businessName: business.businessName,
        workEmail: business.workEmail,
        phoneNumber: business.phoneNumber,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    return Response.json({ success: true, token , business: payload}, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
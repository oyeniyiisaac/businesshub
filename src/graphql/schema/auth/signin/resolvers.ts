import Business from "@/src/app/model/signup.model";
import bcrypt from "bcryptjs";
import { connectDB } from "@/src/lib/connect";
import jwt from "jsonwebtoken";
import { Staff } from "@/src/app/model/staffRole.model";

interface SignInArgs {
  workEmail?: string;
  email?: string;
  password?: string;
}

const handleSignIn = async (
  _: unknown,
  args: SignInArgs
) => {
  const inputEmail = (args.workEmail || args.email || "").trim().toLowerCase();
  const password = args.password || "";

  if (!inputEmail || !password) {
    throw new Error("Email and password are required.");
  }

  await connectDB();

  // 1. Search for a Business Owner / Admin account (case-insensitive)
  let account: any = await Business.findOne({
    workEmail: { $regex: new RegExp(`^${inputEmail}$`, "i") },
  });
  let isStaff = false;

  // 2. If no Business record is found, search in the Staff collection by email (case-insensitive)
  if (!account) {
    account = await Staff.findOne({
      email: { $regex: new RegExp(`^${inputEmail}$`, "i") },
    });
    if (account) {
      isStaff = true;
    }
  }

  // 3. If neither account type exists, throw an error
  if (!account) {
    throw new Error("No account found with this email address.");
  }

  // 4. Check if staff account is active
  if (isStaff && account.isActive === false) {
    throw new Error(
      "This staff account has been deactivated. Please contact your administrator."
    );
  }

  // 5. Validate password with bcrypt and fallback for legacy unhashed passwords
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, account.password);
  } catch {
    isPasswordValid = false;
  }

  // If password was stored as plain text, verify and automatically upgrade to bcrypt hash
  if (!isPasswordValid && account.password === password) {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    account.password = await bcrypt.hash(password, saltRounds);
    await account.save();
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  // 6. Determine role, email, and display name
  const role = account.role || (isStaff ? "STAFF" : "SUPER_ADMIN");
  const userEmail = isStaff
    ? account.email || inputEmail
    : account.workEmail || inputEmail;
  const fullName = isStaff
    ? account.fullName
    : account.ownerName || account.businessName || "Business Owner";

  // Resolve business ID accurately
  let businessId = account._id.toString();
  if (isStaff) {
    if (account.businessId) {
      businessId = account.businessId.toString();
    } else {
      const primaryBusiness = await Business.findOne().sort({ createdAt: -1 });
      if (primaryBusiness) {
        businessId = primaryBusiness._id.toString();
        account.businessId = primaryBusiness._id;
        await account.save();
      }
    }
  }

  // 7. Sign JWT token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }
  const token = jwt.sign(
    {
      userId: account._id.toString(),
      email: userEmail,
      role: role,
      businessId: businessId,
      isStaff: isStaff,
    },
    secret,
    { expiresIn: "1hr" }
  );

  console.log(`Sign-in successful for ${isStaff ? "Staff" : "Business"}:`, userEmail, "businessId:", businessId);

  // 8. Return AuthPayload
  return {
    token,
    user: {
      id: account._id.toString(),
      fullName: fullName,
      email: userEmail,
      workEmail: userEmail,
      phoneNumber: account.phoneNumber || "",
      role: role,
      mustChangePassword: Boolean(account.mustChangePassword),
    },
  };
};

export const resolvers = {
  Query: {
    businesses: async () => {
      await connectDB();
      return Business.find();
    },
    business: async (_: unknown, { id }: { id: string }) => {
      await connectDB();
      return Business.findById(id);
    },
  },
  Mutation: {
    signInUser: handleSignIn,
    login: handleSignIn,
  },
};
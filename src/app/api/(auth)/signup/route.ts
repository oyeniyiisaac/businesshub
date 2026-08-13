import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Request body:", body);

    try {
        await connectDB();
        const existUser = await Business.findOne({ workEmail: body.workEmail });
        if(existUser){
            console.log("User already exists");
            return new Response(
                JSON.stringify({ message: "User already exists" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }
        const saltRounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(body.password, (saltRounds));
        const user =  await Business.create({ ...body, password: hashedPassword });
        return new Response(
            JSON.stringify({ message: "User created successfully", user }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error creating user:", error);
        return new Response(
            JSON.stringify({ message: "Error creating user" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    
}

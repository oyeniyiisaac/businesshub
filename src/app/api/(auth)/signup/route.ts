import Business from "@/src/app/model/business.model";
import { connectDB } from "@/src/lib/connect";

export async function POST(request: Request) {
    const body = await request.json();
    console.log("Request body:", body);

    try {
        await connectDB();
        const user =  await Business.create(body);
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

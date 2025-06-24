import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDB } from "@/lib/db";

export async function POST(request: Request) {
  await connectToDB();

  try {
    const { email, name, supabaseUserId } = await request.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = new User({
      email,
      name,
      supabaseUserId,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

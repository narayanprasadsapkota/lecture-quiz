// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { users } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";

// // Endpoint to update user password
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { email, password } = body;

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     // Update user password
//     const [updatedUser] = await db
//       .update(users)
//       .set({ password })
//       .where(eq(users.email, email))
//       .returning();

//     if (!updatedUser) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       message: "Password updated successfully",
//       user: {
//         id: updatedUser.id,
//         email: updatedUser.email,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating password:", error);
//     return NextResponse.json(
//       { error: "Failed to update password" },
//       { status: 500 }
//     );
//   }
// }

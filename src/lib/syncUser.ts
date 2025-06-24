import { connectToDB } from "@/lib/db";
import User from "@/models/User";

// Interface for Supabase user
interface SupabaseUser {
  id: string;
  email: string | null;
}

export async function ensureMongoUser(supabaseUser: {
  id: string;
  email: string | null | undefined; // allow undefined
}) {
  if (!supabaseUser?.id || !supabaseUser.email) return null;

  await connectToDB();

  let user = await User.findOne({ supabaseUserId: supabaseUser.id });

  if (!user) {
    user = await User.findOne({ email: supabaseUser.email });

    if (!user) {
      user = await User.create({
        email: supabaseUser.email,
        name: supabaseUser.email,
        supabaseUserId: supabaseUser.id,
      });
    } else {
      user.supabaseUserId = supabaseUser.id;
      await user.save();
    }
  }

  return user;
}

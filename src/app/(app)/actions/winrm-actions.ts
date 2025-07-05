"use server";

import { z } from "zod";

const cleanupActionSchema = z.object({
  serverIp: z.string(),
  username: z.string(),
  password: z.string(),
});

type CleanupActionInput = z.infer<typeof cleanupActionSchema>;

// Define the structure of the JSON output
export const cleanupResultSchema = z.object({
    success: z.boolean(),
    freedSpaceBytes: z.number(),
    deletedFiles: z.array(z.string()),
    errors: z.array(z.string()),
});

export type CleanupResult = z.infer<typeof cleanupResultSchema>;

// This is a simulated version because of persistent npm installation issues.
// It mimics the output of the real PowerShell script.
export async function runCleanupAction(
  input: CleanupActionInput
): Promise<{ result?: CleanupResult; error?: string }> {
    const validation = cleanupActionSchema.safeParse(input);
    if (!validation.success) {
        return {
            error: "Invalid input provided: " + validation.error.errors.map((e) => e.message).join(", "),
        };
    }

    const { username } = validation.data;

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate an error for a specific username
    if (username.toLowerCase() === 'baduser') {
        return { 
            result: {
                success: false,
                freedSpaceBytes: 0,
                deletedFiles: [],
                errors: ["Authentication failed for user 'baduser'. Access denied."]
            }
        };
    }

    // Simulate a successful run with some fake data
    const simulatedResult: CleanupResult = {
        success: true,
        freedSpaceBytes: Math.floor(Math.random() * (5 * 1024 * 1024 * 1024 - 500 * 1024 * 1024 + 1)) + 500 * 1024 * 1024, // 500MB to 5GB
        deletedFiles: [
            "C:\\Windows\\Temp\\tmpA3B1.tmp",
            "C:\\Windows\\Temp\\tmpCDE2.tmp",
            "C:\\Users\\Administrator\\AppData\\Local\\Temp\\log.txt",
            "C:\\Users\\Administrator\\Downloads\\old-installer.exe",
            "C:\\Users\\Administrator\\Downloads\\archive(1).zip",
            "C:\\$Recycle.Bin\\S-1-5-21-..."
        ],
        errors: [],
    };

    // Occasionally simulate a partial failure
    if (Math.random() > 0.8) {
        simulatedResult.success = false;
        simulatedResult.errors.push("Failed to delete 'C:\\Windows\\System32\\config\\SYSTEM.LOG1': File is in use.");
        simulatedResult.deletedFiles.pop();
    }
    
    return { result: simulatedResult };
}

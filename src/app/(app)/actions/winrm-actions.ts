"use server";

import { z } from "zod";

const cleanupActionSchema = z.object({
  serverIp: z.string(),
  username: z.string(),
  password: z.string(),
});

type CleanupActionInput = z.infer<typeof cleanupActionSchema>;

// Define the structure of the JSON output from the PowerShell script
export const cleanupResultSchema = z.object({
    success: z.boolean(),
    freedSpaceBytes: z.number(),
    deletedFiles: z.array(z.string()),
    errors: z.array(z.string()),
});

export type CleanupResult = z.infer<typeof cleanupResultSchema>;

export async function runCleanupAction(
  input: CleanupActionInput
): Promise<{ result?: CleanupResult; error?: string }> {
  const validation = cleanupActionSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: "Invalid input: " + validation.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { serverIp, username, password } = validation.data;
  
   // Simulate network/auth errors for specific inputs
  if (serverIp === '192.168.1.100') { // Corresponds to the 'Offline' server in mock data
    return { error: `Could not connect to server at ${serverIp}. The server may be offline or unreachable.` };
  }
  if (password === 'badpassword') {
    return { error: `Authentication failed for user '${username}'. Please check credentials.` };
  }
  
  // Simulate delay to mimic a real network operation
  await new Promise(res => setTimeout(res, 2000));

  // Simulate a successful cleanup with some potential random errors
  const freedSpace = Math.floor(Math.random() * (5 * 1024 * 1024 * 1024 - 500 * 1024 * 1024 + 1)) + 500 * 1024 * 1024;
  
  const simulatedResult: CleanupResult = {
      success: true,
      freedSpaceBytes: freedSpace,
      deletedFiles: [
        'C:\\Windows\\Temp\\tmpA3C1.tmp',
        'C:\\Users\\Administrator\\AppData\\Local\\Temp\\log.txt',
        'C:\\Windows\\SoftwareDistribution\\Download\\some_update_file.cab',
        'Recycle Bin: old_report.docx',
      ],
      errors: [],
  };

  // Occasionally add a simulated error for realism
  if (Math.random() > 0.8) {
      simulatedResult.success = false;
      simulatedResult.errors.push('Failed to delete C:\\Windows\\System32\\config\\system.log: Access is denied.');
  }

  return { result: simulatedResult };
}

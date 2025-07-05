"use server";

import { z } from "zod";

const cleanupActionSchema = z.object({
  serverIp: z.string(),
  username: z.string(),
  password: z.string(),
});

type CleanupActionInput = z.infer<typeof cleanupActionSchema>;

export async function runCleanupAction(
  input: CleanupActionInput
): Promise<{ stdout?: string; stderr?: string }> {
  const validation = cleanupActionSchema.safeParse(input);
  if (!validation.success) {
    return {
      stderr: "Invalid input provided: " + validation.error.errors.map((e) => e.message).join(", "),
    };
  }
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate success or failure based on password
  if (input.password === "fail" || input.password === "error") {
    return {
      stderr: `[SIMULATION MODE]
Authentication failed for user '${input.username}'. Please check your credentials and try again.`,
    };
  }

  return {
    stdout: `[SIMULATION MODE]
Connecting to ${input.serverIp}...
Connection successful.

Starting cleanup process...
- Analyzing C:\\Windows\\Temp...
  - Found 1,284 temporary files.
  - Deleting... Done. 1.2 GB freed.
- Analyzing C:\\Users\\${input.username}\\AppData\\Local\\Temp...
  - Found 842 temporary files.
  - Deleting... Done. 850 MB freed.
- Analyzing C:\\Users\\${input.username}\\Downloads...
  - Found 3 large files older than 90 days.
  - Deleting project_archive_old.zip (1.5 GB)... Done.
  - Deleting old_driver_package.msi (750 MB)... Done.
  - Deleting temp_video_render.mov (250 MB)... Done.

Total space freed: 4.55 GB.
Cleanup completed successfully.
Disconnecting from ${input.serverIp}.
`,
  };
}

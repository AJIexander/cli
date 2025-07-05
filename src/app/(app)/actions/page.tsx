"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { runCleanupAction, type CleanupResult } from "./winrm-actions";
import { useServers } from "@/hooks/use-servers";
import { formatBytes } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, HardDrive, Loader2, Terminal, AlertTriangle, CheckCircle, PackageCheck } from "lucide-react";

const formSchema = z.object({
  serverIp: z.string().min(1, "Please select a server."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ActionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { servers } = useServers();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverIp: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    const response = await runCleanupAction(values);
    if (response.result) {
        setResult(response.result);
    } else if (response.error) {
        setError(response.error);
    }
    setIsLoading(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Run Cleanup</CardTitle>
            <CardDescription>
              Connect to a Windows server to run a cleanup script. Enter credentials to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="serverIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a server to connect to" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {servers
                            .filter(s => s.status !== 'Offline')
                            .map(server => (
                              <SelectItem key={server.id} value={server.ipAddress}>
                                {server.name} ({server.ipAddress})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="administrator" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Start Cleanup
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resize Disks</CardTitle>
            <CardDescription>
              Attempt to automatically resize partitions on servers with low disk space. This requires unallocated space to be available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-muted-foreground">
                  Note: This is a placeholder for actual disk resizing logic. In a real scenario, this would trigger a carefully planned and tested script.
                </p>
              <Button disabled>
                <HardDrive className="mr-2 h-4 w-4" />
                Run Resize (Not Implemented)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {(result || error) && (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5" />
                    <CardTitle className="text-xl leading-none">Execution Result</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{error}</pre>
                        </AlertDescription>
                    </Alert>
                ) : result && (
                  <div className="space-y-4">
                    {result.success ? (
                       <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 text-current" />
                          <AlertTitle>Cleanup Successful</AlertTitle>
                          <AlertDescription>
                            Total space freed: <span className="font-semibold">{formatBytes(result.freedSpaceBytes)}</span>
                          </AlertDescription>
                      </Alert>
                    ) : (
                       <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Cleanup Completed with Errors</AlertTitle>
                          <AlertDescription>
                            Please check the errors below. Some files may not have been deleted.
                          </AlertDescription>
                      </Alert>
                    )}

                    {result.deletedFiles.length > 0 && (
                       <div>
                          <h3 className="mb-2 font-semibold text-sm flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" />
                            Deleted Items ({result.deletedFiles.length})
                          </h3>
                          <ScrollArea className="h-48 rounded-md border p-2">
                              <div className="font-mono text-xs text-muted-foreground">
                                {result.deletedFiles.map((file, i) => <div key={i}>{file}</div>)}
                              </div>
                          </ScrollArea>
                       </div>
                    )}
                     {result.errors.length > 0 && (
                       <div>
                          <h3 className="mb-2 font-semibold text-sm text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Errors ({result.errors.length})
                          </h3>
                          <ScrollArea className="h-32 rounded-md border border-destructive/50 bg-destructive/10 p-2">
                              <div className="font-mono text-xs text-destructive">
                                {result.errors.map((err, i) => <div key={i}>{err}</div>)}
                              </div>
                          </ScrollArea>
                       </div>
                    )}

                  </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}

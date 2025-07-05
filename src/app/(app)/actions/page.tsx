"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { runCleanupAction } from "./winrm-actions";
import { useServers } from "@/hooks/use-servers";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, HardDrive, Loader2, Terminal, FlaskConical, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  serverIp: z.string().min(1, "Please select a server."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ActionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ stdout?: string; stderr?: string } | null>(null);
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
    const response = await runCleanupAction(values);
    setResult(response);
    setIsLoading(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Run Cleanup</CardTitle>
            <CardDescription>
              Connect to a Windows server via WinRM to run a cleanup script. Enter credentials to proceed.
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
      
      {result && (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5" />
                    <CardTitle className="text-xl leading-none">Execution Result</CardTitle>
                </div>
                {result.stdout?.includes("[SIMULATION MODE]") && (
                     <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
                        <FlaskConical className="mr-2 h-4 w-4" />
                        Simulation Mode
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                {result.stderr ? (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{result.stderr}</pre>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <ScrollArea className="h-96">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                            {result.stdout || "No output received."}
                        </pre>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}

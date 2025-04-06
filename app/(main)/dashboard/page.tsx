"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Client-side authentication verification
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleAccess = () => {
    router.push("/");
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Tools</CardTitle>
            <CardDescription>Access AI-powered development tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use our tools to refactor, test, and analyze your code with the help of artificial intelligence.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAccess}>Access</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recent projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You do not have any recent projects. Start by creating a new one.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">New Project</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No activity data available yet. Start using the tools to generate statistics.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">View More</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
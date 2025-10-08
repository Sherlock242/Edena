'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <header className="flex items-center justify-between w-full mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-jarvis text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
          Admin Panel
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Admin functionality will be implemented here.</p>
      </main>
    </div>
  );
}

    
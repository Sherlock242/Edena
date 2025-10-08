'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MobiusStrip } from '@/components/ui/mobius-strip';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <header className="flex items-center justify-between w-full mb-4 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-jarvis text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-orange-500 to-purple-500">
          Admin Panel
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <MobiusStrip />
        </div>
        <p className="text-muted-foreground mt-8 text-center">
          Continuous operation analysis. System integrity and performance metrics.
        </p>
      </main>
    </div>
  );
}

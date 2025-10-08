'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { HologramEffect } from '@/components/ui/hologram-effect';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="relative flex items-center justify-center w-full p-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl md:text-2xl font-jarvis text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 whitespace-nowrap">
          Admin Panel
        </h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="relative -translate-x-8">
          <div className="w-[400px]">
            <HologramEffect />
          </div>
          <p className="text-muted-foreground mt-8 text-center max-w-sm">
            Continuous operation analysis. System integrity and performance metrics.
          </p>
        </div>
      </main>
    </div>
  );
}

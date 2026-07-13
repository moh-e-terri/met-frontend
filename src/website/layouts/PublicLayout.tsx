import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Public Website</h1>
        <nav>
           <ul className="flex gap-4 text-sm font-medium">
             <li><a href="/">Home</a></li>
             <li><a href="/admin">Go to Admin</a></li>
           </ul>
        </nav>
      </header>
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
      <footer className="border-t p-6 text-center text-sm text-muted-foreground">
        © 2026 Enterprise App
      </footer>
    </div>
  );
};

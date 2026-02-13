import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface AppLayoutProps {
    children: React.ReactNode;
    showProfile?: boolean;
}

export const AppLayout = ({ children, showProfile = true }: AppLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                showProfile={showProfile}
                onMenuClick={() => setIsSidebarOpen(true)}
            />

            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden md:block h-[calc(100vh-4rem)] sticky top-16">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar (Sheet) */}
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-64 border-r-0">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <SheetDescription>
                                Main navigation menu for accessing dashboard, transactions, and other features.
                            </SheetDescription>
                        </SheetHeader>
                        <Sidebar
                            className="h-full border-r-0 shadow-none w-full"
                            onNavigate={() => setIsSidebarOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

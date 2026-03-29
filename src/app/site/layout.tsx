import Navigation from "@/components/site/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { ui as clerkUi } from '@clerk/ui';
import { dark } from "@clerk/ui/themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      theme: dark,
    }} ui={clerkUi}>
      <main className="h-full w-full">

        <Navigation />
        {children}

      </main>
    </ClerkProvider>
  )
}
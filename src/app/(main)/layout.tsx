import { ClerkProvider } from "@clerk/nextjs";
import { ui as clerkUi } from '@clerk/ui';
import { dark } from "@clerk/ui/themes";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      theme: dark,
    }} ui={clerkUi}>
      {children}
    </ClerkProvider>
  )
}
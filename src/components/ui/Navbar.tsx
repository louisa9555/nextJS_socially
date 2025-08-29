import React from 'react'
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SignedIn, SignedOut, SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import { currentUser } from '@clerk/nextjs/server';
import { syncUser } from '@/actions/user.action';
import Link from 'next/link';

async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser();
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider">
              Louis
            </Link>
          </div>

          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}

{/* <SignedOut>
  <SignInButton mode="modal">
  <Button>Sign in</Button>
  </SignInButton>
  <SignUpButton mode="modal">
  <Button variant={"secondary"}>
      Sign up
  </Button>
  </SignUpButton>
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
<ModeToggle /> */}
export default Navbar
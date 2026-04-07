'use client'

import { Agency, AgencySidebarOption, SubAccount, SubAccountSidebarOption, User } from "@/generated/prisma/client";
import clsx from "clsx";
import { ChevronsUpDown, Compass, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";

interface MenuOptionsProps {
  defaultOpen?: boolean,
  subAccounts: SubAccount[],
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[]
  sidebarLogo: string;
  details: any;
  user?: {
    agency: Agency | null;
  } & User;
  id: string;
}

export default function MenuOptions({
  defaultOpen,
  subAccounts,
  sidebarOpt,
  sidebarLogo,
  details,
  user,
  id,
}: MenuOptionsProps) {
  const openState = useMemo(() => defaultOpen ? { open: true } : {}, [defaultOpen]);

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showCloseButton={!defaultOpen}
        side="left"
        className={clsx(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
          {
            "hidden md:inline-block z-0 w-[300px]": defaultOpen,
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>

          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-full my-4 flex items-center justify-between py-8" variant="ghost">
                <div className="flex items-center text-left gap-2">
                  <Compass />

                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">{details.address}</span>
                  </div>
                </div>

                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-md">
                <CommandInput placeholder="Search Accounts..." />

                <CommandList className="pb-16">
                  <CommandEmpty>No results found</CommandEmpty>
                  {(user?.role === "AGENCY_OWNER" || user?.role === 'AGENCY_ADMIN') && user.agency && (
                    <CommandGroup heading="Agency">
                      <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                        {
                          defaultOpen ?
                            <Link
                              href={`/agency/${user?.agency?.id}`}
                              className="flex gap-4 w-full h-full">
                              <div className="relative w-16">
                                <Image
                                  src={user?.agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.agency?.address}
                                </span>
                              </div>
                            </Link> :
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.agency?.id}`}
                                className="flex gap-4 w-full h-full">
                                <div className="relative w-16">
                                  <Image
                                    src={user?.agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {user?.agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                        }
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

      </SheetContent>
    </Sheet>
  )
}
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Settings, User, ShoppingCart } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { Session } from 'next-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { SignOutForm } from './SignOutForm';
import { usePathname } from 'next/navigation';
import getPageTitle from '@/lib/helpers/getPageTitle';

const Header = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';

  return (
    <header className="fixed top-0 left-64 right-0 z-30 flex justify-between items-center px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100/70">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
        {pageTitle}
      </h1>

      <div className="flex items-center space-x-3">
        {/* Minimal POS Button */}
        <Link href="/sales/pos">
          <Button className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-1.5 text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200">
            <ShoppingCart className="h-4 w-4" />
            <span>POS</span>
          </Button>
        </Link>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 px-2 py-1.5 rounded-full hover:bg-gray-100/100 transition-colors cursor-pointer">
              <div className="relative">
                <Avatar className="h-8 w-8 border border-gray-200/70">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden md:block text-sm leading-tight">
                <p className="font-medium text-gray-800">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-lg shadow-sm border border-gray-200/70 bg-white/95 backdrop-blur-sm mt-1"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100/70" />
            <DropdownMenuGroup className="px-1 py-1">
              <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md hover:bg-gray-50 focus:bg-gray-50">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1.5 text-sm rounded-md hover:bg-gray-50 focus:bg-gray-50">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-100/70" />
            <SignOutForm />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

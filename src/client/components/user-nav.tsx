import { Avatar, AvatarFallback } from '@client/components/ui/avatar';
import { Button } from '@client/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@client/components/ui/dropdown-menu';
import { api } from '@client/lib/api';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import type { UserDetails } from '@shared/types/shoonya';
import * as React from 'react';
import { Link } from 'react-router-dom';

export function UserNav() {
  const [userDetails, setUserDetails] = React.useState<UserDetails | null>(null);
  React.useEffect(() => {
    api('userDetails').json<UserDetails>().then(setUserDetails).catch(console.error);
  }, []);

  return userDetails ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {userDetails.uname
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{userDetails.uname}</p>
            <p className='text-xs leading-none text-muted-foreground'>{userDetails.uid}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>Holdings</DropdownMenuItem>
          <DropdownMenuItem disabled>Positions</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/amo' target='_blank'>
              Place AMO
              <ArrowTopRightIcon className='mb-[1px] ml-2 h-4 w-4' />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
      <Avatar className='h-9 w-9'>
        <AvatarFallback></AvatarFallback>
      </Avatar>
    </Button>
  );
}

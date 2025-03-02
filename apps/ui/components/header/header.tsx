'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/hooks/store'
import { clearCookieAuth } from '@/lib/auth'
import { LogOut, Settings, UserPen } from 'lucide-react'

import { useTranslations } from 'next-intl'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Header = () => {
  const { setUser, user } = useAppStore()
  const t = useTranslations()
  const router = useRouter()

  const logOut = () => {
    setUser(null)
    clearCookieAuth()
    return router.push('/')
  }

  return (
    <div className="header mb-4">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="navbar border-b dark:bg-slate-800 py-2 my-2">
        <div className="container mx-auto">
          <div className="flex">
            <div className="flex-1 flex items-center">
              <Link href={'/'} className="btn btn-ghost text-3xl">
                Valley
              </Link>
            </div>

            {}

            <div className="flex-none">
              <DropdownMenu>
                {!user ? (
                  <div className="flex">
                    <div className="flex items-center cursor-pointer mx-2">
                      <Link href={'/auth/login'}>{t('common.logIn')}</Link>
                    </div>
                    <div className="flex items-center cursor-pointer mx-2">
                      <Link href={'/user/create'}>{t('account.create')}</Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <DropdownMenuTrigger className="cursor-pointer">
                      <Avatar>
                        <AvatarImage
                          alt="profile"
                          width={50}
                          height={50}
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link className="w-full" href={'/accounts/profile'}>
                          <div className="flex">
                            <div className="pr-2">
                              <UserPen />
                            </div>
                            <div>{`${user.firstName} ${user.lastName}`}</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem>
                        <Link className="w-full" href={'/accounts/settings'}>
                          <div className="flex">
                            <div className="pr-2">
                              <Settings />
                            </div>
                            <div>{t('common.settings')}</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem>
                        <div className="cursor-pointer w-full text-left" onClick={() => logOut()}>
                          <div className="flex">
                            <div className="pr-2">
                              <LogOut />
                            </div>
                            <div>{t('common.logOut')}</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </>
                )}
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header

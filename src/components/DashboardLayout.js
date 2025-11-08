import React, { useState, Fragment } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { BiTachometer, BiUser, BiPalette, BiLogOut, BiMenu, BiX, BiLink } from 'react-icons/bi';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext'; // Giả sử bạn có hook để logout

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: BiTachometer },
  { name: 'Hồ sơ', href: '/dashboard/profile', icon: BiUser },
  { name: 'Giao diện', href: '/dashboard/appearance', icon: BiPalette },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth(); // Lấy hàm logout từ context

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          end={item.href === '/dashboard'} // `end` prop for precise matching
          className={({ isActive }) =>
            clsx(
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white',
              isCollapsed ? 'justify-center' : ''
            )
          }
        >
          <item.icon
            className={clsx('h-6 w-6 shrink-0', isCollapsed ? '' : 'mr-3')}
            aria-hidden="true"
          />
          <span className={clsx({ 'sr-only': isCollapsed })}>{item.name}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <div>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/80" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <BiX className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center text-white text-lg font-bold">
                    <BiLink className="mr-2"/> BIOLINK
                  </div>
                  <nav className="flex flex-1 flex-col"><ul className="flex flex-1 flex-col gap-y-7"><li><ul className="-mx-2 space-y-1"><NavLinks /></ul></li></ul></nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className={clsx('hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300', isCollapsed ? 'lg:w-20' : 'lg:w-64')}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-4 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between text-white">
             <div className={clsx('flex items-center text-lg font-bold', {'sr-only': isCollapsed})}><BiLink className="mr-2"/> BIOLINK</div>
             <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-400 hover:text-white">
                <BiMenu size={24}/>
             </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li><ul className="space-y-1"><NavLinks /></ul></li>
              <li className="mt-auto">
                <button onClick={logout} className={clsx('group -mx-2 flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white', isCollapsed ? 'justify-center' : '')}>
  <BiLogOut className={clsx('h-6 w-6 shrink-0', isCollapsed ? '' : 'mr-3')} aria-hidden="true" />
  <span className={clsx({ 'sr-only': isCollapsed })}>Đăng xuất</span>
</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className={clsx('lg:pl-64 transition-all duration-300', { 'lg:pl-20': isCollapsed })}>
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <BiMenu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-lg font-bold text-slate-800 dark:text-slate-200">BIOLINK</div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Đây là nơi nội dung của các trang con sẽ được hiển thị */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
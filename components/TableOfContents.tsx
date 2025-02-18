'use client'

import { Disclosure, Transition } from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'

interface TOCProps {
  toc: { value: string; depth: number; url: string }[]
}

export default function TableOfContents({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(true)
  const headingElements = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    headingElements.current = toc.map(({ url }) => document.getElementById(url.slice(1)))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0% 0% -80% 0%' }
    )

    headingElements.current.forEach((element) => {
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [toc])

  if (!toc.length) return null

  return (
    <div className="hidden xl:block">
      <div className="fixed top-24 right-8 z-50 w-64">
        <Disclosure defaultOpen={true}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(!open)}
              >
                <span>Table of Contents</span>
                <svg
                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel static className="mt-4">
                  <nav className="max-h-[calc(100vh-9rem)] overflow-auto">
                    <ul>
                      {toc.map(({ value, depth, url }) => (
                        <li
                          key={url}
                          className={`${depth > 2 ? 'ml-4' : ''} my-1 line-clamp-1 text-sm`}
                        >
                          <a
                            href={url}
                            className={`${
                              activeId === url.slice(1)
                                ? 'text-primary-500 dark:text-primary-400'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                            } transition-colors duration-200`}
                            onClick={(e) => {
                              e.preventDefault()
                              document.querySelector(url)?.scrollIntoView({
                                behavior: 'smooth',
                              })
                            }}
                          >
                            {value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
} 
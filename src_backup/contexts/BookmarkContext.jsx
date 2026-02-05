import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'symbolmock-bookmarks'

const BookmarkContext = createContext(null)

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
    } catch (_) {}
  }, [bookmarks])

  const toggleBookmark = useCallback((message) => {
    if (!message || !message.id) return
    setBookmarks((prev) => {
      const exists = prev.some((m) => m.id === message.id)
      if (exists) return prev.filter((m) => m.id !== message.id)
      return [...prev, message]
    })
  }, [])

  const isBookmarked = useCallback((id) => {
    return bookmarks.some((m) => m.id === id)
  }, [bookmarks])

  const value = { bookmarks, toggleBookmark, isBookmarked }
  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider')
  return ctx
}

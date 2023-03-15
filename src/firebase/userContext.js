import React, { useContext, useState, createContext } from 'react'

export const UserContext = createContext({
  currentUser: undefined,
  setCurrentUser: async (currentUser) => null,
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState()

  return <UserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserContext.Provider>
}
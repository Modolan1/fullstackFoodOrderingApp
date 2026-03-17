import { createContext, useEffect, useState } from "react";
import { Food_List } from "../assets/assets";
import { apiFetch } from "../utils/api";

export const StoreContext = createContext(null)
const authStorageKey = "foodDeliveryToken"

const StoreContextProvider = (props) =>{

    const [cartItems, setCartItems] = useState({})
    const [token, setToken] = useState(() => localStorage.getItem(authStorageKey) || "")
    const [currentUser, setCurrentUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(authStorageKey)))

    const addtoCart =(itemId) =>{
        if (!cartItems[itemId]) {
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }
        else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
    }

    const removeFromCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
    }

    const clearCart = () => {
        setCartItems({})
    }

    const persistToken = (nextToken) => {
        if (nextToken) {
            localStorage.setItem(authStorageKey, nextToken)
        } else {
            localStorage.removeItem(authStorageKey)
        }

        setToken(nextToken)
    }

    const logout = () => {
        persistToken("")
        setCurrentUser(null)
    }

    const fetchCurrentUser = async (sessionToken = token) => {
        if (!sessionToken) {
            setCurrentUser(null)
            setAuthLoading(false)
            return null
        }

        setAuthLoading(true)

        try {
            const { response, result } = await apiFetch('/api/user/me', {
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                },
            })

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to load your account.')
            }

            setCurrentUser(result.user)
            return result.user
        } catch {
            logout()
            return null
        } finally {
            setAuthLoading(false)
        }
    }

    const authenticate = async (mode, payload) => {
        const endpoint = mode === 'Sign Up' ? '/api/user/register' : '/api/user/login'
        const { response, result } = await apiFetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Authentication failed.')
        }

        persistToken(result.token)
        setCurrentUser(result.user)
        setAuthLoading(false)
        return result.user
    }

    useEffect(() => {
        fetchCurrentUser(token)
    }, [])

    const contextValue = {
        Food_List,
        cartItems,
        setCartItems,
        addtoCart,
        removeFromCart,
        clearCart,
        token,
        currentUser,
        authLoading,
        authenticate,
        fetchCurrentUser,
        logout

   
    }
    return(
        <StoreContext.Provider value ={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider
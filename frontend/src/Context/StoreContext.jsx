import { createContext, useEffect, useState } from "react";
import { Food_List } from "../assets/assets";
import { API_URL, apiFetch } from "../utils/api";

export const StoreContext = createContext(null)
const authStorageKey = "foodDeliveryToken"

const StoreContextProvider = (props) =>{

    const [foodList, setFoodList] = useState(Food_List)
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

    const fetchFoodList = async () => {
        try {
            const { response, result } = await apiFetch('/api/food/list')

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to load menu items.')
            }

            const normalizedFoods = (result.data || []).map((item) => {
                const imagePath = String(item.image || '')
                const isAbsoluteUrl = /^https?:\/\//i.test(imagePath)
                const normalizedImage = isAbsoluteUrl
                    ? imagePath
                    : imagePath
                        ? `${API_URL}/images/${imagePath}`
                        : ''

                return {
                    ...item,
                    image: normalizedImage,
                }
            })

            setFoodList(normalizedFoods)
        } catch {
            // Keep local fallback list if API fetch fails.
            setFoodList(Food_List)
        }
    }

    useEffect(() => {
        fetchCurrentUser(token)
        fetchFoodList()
    }, [])

    const contextValue = {
        Food_List: foodList,
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

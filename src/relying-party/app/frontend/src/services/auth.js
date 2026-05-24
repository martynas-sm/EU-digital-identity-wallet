const KEY_USER = 'hss_user'
const KEY_TOKEN = 'hss_token'
const CHANGE_EVENT = 'auth-change'

export function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY_USER)) }
    catch { return null }
}

export function getToken() {
    return localStorage.getItem(KEY_TOKEN)
}

export function login(user, token) {
    localStorage.setItem(KEY_USER, JSON.stringify(user))
    localStorage.setItem(KEY_TOKEN, token)
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function logout() {
    localStorage.removeItem(KEY_USER)
    localStorage.removeItem(KEY_TOKEN)
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useAuthListener(callback) {
    window.addEventListener(CHANGE_EVENT, callback)
    return () => window.removeEventListener(CHANGE_EVENT, callback)
}

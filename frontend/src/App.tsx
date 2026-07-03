import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { AuthProvider } from './shared/context/AuthContext'
import { ChatUnreadCountProvider } from './shared/context/ChatUnreadCountContext'
import { PlatformProvider } from './shared/context/PlatformContext'
import { SocketProvider } from './shared/context/SocketContext'

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <PlatformProvider>
                    <ChatUnreadCountProvider>
                        <Toaster position="top-center" />
                        <RouterProvider router={router} />
                    </ChatUnreadCountProvider>
                </PlatformProvider>
            </SocketProvider>
        </AuthProvider>
    )
}

export default App

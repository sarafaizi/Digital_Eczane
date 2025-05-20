import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
    enabled: boolean;
    toggleEnabled: (on: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    enabled: true,
    toggleEnabled: async () => { },
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [enabled, setEnabled] = useState(true);

    const toggleEnabled = async (on: boolean) => {
        setEnabled(on);
        if (!on) {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    return (
        <NotificationContext.Provider value={{ enabled, toggleEnabled }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

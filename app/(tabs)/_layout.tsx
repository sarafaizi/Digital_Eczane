import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const _layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarStyle: {
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    elevation: 0,
                    borderTopWidth: 0,

                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="registered" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="user" size={size} color={color} />
                    ),
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: 'add',
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="exchange" size={size} color={color} />
                    ),
                    headerShown: false
                }}
            />

            <Tabs.Screen
                name="time"

                options={{
                    headerShown: false,
                    title: 'time',
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="medkit" size={size} color={color} />
                    ),


                }}
            />
            <Tabs.Screen
                name="mainprofile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="user" size={size} color={color} />
                    ),
                    headerShown: false
                }}
            />

        </Tabs>
    );
};

export default _layout;

const styles = StyleSheet.create({});

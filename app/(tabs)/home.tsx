/*import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const Home: React.FC = () => {
    useEffect(() => {
        (async () => {
            
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                // Eğer verilmemişse iste
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== 'granted') {
                    Alert.alert(
                        'Bildirim İzni',
                        'Bildirim izni verilmedi. Uyarıları almak için izin vermelisiniz.'
                    );
                }
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.subtitle}>Bildirim izinleri kontrol edildi.</Text>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2B97C2',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
    },
});
*/
// HomeScreen.tsx
// HomeScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

interface Med {
    id: string;
    medicationName: string;
    usageTimes: { time: string; hour: string }[];
}

export default function HomeScreen({ navigation }) {
    const { isDark } = useContext(ThemeContext);
    const { user } = useAuth();
    const [medications, setMedications] = useState<Med[]>([]);
    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'users', user.uid, 'medications'),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Med)));
        });
        return unsub;
    }, [user]);


    const todays = medications.filter(m =>
        m.usageTimes.some(u => u.hour === new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        }))
    );

    return (
        <SafeAreaView style={[styles.root, isDark && styles.rootDark]}>

            <View style={[styles.header, isDark && styles.headerDark]}>
                <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                    İlaç Hatırlatıcı
                </Text>
                <MaterialCommunityIcons
                    name="pill"
                    size={28}
                    color={isDark ? '#fff' : '#fff'}
                />
            </View>


            <Calendar
                current={today}
                markingType="custom"
                markedDates={{
                    [today]: {
                        customStyles: {
                            container: { backgroundColor: '#C0392B' },
                            text: { color: '#fff', fontWeight: '700' },
                        },
                    },
                }}
                theme={{
                    arrowColor: '#C0392B',
                    todayTextColor: '#C0392B',
                    monthTextColor: '#C0392B',
                }}
                style={styles.calendar}
            />


            <View style={[styles.card, isDark && styles.cardDark]}>

                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                    Bugünün İlaçları
                </Text>
                {medications.length === 0 ? (
                    <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                        Henüz eklenmiş ilaç yok.
                    </Text>
                ) : (
                    <FlatList
                        data={medications}
                        keyExtractor={i => i.id}
                        renderItem={({ item }) => (
                            <View style={styles.reminderRow}>
                                <MaterialCommunityIcons
                                    name="pill"
                                    size={20}
                                    color="#C0392B"
                                />
                                <View style={{ marginLeft: 12 }}>
                                    <Text
                                        style={[styles.medName, isDark && styles.medNameDark]}
                                    >
                                        {item.medicationName}
                                    </Text>
                                    <Text
                                        style={[styles.medTime, isDark && styles.medTimeDark]}
                                    >
                                        {item.usageTimes.map(u => u.hour).join('  •  ')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>


            <TouchableOpacity
                style={[styles.fab, isDark && styles.fabDark]}
                onPress={() => navigation.push('AddMedicine')}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                <Text style={styles.fabText}>İlaç Ekle</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FDFDFD',
    },
    rootDark: {
        backgroundColor: '#121212',
    },
    header: {
        height: 60,
        backgroundColor: '#C0392B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerDark: {
        backgroundColor: '#8E2430',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerTitleDark: { color: '#fff' },

    calendar: {
        margin: 16,
        borderRadius: 8,
        elevation: 3,
    },

    card: {
        flex: 1,
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: '#1E1E1E',
    },
    illustration: {
        width: '100%',
        height: 120,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    cardTitleDark: {
        color: '#fff',
    },
    emptyText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 12,
    },
    emptyTextDark: {
        color: '#bbb',
    },

    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee',
    },
    medName: { fontSize: 16, fontWeight: '500', color: '#222' },
    medNameDark: { color: '#fff' },
    medTime: { fontSize: 14, color: '#555', marginTop: 2 },
    medTimeDark: { color: '#ccc' },

    fab: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#C0392B',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 30,
        elevation: 5,
        alignItems: 'center',
    },
    fabDark: {
        backgroundColor: '#8E2430',
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

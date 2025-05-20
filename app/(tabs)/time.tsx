/*import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';

const TIME_OPTIONS = ['Sabah', 'Öğle', 'İkindi', 'Akşam'];

interface TimeSelectionInlineProps {
    onChange?: (timesWithHours: { time: string; hour: string }) => void;
}

const TimeSelectionInline: React.FC<TimeSelectionInlineProps> = ({ onChange = () => { } }) => {
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [hours, setHours] = useState<{ [key: string]: string }>({});
    const [showPickerFor, setShowPickerFor] = useState<string | null>(null);
    const [opacity] = useState(new Animated.Value(1));

    const handleTimeSelection = (time: string) => {
        Animated.timing(opacity, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
        }).start();

        if (selectedTimes.includes(time)) {
            setSelectedTimes((prev) => prev.filter((t) => t !== time));
            const newHours = { ...hours };
            delete newHours[time];
            setHours(newHours);
        } else {
            setSelectedTimes((prev) => [...prev, time]);
        }

        Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleTimeChange = (event: any, selectedDate: Date | undefined, time: string) => {
        setShowPickerFor(null);
        if (selectedDate) {
            const formatted = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const updated = { ...hours, [time]: formatted };
            setHours(updated);
            onChange({ time, hour: formatted });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>İlaç Kullanım Zamanı</Text>
            <View style={styles.buttonContainer}>
                {TIME_OPTIONS.map((time) => (
                    <TouchableOpacity
                        key={time}
                        style={[
                            styles.button,
                            selectedTimes.includes(time) && styles.selectedButton,
                        ]}
                        onPress={() => handleTimeSelection(time)}
                        onLongPress={() => setShowPickerFor(time)}
                    >
                        <Text style={[
                            styles.buttonText,
                            selectedTimes.includes(time) && styles.selectedButtonText,
                        ]}>
                            {time} {hours[time] ? ` - ${hours[time]}` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {showPickerFor && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleTimeChange(event, date, showPickerFor)}
                />
            )}
        </View>
    );
};

const AddMedicationScreen = () => {
    const { user } = useAuth();
    const [medicationName, setMedicationName] = useState('');
    const [usageTimes, setUsageTimes] = useState<{ time: string; hour: string }[]>([]);
    const [medications, setMedications] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'users', user.uid, 'medications'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const meds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMedications(meds);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddMedication = async () => {
        if (!user) {
            Alert.alert('Hata', 'Lütfen giriş yapınız.');
            return;
        }

        if (!medicationName || usageTimes.length === 0) {
            Alert.alert('Eksik bilgi', 'İlaç adı ve kullanım saatlerini girin.');
            return;
        }

        try {
            await addDoc(collection(db, 'users', user.uid, 'medications'), {
                medicationName,
                usageTimes,
                createdAt: new Date(),
            });

            Alert.alert('Başarılı', 'İlaç başarıyla eklendi');
            setMedicationName('');
            setUsageTimes([]);
        } catch (error) {
            console.error('İlaç eklenirken hata:', error);
            Alert.alert('Hata', 'İlaç eklenemedi');
        }
    };

    const handleTimeChange = (timesWithHours: { time: string; hour: string }) => {
        setUsageTimes((prev) => {
            const index = prev.findIndex((item) => item.time === timesWithHours.time);
            if (index === -1) {
                return [...prev, timesWithHours];
            } else {
                const updatedTimes = [...prev];
                updatedTimes[index] = timesWithHours;
                return updatedTimes;
            }
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.screen}>
                <Text style={styles.header}>İlaç Ekleme ve Listeleme</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>İlaç Adı</Text>
                    <TextInput
                        style={styles.input}
                        value={medicationName}
                        onChangeText={setMedicationName}
                        placeholder="İlacınızın adını girin"
                        placeholderTextColor="#A9A9A9"
                    />

                    <Text style={styles.label}>Kullanım Saatleri</Text>
                    <TimeSelectionInline onChange={handleTimeChange} />

                    <TouchableOpacity
                        onPress={handleAddMedication}
                        style={styles.saveButton}
                    >
                        <Text style={styles.buttonText}>İlacı Kaydet</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 20 }]}>Kayıtlı İlaçlar</Text>
                <FlatList
                    data={medications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.medItem}>
                            <Text style={styles.medTitle}>{item.medicationName}</Text>
                            {item.usageTimes?.map((t: any, idx: number) => (
                                <Text key={idx} style={styles.medTime}>
                                    - {t.time}: {t.hour}
                                </Text>
                            ))}
                        </View>
                    )}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginTop: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#2685aa', // light_blue
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    selectedButton: {
        backgroundColor: '#2B97C2', // blue
    },
    selectedButtonText: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#2B97C2', // blue
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    medItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    medTime: {
        color: '#555',
        fontSize: 14,
    },
});

export default AddMedicationScreen;
*/




//yeni
/*
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Modal,
    Platform as RNPlatform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';


// Eski bildirimleri iptal eder
async function cancelMedicationNotifications(ids: string[]) {
    for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}

// Yeni bildirimler planlar
async function scheduleMedicationNotifications(
    medId: string,
    name: string,
    usageTimes: { time: string; hour: string }[],
): Promise<string[]> {
    const notifIds: string[] = [];
    for (const { time, hour } of usageTimes) {
        const [hourNum, minuteNum] = hour.split(':').map(Number);
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${name} İlacı Saati`,
                body: `${time} zamanında ilacını almayı unutma!`,
                data: { medId },
            },
            trigger: { type: 'calendar', hour: hourNum, minute: minuteNum, repeats: true },
        });
        notifIds.push(id);
    }
    return notifIds;
}

const TIME_OPTIONS = ['Sabah', 'Öğle', 'İkindi', 'Akşam'];
const TIME_ICONS: Record<string, string> = {
    Sabah: 'weather-sunset-up',
    Öğle: 'weather-sunny',
    İkindi: 'weather-sunset-down',
    Akşam: 'weather-night',
};

interface TimeSelectionInlineProps {
    onChange?: (timesWithHours: { time: string; hour: string }) => void;
    initialSelectedTimes?: string[];
    initialHours?: { [key: string]: string };
}
const TimeSelectionInline: React.FC<TimeSelectionInlineProps> = ({
    onChange = () => { },
    initialSelectedTimes = [],
    initialHours = {},
}) => {
    const [selectedTimes, setSelectedTimes] = useState<string[]>(initialSelectedTimes);
    const [hours, setHours] = useState<{ [key: string]: string }>(initialHours);
    const [showPickerFor, setShowPickerFor] = useState<string | null>(null);
    const [opacity] = useState(new Animated.Value(1));

    const handleTimeSelection = (time: string) => {
        Animated.sequence([
            Animated.timing(opacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        if (selectedTimes.includes(time)) {
            setSelectedTimes(prev => prev.filter(t => t !== time));
            const newHours = { ...hours };
            delete newHours[time];
            setHours(newHours);
        } else {
            setSelectedTimes(prev => [...prev, time]);
        }
    };

    const handleTimeChange = (_event: any, selectedDate?: Date) => {
        if (!showPickerFor) return;
        setShowPickerFor(null);
        if (selectedDate) {
            const formatted = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const updatedHours = { ...hours, [showPickerFor]: formatted };
            setHours(updatedHours);
            if (!selectedTimes.includes(showPickerFor)) {
                setSelectedTimes(prev => [...prev, showPickerFor]);
            }
            onChange({ time: showPickerFor, hour: formatted });
        }
    };

    return (
        <View style={styles.timeContainer}>
            <Text style={styles.timeTitle}>Kullanım Saatleri</Text>
            <View style={styles.buttonContainer}>
                {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                        key={time}
                        style={[styles.timeButton, selectedTimes.includes(time) && styles.timeButtonSelected]}
                        onPress={() => handleTimeSelection(time)}
                        onLongPress={() => setShowPickerFor(time)}
                    >
                        <MaterialCommunityIcons
                            name={TIME_ICONS[time]}
                            size={20}
                            color={selectedTimes.includes(time) ? '#fff' : '#0288D1'}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.timeButtonText, selectedTimes.includes(time) && styles.timeButtonTextSelected]}>
                            {time}{hours[time] ? ` - ${hours[time]}` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {showPickerFor && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

const AddMedicationScreen: React.FC = () => {
    const { user } = useAuth();
    const [medicationName, setMedicationName] = useState('');
    const [usageTimes, setUsageTimes] = useState<{ time: string; hour: string }[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'medications'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setMedications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsubscribe;
    }, [user]);

    const resetForm = () => {
        setEditingId(null);
        setMedicationName('');
        setUsageTimes([]);
    };

    const handleAddOrUpdate = async () => {
        if (!user || !medicationName || usageTimes.length === 0) {
            Alert.alert('Eksik bilgi', 'İlaç adı ve kullanım saatlerini girin.');
            return;
        }
        try {
            if (editingId) {
                const docRef = doc(db, 'users', user.uid, 'medications', editingId);
                const snap = await getDoc(docRef);
                const oldIds = snap.data()?.notificationIds || [];
                await cancelMedicationNotifications(oldIds);
                await updateDoc(docRef, { medicationName, usageTimes });
                const newIds = await scheduleMedicationNotifications(editingId, medicationName, usageTimes);
                await updateDoc(docRef, { notificationIds: newIds });
            } else {
                const docRef = await addDoc(collection(db, 'users', user.uid, 'medications'), {
                    medicationName,
                    usageTimes,
                    createdAt: new Date(),
                });
                const newIds = await scheduleMedicationNotifications(docRef.id, medicationName, usageTimes);
                await updateDoc(docRef, { notificationIds: newIds });
            }
            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İşlem başarısız oldu.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'users', user!.uid, 'medications', id));
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Silme işlemi başarısız.');
        }
    };

    const handleTimeSelectionChange = (t: { time: string; hour: string }) => {
        setUsageTimes(prev => {
            const idx = prev.findIndex(p => p.time === t.time);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx] = t;
                return updated;
            }
            return [...prev, t];
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.medCard}
            onPress={() => {
                setEditingId(item.id);
                setMedicationName(item.medicationName);
                setUsageTimes(item.usageTimes || []);
                setModalVisible(true);
            }}
        >
            <View style={styles.medInfo}>
                <MaterialCommunityIcons name="pill" size={24} color="#2B97C2" style={{ marginRight: 12 }} />
                <View>
                    <Text style={styles.medTitle}>{item.medicationName}</Text>
                    <Text style={styles.medTime}>
                        {item.usageTimes?.map((t: any) => `${t.time}: ${t.hour}`).join('  •  ')}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.screenTitle}>İlaç Listesi</Text>
            <TouchableOpacity style={styles.addNewBtn} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.addNewText}>Yeni İlaç</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.screen}>
                    <FlatList
                        data={medications}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        ListHeaderComponent={ListHeader}
                        contentContainerStyle={styles.listContainer}
                        keyboardShouldPersistTaps="handled"
                    />
                    <Modal visible={modalVisible} animationType="slide" transparent>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>{editingId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={medicationName}
                                    onChangeText={setMedicationName}
                                    placeholder="İlaç adı"
                                    placeholderTextColor="#A9A9A9"
                                />
                                <TimeSelectionInline
                                    onChange={handleTimeSelectionChange}
                                    initialSelectedTimes={usageTimes.map(u => u.time)}
                                    initialHours={usageTimes.reduce((a, c) => ({ ...a, [c.time]: c.hour }), {})}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={handleAddOrUpdate} style={styles.saveBtn}>
                                        <Text style={styles.saveText}>{editingId ? 'Kaydet' : 'Ekle'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }} style={styles.cancelBtn}>
                                        <Text style={styles.cancelText}>İptal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F0F4F8' },
    listContainer: { padding: 20 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    screenTitle: { fontSize: 26, fontWeight: '700', color: '#2B97C2' },
    addNewBtn: { flexDirection: 'row', backgroundColor: '#2B97C2', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
    addNewText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    medCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginVertical: 8, borderLeftWidth: 5, borderLeftColor: '#2B97C2', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
    medInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    medTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
    medTime: { fontSize: 14, color: '#555', marginTop: 4 },
    deleteBtn: { backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    deleteText: { color: '#fff', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '90%' },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#FAFAFA', marginBottom: 16, color: '#333' },
    timeContainer: { marginBottom: 16 },
    timeTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8 },
    buttonContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    timeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, margin: 4 },
    timeButtonSelected: { backgroundColor: '#0288D1' },
    timeButtonText: { color: '#0288D1', fontWeight: '600', fontSize: 14 },
    timeButtonTextSelected: { color: '#fff' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    saveBtn: { flex: 1, backgroundColor: '#2B97C2', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: { flex: 1, backgroundColor: '#ccc', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    cancelText: { color: '#333', fontWeight: '600', fontSize: 16 },
});

export default AddMedicationScreen;
*/

// screens/AddMedicationScreen.tsx


//çalışan 
/*
import React, { useEffect, useState, useContext } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Modal,
    Platform as RNPlatform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { ThemeContext } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';

// cancel old notifications
async function cancelMedicationNotifications(ids: string[]) {
    for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}

// schedule new ones
async function scheduleMedicationNotifications(
    medId: string,
    name: string,
    usageTimes: { time: string; hour: string }[]
): Promise<string[]> {
    const notifIds: string[] = [];
    for (const { time, hour } of usageTimes) {
        const [hourNum, minuteNum] = hour.split(':').map(Number);
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${name} İlacı Saati`,
                body: `${time} zamanında ilacını almayı unutma!`,
                data: { medId },
            },
            trigger: { type: 'calendar', hour: hourNum, minute: minuteNum, repeats: true },
        });
        notifIds.push(id);
    }
    return notifIds;
}

const TIME_OPTIONS = ['Sabah', 'Öğle', 'İkindi', 'Akşam'];
const TIME_ICONS: Record<string, string> = {
    Sabah: 'weather-sunset-up',
    Öğle: 'weather-sunny',
    İkindi: 'weather-sunset-down',
    Akşam: 'weather-night',
};

interface TimeSelectionInlineProps {
    onChange?: (t: { time: string; hour: string }) => void;
    initialSelectedTimes?: string[];
    initialHours?: Record<string, string>;
}
const TimeSelectionInline: React.FC<TimeSelectionInlineProps> = ({
    onChange = () => { },
    initialSelectedTimes = [],
    initialHours = {},
}) => {
    const { isDark } = useContext(ThemeContext);
    const [selectedTimes, setSelectedTimes] = useState<string[]>(initialSelectedTimes);
    const [hours, setHours] = useState(initialHours);
    const [showPickerFor, setShowPickerFor] = useState<string | null>(null);
    const [opacity] = useState(new Animated.Value(1));

    function handleTimeSelection(time: string) {
        Animated.sequence([
            Animated.timing(opacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        if (selectedTimes.includes(time)) {
            setSelectedTimes(s => s.filter(t => t !== time));
            const h = { ...hours };
            delete h[time];
            setHours(h);
        } else {
            setSelectedTimes(s => [...s, time]);
        }
    }

    function handleTimeChange(_: any, date?: Date) {
        if (!showPickerFor || !date) return setShowPickerFor(null);
        const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const h = { ...hours, [showPickerFor]: formatted };
        setHours(h);
        if (!selectedTimes.includes(showPickerFor)) setSelectedTimes(s => [...s, showPickerFor]);
        onChange({ time: showPickerFor, hour: formatted });
        setShowPickerFor(null);
    }

    return (
        <View style={[styles.timeContainer, isDark && styles.timeContainerDark]}>
            <Text style={[styles.timeTitle, isDark && styles.timeTitleDark]}>Kullanım Saatleri</Text>
            <View style={styles.buttonContainer}>
                {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                        key={time}
                        style={[
                            styles.timeButton,
                            selectedTimes.includes(time) && styles.timeButtonSelected,
                        ]}
                        onPress={() => handleTimeSelection(time)}
                        onLongPress={() => setShowPickerFor(time)}
                    >
                        <MaterialCommunityIcons
                            name={TIME_ICONS[time]}
                            size={20}
                            color={selectedTimes.includes(time) ? '#fff' : '#0288D1'}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            style={[
                                styles.timeButtonText,
                                selectedTimes.includes(time) && styles.timeButtonTextSelected,
                            ]}
                        >
                            {time}
                            {hours[time] ? ` – ${hours[time]}` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {showPickerFor && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

const AddMedicationScreen: React.FC = () => {
    const { user } = useAuth();
    const { enabled: notificationsEnabled } = useNotifications();
    const { isDark } = useContext(ThemeContext);

    const [medicationName, setMedicationName] = useState('');
    const [usageTimes, setUsageTimes] = useState<{ time: string; hour: string }[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'users', user.uid, 'medications'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, s => setMedications(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [user]);

    function resetForm() {
        setEditingId(null);
        setMedicationName('');
        setUsageTimes([]);
    }

    async function handleAddOrUpdate() {
        if (!user || !medicationName || usageTimes.length === 0) {
            return Alert.alert('Eksik bilgi', 'İlaç adı ve kullanım saatlerini girin.');
        }
        try {
            if (editingId) {
                const ref = doc(db, 'users', user.uid, 'medications', editingId);
                const snap = await getDoc(ref);
                const oldIds: string[] = snap.data()?.notificationIds || [];
                await cancelMedicationNotifications(oldIds);
                await updateDoc(ref, { medicationName, usageTimes });
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(editingId, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            } else {
                const ref = await addDoc(
                    collection(db, 'users', user.uid, 'medications'),
                    { medicationName, usageTimes, createdAt: new Date() }
                );
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(ref.id, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            }
            setModalVisible(false);
            resetForm();
        } catch (e) {
            console.error(e);
            Alert.alert('Hata', 'İşlem başarısız oldu.');
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteDoc(doc(db, 'users', user!.uid, 'medications', id));
        } catch {
            Alert.alert('Hata', 'Silme başarısız.');
        }
    }

    function handleTimeSelectionChange(t: { time: string; hour: string }) {
        setUsageTimes(u => {
            const i = u.findIndex(x => x.time === t.time);
            if (i > -1) {
                const arr = [...u];
                arr[i] = t;
                return arr;
            }
            return [...u, t];
        });
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.medCard, isDark && styles.medCardDark]}
            onPress={() => {
                setEditingId(item.id);
                setMedicationName(item.medicationName);
                setUsageTimes(item.usageTimes || []);
                setModalVisible(true);
            }}
        >
            <View style={styles.medInfo}>
                <MaterialCommunityIcons
                    name="pill"
                    size={24}
                    color="#2B97C2"
                    style={{ marginRight: 12 }}
                />
                <View>
                    <Text style={[styles.medTitle, isDark && styles.medTitleDark]}>
                        {item.medicationName}
                    </Text>
                    <Text style={[styles.medTime, isDark && styles.medTimeDark]}>
                        {item.usageTimes?.map((t: any) => `${t.time}: ${t.hour}`).join('  •  ')}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.screen, isDark && styles.screenDark]}>
                        <FlatList
                            data={medications}
                            keyExtractor={i => i.id}
                            renderItem={renderItem}
                            ListHeaderComponent={() => (
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.screenTitle, isDark && styles.timeTitleDark]}>
                                        İlaç Listesi
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.addNewBtn}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <MaterialCommunityIcons
                                            name="plus-circle-outline"
                                            size={20}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={styles.addNewText}>Yeni İlaç</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={styles.listContainer}
                            keyboardShouldPersistTaps="handled"
                        />

                        <Modal visible={modalVisible} animationType="slide" transparent>
                            <View style={[styles.modalOverlay, isDark && styles.modalOverlayDark]}>
                                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                                    <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                        {editingId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
                                    </Text>
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        value={medicationName}
                                        onChangeText={setMedicationName}
                                        placeholder="İlaç adı"
                                        placeholderTextColor="#A9A9A9"
                                    />
                                    <TimeSelectionInline
                                        onChange={handleTimeSelectionChange}
                                        initialSelectedTimes={usageTimes.map(u => u.time)}
                                        initialHours={usageTimes.reduce(
                                            (a, c) => ({ ...a, [c.time]: c.hour }),
                                            {}
                                        )}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity onPress={handleAddOrUpdate} style={styles.saveBtn}>
                                            <Text style={styles.saveText}>
                                                {editingId ? 'Kaydet' : 'Ekle'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setModalVisible(false);
                                                resetForm();
                                            }}
                                            style={styles.cancelBtn}
                                        >
                                            <Text style={styles.cancelText}>İptal</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    containerDark: { backgroundColor: '#121212' },
    screen: { flex: 1 },
    screenDark: { backgroundColor: '#121212' },
    listContainer: { padding: 20 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    screenTitle: { fontSize: 26, fontWeight: '700', color: '#2B97C2' },
    addNewBtn: {
        flexDirection: 'row',
        backgroundColor: '#2B97C2',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    addNewText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    medCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        marginVertical: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#2B97C2',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    medCardDark: { backgroundColor: '#1E1E1E', borderLeftColor: '#BB86FC' },
    medInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    medTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
    medTitleDark: { color: '#fff' },
    medTime: { fontSize: 14, color: '#555', marginTop: 4 },
    medTimeDark: { color: '#ccc' },
    deleteBtn: {
        backgroundColor: '#e74c3c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    deleteText: { color: '#fff', fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlayDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        width: '90%',
    },
    modalContentDark: { backgroundColor: '#1E1E1E' },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
    modalTitleDark: { color: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        marginBottom: 16,
        color: '#333',
    },
    inputDark: { backgroundColor: '#2A2A2A', color: '#fff' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    saveBtn: {
        flex: 1,
        backgroundColor: '#2B97C2',
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#ccc',
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    cancelText: { color: '#333', fontWeight: '600', fontSize: 16 },

    // TimeSelectionInline styles
    timeContainer: { marginBottom: 16 },
    timeContainerDark: { backgroundColor: '#1E1E1E' },
    timeTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8 },
    timeTitleDark: { color: '#fff' },
    buttonContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E1F5FE',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        margin: 4,
    },
    timeButtonSelected: { backgroundColor: '#0288D1' },
    timeButtonText: { color: '#0288D1', fontWeight: '600', fontSize: 14 },
    timeButtonTextSelected: { color: '#fff' },
});

export default AddMedicationScreen;
*/

//saaatli
// screens/AddMedicationScreen.tsx
/*
import React, { useEffect, useState, useContext } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Modal,
    Platform as RNPlatform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { ThemeContext } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';

import Illustration from '@/components/Illustration';
import ClockWidget from '@/components/ClockWidget';

// Eski bildirimleri iptal eder
async function cancelMedicationNotifications(ids: string[]) {
    for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}

// Yeni bildirimler planlar
async function scheduleMedicationNotifications(
    medId: string,
    name: string,
    usageTimes: { time: string; hour: string }[]
): Promise<string[]> {
    const notifIds: string[] = [];
    for (const { time, hour } of usageTimes) {
        const [hourNum, minuteNum] = hour.split(':').map(Number);
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${name} İlacı Saati`,
                body: `${time} zamanında ilacını almayı unutma!`,
                data: { medId },
            },
            trigger: { type: 'calendar', hour: hourNum, minute: minuteNum, repeats: true },
        });
        notifIds.push(id);
    }
    return notifIds;
}

const TIME_OPTIONS = ['Sabah', 'Öğle', 'İkindi', 'Akşam'];
const TIME_ICONS: Record<string, string> = {
    Sabah: 'weather-sunset-up',
    Öğle: 'weather-sunny',
    İkindi: 'weather-sunset-down',
    Akşam: 'weather-night',
};

// Saat ve ilaç saati seçimi bileşeni
interface TimeSelectionInlineProps {
    onChange?: (t: { time: string; hour: string }) => void;
    initialSelectedTimes?: string[];
    initialHours?: Record<string, string>;
}
const TimeSelectionInline: React.FC<TimeSelectionInlineProps> = ({
    onChange = () => { },
    initialSelectedTimes = [],
    initialHours = {},
}) => {
    const { isDark } = useContext(ThemeContext);
    const [selectedTimes, setSelectedTimes] = useState<string[]>(initialSelectedTimes);
    const [hours, setHours] = useState(initialHours);
    const [showPickerFor, setShowPickerFor] = useState<string | null>(null);
    const [opacity] = useState(new Animated.Value(1));

    function handleTimeSelection(time: string) {
        Animated.sequence([
            Animated.timing(opacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        if (selectedTimes.includes(time)) {
            setSelectedTimes(s => s.filter(t => t !== time));
            const h = { ...hours };
            delete h[time];
            setHours(h);
        } else {
            setSelectedTimes(s => [...s, time]);
        }
    }

    function handleTimeChange(_: any, date?: Date) {
        if (!showPickerFor) return setShowPickerFor(null);
        setShowPickerFor(null);
        if (!date) return;
        const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const h = { ...hours, [showPickerFor]: formatted };
        setHours(h);
        if (!selectedTimes.includes(showPickerFor)) {
            setSelectedTimes(s => [...s, showPickerFor]);
        }
        onChange({ time: showPickerFor, hour: formatted });
    }

    return (
        <View style={[styles.timeContainer, isDark && styles.timeContainerDark]}>
            <Text style={[styles.timeTitle, isDark && styles.timeTitleDark]}>Kullanım Saatleri</Text>
            <View style={styles.buttonContainer}>
                {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                        key={time}
                        style={[
                            styles.timeButton,
                            selectedTimes.includes(time) && styles.timeButtonSelected,
                        ]}
                        onPress={() => handleTimeSelection(time)}
                        onLongPress={() => setShowPickerFor(time)}
                    >
                        <MaterialCommunityIcons
                            name={TIME_ICONS[time]}
                            size={20}
                            color={selectedTimes.includes(time) ? '#fff' : '#0288D1'}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            style={[
                                styles.timeButtonText,
                                selectedTimes.includes(time) && styles.timeButtonTextSelected,
                            ]}
                        >
                            {time}
                            {hours[time] ? ` – ${hours[time]}` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {showPickerFor && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

const AddMedicationScreen: React.FC = () => {
    const { user } = useAuth();
    const { enabled: notificationsEnabled } = useNotifications();
    const { isDark } = useContext(ThemeContext);

    const [medicationName, setMedicationName] = useState('');
    const [usageTimes, setUsageTimes] = useState<{ time: string; hour: string }[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Veritabanından çek
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'users', user.uid, 'medications'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, s =>
            setMedications(s.docs.map(d => ({ id: d.id, ...d.data() })))
        );
    }, [user]);

    function resetForm() {
        setEditingId(null);
        setMedicationName('');
        setUsageTimes([]);
    }

    async function handleAddOrUpdate() {
        if (!user || !medicationName || usageTimes.length === 0) {
            return Alert.alert('Eksik bilgi', 'İlaç adı ve kullanım saatlerini girin.');
        }
        try {
            if (editingId) {
                const ref = doc(db, 'users', user.uid, 'medications', editingId);
                const snap = await getDoc(ref);
                const oldIds: string[] = snap.data()?.notificationIds || [];
                await cancelMedicationNotifications(oldIds);
                await updateDoc(ref, { medicationName, usageTimes });
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(editingId, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            } else {
                const ref = await addDoc(
                    collection(db, 'users', user.uid, 'medications'),
                    { medicationName, usageTimes, createdAt: new Date() }
                );
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(ref.id, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            }
            setModalVisible(false);
            resetForm();
        } catch (e) {
            console.error(e);
            Alert.alert('Hata', 'İşlem başarısız oldu.');
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteDoc(doc(db, 'users', user!.uid, 'medications', id));
        } catch {
            Alert.alert('Hata', 'Silme başarısız.');
        }
    }

    function handleTimeSelectionChange(t: { time: string; hour: string }) {
        setUsageTimes(u => {
            const i = u.findIndex(x => x.time === t.time);
            if (i > -1) {
                const arr = [...u];
                arr[i] = t;
                return arr;
            }
            return [...u, t];
        });
    }

    // En yakın ilacı bul
    const allTimes = medications
        .flatMap(m => m.usageTimes.map((u: any) => ({ name: m.medicationName, hour: u.hour })));
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const upcoming = allTimes
        .map((m: any) => {
            const [h, mm] = m.hour.split(':').map(Number);
            const diff = (h * 60 + mm) - nowMinutes;
            return { ...m, diff: diff >= 0 ? diff : diff + 24 * 60 };
        })
        .sort((a: any, b: any) => a.diff - b.diff)[0] || null;

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <Illustration />

            <ClockWidget nextMedication={upcoming} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.screen, isDark && styles.screenDark]}>
                        <FlatList
                            data={medications}
                            keyExtractor={i => i.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.medCard, isDark && styles.medCardDark]}
                                    onPress={() => {
                                        setEditingId(item.id);
                                        setMedicationName(item.medicationName);
                                        setUsageTimes(item.usageTimes || []);
                                        setModalVisible(true);
                                    }}
                                >
                                    <View style={styles.medInfo}>
                                        <MaterialCommunityIcons
                                            name="pill"
                                            size={24}
                                            color="#2B97C2"
                                            style={{ marginRight: 12 }}
                                        />
                                        <View>
                                            <Text style={[styles.medTitle, isDark && styles.medTitleDark]}>
                                                {item.medicationName}
                                            </Text>
                                            <Text style={[styles.medTime, isDark && styles.medTimeDark]}>
                                                {item.usageTimes
                                                    .map((t: any) => `${t.time}: ${t.hour}`)
                                                    .join('  •  ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                        <Text style={styles.deleteText}>Sil</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                            ListHeaderComponent={() => (
                                <View style={styles.headerContainer}>
                                    <Text style={[styles.screenTitle, isDark && styles.screenTitleDark]}>
                                        İlaç Listesi
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.addNewBtn}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <MaterialCommunityIcons
                                            name="plus-circle-outline"
                                            size={20}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={styles.addNewText}>Yeni İlaç</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={styles.listContainer}
                            keyboardShouldPersistTaps="handled"
                        />

                        <Modal visible={modalVisible} animationType="slide" transparent>
                            <View style={[styles.modalOverlay, isDark && styles.modalOverlayDark]}>
                                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                                    <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                        {editingId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
                                    </Text>
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        value={medicationName}
                                        onChangeText={setMedicationName}
                                        placeholder="İlaç adı"
                                        placeholderTextColor="#A9A9A9"
                                    />
                                    <TimeSelectionInline
                                        onChange={handleTimeSelectionChange}
                                        initialSelectedTimes={usageTimes.map(u => u.time)}
                                        initialHours={usageTimes.reduce(
                                            (a, c) => ({ ...a, [c.time]: c.hour }),
                                            {}
                                        )}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity onPress={handleAddOrUpdate} style={styles.saveBtn}>
                                            <Text style={styles.saveText}>{editingId ? 'Kaydet' : 'Ekle'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setModalVisible(false);
                                                resetForm();
                                            }}
                                            style={styles.cancelBtn}
                                        >
                                            <Text style={styles.cancelText}>İptal</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    containerDark: { backgroundColor: '#121212' },
    screen: { flex: 1 },
    screenDark: { backgroundColor: '#121212' },
    listContainer: { padding: 20 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    screenTitle: { fontSize: 26, fontWeight: '700', color: '#2B97C2' },
    screenTitleDark: { color: '#BB86FC' },
    addNewBtn: {
        flexDirection: 'row',
        backgroundColor: '#2B97C2',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    addNewText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    medCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        marginVertical: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#2B97C2',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    medCardDark: { backgroundColor: '#1E1E1E', borderLeftColor: '#BB86FC' },
    medInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    medTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
    medTitleDark: { color: '#fff' },
    medTime: { fontSize: 14, color: '#555', marginTop: 4 },
    medTimeDark: { color: '#ccc' },
    deleteBtn: {
        backgroundColor: '#e74c3c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    deleteText: { color: '#fff', fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlayDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        width: '90%',
    },
    modalContentDark: { backgroundColor: '#1E1E1E' },
    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
    modalTitleDark: { color: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        marginBottom: 16,
        color: '#333',
    },
    inputDark: { backgroundColor: '#2A2A2A', color: '#fff' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    saveBtn: {
        flex: 1,
        backgroundColor: '#2B97C2',
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#ccc',
        paddingVertical: 14,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    cancelText: { color: '#333', fontWeight: '600', fontSize: 16 },

    // TimeSelectionInline
    timeContainer: { marginBottom: 16 },
    timeContainerDark: { backgroundColor: '#1E1E1E' },
    timeTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8 },
    timeTitleDark: { color: '#fff' },
    buttonContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E1F5FE',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        margin: 4,
    },
    timeButtonSelected: { backgroundColor: '#0288D1' },
    timeButtonText: { color: '#0288D1', fontWeight: '600', fontSize: 14 },
    timeButtonTextSelected: { color: '#fff' },
});

export default AddMedicationScreen;
*/


// AddMedicationScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Modal,
    ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as Notifications from 'expo-notifications';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { ThemeContext } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';

async function cancelMedicationNotifications(ids: string[]) {
    for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}


async function scheduleMedicationNotifications(
    medId: string,
    name: string,
    usageTimes: { time: string; hour: string }[]
): Promise<string[]> {
    const notifIds: string[] = [];
    for (const { time, hour } of usageTimes) {
        const [hourNum, minuteNum] = hour.split(':').map(Number);
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${name} İlacı Saati`,
                body: `${time} zamanında almayı unutma!`,
                data: { medId },
            },
            trigger: { type: 'calendar', hour: hourNum, minute: minuteNum, repeats: true },
        });
        notifIds.push(id);
    }
    return notifIds;
}

const TIME_OPTIONS = ['Sabah', 'Öğle', 'İkindi', 'Akşam'];
const TIME_ICONS: Record<string, string> = {
    Sabah: 'weather-sunset-up',
    Öğle: 'weather-sunny',
    İkindi: 'weather-sunset-down',
    Akşam: 'weather-night',
};

interface TimeSelectionInlineProps {
    onChange?: (t: { time: string; hour: string }) => void;
    initialSelectedTimes?: string[];
    initialHours?: Record<string, string>;
}
const TimeSelectionInline: React.FC<TimeSelectionInlineProps> = ({
    onChange = () => { },
    initialSelectedTimes = [],
    initialHours = {},
}) => {
    const { isDark } = useContext(ThemeContext);
    const [selectedTimes, setSelectedTimes] = useState<string[]>(initialSelectedTimes);
    const [hours, setHours] = useState(initialHours);
    const [showPickerFor, setShowPickerFor] = useState<string | null>(null);

    const handleTimeSelection = (time: string) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(s => s.filter(t => t !== time));
            const h = { ...hours };
            delete h[time];
            setHours(h);
        } else {
            setSelectedTimes(s => [...s, time]);
        }
    };

    const handleTimeChange = (_: any, date?: Date) => {
        if (!showPickerFor) {
            setShowPickerFor(null);
            return;
        }
        if (date) {
            const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const h = { ...hours, [showPickerFor]: formatted };
            setHours(h);
            if (!selectedTimes.includes(showPickerFor)) {
                setSelectedTimes(s => [...s, showPickerFor]);
            }
            onChange({ time: showPickerFor, hour: formatted });
        }
        setShowPickerFor(null);
    };

    return (
        <View style={[styles.timeContainer, isDark && styles.timeContainerDark]}>
            <Text style={[styles.timeTitle, isDark && styles.timeTitleDark]}>Kullanım Saatleri</Text>
            <View style={styles.buttonContainer}>
                {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                        key={time}
                        style={[
                            styles.timeButton,
                            selectedTimes.includes(time) && styles.timeButtonSelected,
                        ]}
                        onPress={() => handleTimeSelection(time)}
                        onLongPress={() => setShowPickerFor(time)}
                    >
                        <MaterialCommunityIcons
                            name={TIME_ICONS[time]}
                            size={20}
                            color={selectedTimes.includes(time) ? '#fff' : '#0288D1'}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            style={[
                                styles.timeButtonText,
                                selectedTimes.includes(time) && styles.timeButtonTextSelected,
                            ]}
                        >
                            {time}
                            {hours[time] ? ` – ${hours[time]}` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {showPickerFor && (
                <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

const AddMedicationScreen: React.FC = () => {
    const { user } = useAuth();
    const { enabled: notificationsEnabled } = useNotifications();
    const { isDark } = useContext(ThemeContext);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [medications, setMedications] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [medicationName, setMedicationName] = useState('');
    const [usageTimes, setUsageTimes] = useState<{ time: string; hour: string }[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'users', user.uid, 'medications'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, snap =>
            setMedications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
    }, [user]);


    const upcoming = medications
        .flatMap(m => m.usageTimes.map((t: any) => ({ name: m.medicationName, hour: t.hour })))
        .sort((a, b) => a.hour.localeCompare(b.hour))
        .slice(0, 2);

    function resetForm() {
        setEditingId(null);
        setMedicationName('');
        setUsageTimes([]);
    }

    async function handleAddOrUpdate() {
        if (!user || !medicationName || usageTimes.length === 0) {
            return Alert.alert('Eksik bilgi', 'İlaç adı ve kullanım saatlerini girin.');
        }
        try {
            if (editingId) {
                const ref = doc(db, 'users', user.uid, 'medications', editingId);
                const snap = await getDoc(ref);
                const oldIds: string[] = snap.data()?.notificationIds || [];
                await cancelMedicationNotifications(oldIds);
                await updateDoc(ref, { medicationName, usageTimes });
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(editingId, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            } else {
                const ref = await addDoc(
                    collection(db, 'users', user.uid, 'medications'),
                    { medicationName, usageTimes, createdAt: new Date() }
                );
                const newIds = notificationsEnabled
                    ? await scheduleMedicationNotifications(ref.id, medicationName, usageTimes)
                    : [];
                await updateDoc(ref, { notificationIds: newIds });
            }
            setModalVisible(false);
            resetForm();
        } catch (e) {
            console.error(e);
            Alert.alert('Hata', 'İşlem başarısız oldu.');
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteDoc(doc(db, 'users', user!.uid, 'medications', id));
        } catch {
            Alert.alert('Hata', 'Silme başarısız.');
        }
    }

    function handleTimeSelectionChange(t: { time: string; hour: string }) {
        setUsageTimes(u => {
            const i = u.findIndex(x => x.time === t.time);
            if (i > -1) {
                const arr = [...u];
                arr[i] = t;
                return arr;
            }
            return [...u, t];
        });
    }

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>

                        <Calendar
                            current={selectedDate}
                            onDayPress={day => setSelectedDate(day.dateString)}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    selectedColor: '#2B97C2',
                                },
                            }}
                            theme={{
                                backgroundColor: isDark ? '#121212' : '#fff',
                                calendarBackground: isDark ? '#1E1E1E' : '#fff',
                                dayTextColor: isDark ? '#fff' : '#333',
                                monthTextColor: '#2B97C2',
                                arrowColor: '#2B97C2',
                            }}
                            style={styles.calendar}
                        />


                        <View style={styles.upcomingContainer}>
                            <View style={styles.clockRow}>
                                <View>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                        Şu Anki Saat
                                    </Text>
                                    <Text style={[styles.digitalClock, isDark && styles.digitalClockDark]}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.smallFab, isDark && styles.smallFabDark]}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                Yaklaşan İlaçlar
                            </Text>
                            {upcoming.map((up, i) => (
                                <View
                                    key={i}
                                    style={[styles.upcomingCard, isDark && styles.upcomingCardDark]}
                                >
                                    <MaterialCommunityIcons
                                        name="pill"
                                        size={20}
                                        color={isDark ? '#BB86FC' : '#2B97C2'}
                                    />
                                    <Text style={[styles.upcomingText, isDark && styles.upcomingTextDark]}>
                                        {up.name} — {up.hour}
                                    </Text>
                                </View>
                            ))}
                        </View>


                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Bugünün İlaçları
                        </Text>
                        <FlatList
                            style={styles.list}
                            data={medications}
                            keyExtractor={i => i.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.medCard, isDark && styles.medCardDark]}
                                    onPress={() => {
                                        setEditingId(item.id);
                                        setMedicationName(item.medicationName);
                                        setUsageTimes(item.usageTimes || []);
                                        setModalVisible(true);
                                    }}

                                >
                                    <View style={styles.medInfo}>
                                        <MaterialCommunityIcons
                                            name="pill"
                                            size={24}
                                            color={isDark ? '#BB86FC' : '#2B97C2'}
                                            style={{ marginRight: 12 }}
                                        />
                                        <View>
                                            <Text style={[styles.medTitle, isDark && styles.medTitleDark]}>
                                                {item.medicationName}
                                            </Text>
                                            <Text style={[styles.medTime, isDark && styles.medTimeDark]}>
                                                {item.usageTimes.map((t: any) => `${t.time}: ${t.hour}`).join('  •  ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                        <Text style={styles.deleteText}>Sil</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                                    Bugün için ekli ilaç yok.
                                </Text>
                            }
                            contentContainerStyle={styles.listContainer}
                        />


                        <Modal visible={modalVisible} animationType="slide" transparent>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={[styles.modalOverlay, isDark && styles.modalOverlayDark]}>
                                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                            {editingId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            value={medicationName}
                                            onChangeText={setMedicationName}
                                            placeholder="İlaç adı"
                                            placeholderTextColor="#A9A9A9"
                                        />
                                        <TimeSelectionInline
                                            onChange={handleTimeSelectionChange}
                                            initialSelectedTimes={usageTimes.map(u => u.time)}
                                            initialHours={usageTimes.reduce(
                                                (a, c) => ({ ...a, [c.time]: c.hour }),
                                                {}
                                            )}
                                        />
                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity onPress={handleAddOrUpdate} style={styles.saveBtn}>
                                                <Text style={styles.saveText}>{editingId ? 'Kaydet' : 'Ekle'}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    resetForm();
                                                }}
                                                style={styles.cancelBtn}
                                            >
                                                <Text style={styles.cancelText}>İptal</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    containerDark: { backgroundColor: '#121212' },

    calendar: { margin: 10, borderRadius: 8, overflow: 'hidden' },

    upcomingContainer: { marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
    clockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 6 },
    sectionTitleDark: { color: '#fff' },

    digitalClock: { fontSize: 36, fontWeight: '700', color: '#2B97C2' },
    digitalClockDark: { color: '#BB86FC' },

    smallFab: {
        backgroundColor: '#2B97C2',
        padding: 8,
        borderRadius: 20,
        elevation: 3,
    },
    smallFabDark: { backgroundColor: '#BB86FC' },

    upcomingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
    },
    upcomingCardDark: { backgroundColor: '#1E1E1E' },

    upcomingText: { marginLeft: 8, fontSize: 16, color: '#333' },
    upcomingTextDark: { color: '#ccc' },

    list: { flex: 1 },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },

    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    emptyTextDark: { color: '#aaa' },

    medCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginVertical: 6,
        borderLeftWidth: 4,
        borderLeftColor: '#2B97C2',
        elevation: 2,
    },
    medCardDark: { backgroundColor: '#1E1E1E', borderLeftColor: '#BB86FC' },

    medInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    medTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    medTitleDark: { color: '#fff' },
    medTime: { fontSize: 14, color: '#555', marginTop: 4 },
    medTimeDark: { color: '#ccc' },

    deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 8 },
    deleteText: { color: '#fff', fontWeight: '600' },


    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlayDark: { backgroundColor: 'rgba(255,255,255,0.1)' },

    modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 16, padding: 20 },
    modalContentDark: { backgroundColor: '#1E1E1E' },

    modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
    modalTitleDark: { color: '#fff' },

    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#FAFAFA',
        marginBottom: 16,
        color: '#333',
    },
    inputDark: { backgroundColor: '#2A2A2A', color: '#fff' },

    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    saveBtn: { flex: 1, backgroundColor: '#2B97C2', padding: 14, borderRadius: 12, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: { flex: 1, backgroundColor: '#ccc', padding: 14, borderRadius: 12, alignItems: 'center', marginLeft: 10 },
    cancelText: { color: '#333', fontWeight: '600', fontSize: 16 },


    timeContainer: { marginBottom: 16 },
    timeContainerDark: { backgroundColor: '#1E1E1E', padding: 10, borderRadius: 12 },
    timeTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8 },
    timeTitleDark: { color: '#fff' },
    buttonContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    timeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, margin: 4 },
    timeButtonSelected: { backgroundColor: '#0288D1' },
    timeButtonText: { color: '#0288D1', fontWeight: '600', fontSize: 14 },
    timeButtonTextSelected: { color: '#fff' },
});

export default AddMedicationScreen;

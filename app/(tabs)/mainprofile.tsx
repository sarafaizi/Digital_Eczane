/*import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

const ProfilSayfasi = () => {
    const { user, updateUserInfo } = useAuth();
    const [name, setName] = useState<string>(user?.name ?? '');
    const [surname, setSurname] = useState<string>(user?.surname ?? '');
    const [age, setAge] = useState<string | undefined>(user?.age);
    const [profession, setProfession] = useState<string | undefined>(user?.profession ?? '');
    const [disease, setDisease] = useState<string | undefined>(user?.disease ?? '');
    const [isProfileOpen, setProfileOpen] = useState<boolean>(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setSurname(user.surname);
            setAge(user.age);
            setProfession(user.profession);
            setDisease(user.disease);
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) {
            Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı.');
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name,
                surname,
                age,
                profession,
                disease,
            });

            updateUserInfo({ name, surname, age, profession, disease });
            Alert.alert('Başarılı', 'Profil başarıyla güncellendi!');
        } catch (error) {
            console.error('Profil güncellenemedi', error);
            Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
        }
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => setProfileOpen(!isProfileOpen)} style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>👤 Profil Bilgileri</Text>
                <MaterialIcons
                    name={isProfileOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color="#555"
                />
            </TouchableOpacity>
            {isProfileOpen && (
                <View style={styles.accordionContent}>
                    <RenderField icon="person" label="Ad" value={name} onChangeText={setName} />
                    <RenderField icon="person-outline" label="Soyad" value={surname} onChangeText={setSurname} />
                    <RenderField icon="calendar-today" label="Yaş" value={age} onChangeText={setAge} keyboardType="numeric" />
                    <RenderField icon="work" label="Meslek" value={profession} onChangeText={setProfession} />
                    <RenderField icon="healing" label="Hastalık" value={disease} onChangeText={setDisease} />
                    <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
                        <MaterialIcons name="save" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Profili Güncelle</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const RenderField: React.FC<{
    icon: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}> = ({ icon, label, value, onChangeText, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
        <MaterialIcons name={icon} size={20} color="#555" style={styles.inputIcon} />
        <View style={styles.inputContent}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                placeholder={`${label} giriniz...`}
                placeholderTextColor="#aaa"
            />
        </View>
    </View>
);

const AddIlacScreen = () => {
    const { user } = useAuth();
    const [medicationName, setMedicationName] = useState('');
    const [usageCount, setUsageCount] = useState('');
    const [usageTime, setUsageTime] = useState('');
    const [isMedicationOpen, setMedicationOpen] = useState<boolean>(false);

    const handleAddMedication = async () => {
        if (!user) {
            Alert.alert('Hata', 'Lütfen giriş yapınız.');
            return;
        }

        if (!medicationName || !usageCount || !usageTime) {
            Alert.alert('Eksik bilgi', 'Tüm alanları doldurun.');
            return;
        }

        try {
            await addDoc(collection(db, 'users', user.uid, 'medications'), {
                medicationName,
                usageCount: parseInt(usageCount),
                usageTime,
                createdAt: new Date(),
            });

            Alert.alert('Başarılı', 'İlaç başarıyla eklendi');
            setMedicationName('');
            setUsageCount('');
            setUsageTime('');
        } catch (error) {
            console.error('İlaç eklenirken hata:', error);
            Alert.alert('Hata', 'İlaç eklenemedi');
        }
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => setMedicationOpen(!isMedicationOpen)} style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>💊 İlaç Ekleme</Text>
                <MaterialIcons
                    name={isMedicationOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color="#555"
                />
            </TouchableOpacity>
            {isMedicationOpen && (
                <View style={styles.accordionContent}>
                    <Text style={styles.label}>İlaç Adı</Text>
                    <TextInput
                        style={styles.input}
                        value={medicationName}
                        onChangeText={setMedicationName}
                    />

                    <Text style={styles.label}>Günde Kaç Kere</Text>
                    <TextInput
                        style={styles.input}
                        value={usageCount}
                        onChangeText={setUsageCount}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Kullanım Saati (örn: 09:00)</Text>
                    <TextInput
                        style={styles.input}
                        value={usageTime}
                        onChangeText={setUsageTime}
                    />

                    <TouchableOpacity onPress={handleAddMedication} style={styles.button}>
                        <Text style={styles.buttonText}>İlacı Kaydet</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const MainScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ProfilSayfasi />
            <AddIlacScreen />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f2f4f7',
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    accordionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    accordionContent: {
        paddingVertical: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputContent: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        marginTop: 30,
        backgroundColor: '#4A90E2',
        padding: 14,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MainScreen;
*/
/*
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, Switch, StyleSheet, useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilSayfasi from './profile';
import AddIlacScreen from './add';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MainScreen: React.FC = () => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    
    useEffect(() => {
        setIsDark(systemScheme === 'dark');
    }, [systemScheme]);

    return (
        <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, isDark && styles.darkText]}>Ayarlar</Text>
                <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>Uygulamanın görünümünü özelleştir ve bildirim tercihlerini yönet</Text>
                <View style={styles.toggleGroup}>
                    <LinearGradient colors={['#2B97C2', '#2BBCC2']} style={styles.toggleCard}>
                        <MaterialCommunityIcons name="bell-ring-outline" size={24} color="#fff" />
                        <Text style={styles.toggleLabel}>Bildirimler</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled} // eklendi
                            trackColor={{ false: '#ccc', true: '#fff' }}
                            thumbColor={notificationsEnabled ? '#2B97C2' : '#aaa'}
                        />
                    </LinearGradient>
                    <LinearGradient colors={['#555', '#777']} style={[styles.toggleCard, styles.toggleCardDark]}>
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="#fff" />
                        <Text style={styles.toggleLabel}>Karanlık Mod</Text>
                        <Switch
                            value={isDark}
                            onValueChange={setIsDark} // eklendi
                            trackColor={{ false: '#ccc', true: '#fff' }}
                            thumbColor={isDark ? '#555' : '#aaa'}
                        />
                    </LinearGradient>
                </View>
                <ProfilSayfasi />
                <AddIlacScreen />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    darkContainer: { backgroundColor: '#121212' },
    content: { padding: 20 },
    title: { fontSize: 32, fontWeight: '700', color: '#333', marginBottom: 8 },
    darkText: { color: '#fff' },
    subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
    darkSubtitle: { color: '#ccc' },
    toggleGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    toggleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginHorizontal: 4 },
    toggleCardDark: { opacity: 0.8 },
    toggleLabel: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 12, fontWeight: '600' },
});

export default MainScreen;*/
import React, { useState, useContext, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Switch,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { auth } from '@/lib/firebase';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from 'firebase/auth';
import { useNotifications } from '@/context/NotificationContext';
const SettingsScreen: React.FC = () => {
    const router = useRouter();
    const { user, updateUserInfo, signOut } = useAuth();
    const { isDark, toggleDark } = useContext(ThemeContext);

    const [notificationsEnabled1, setNotificationsEnabled] = useState(true);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);


    const [name, setName] = useState(user?.name || '');
    const [surname, setSurname] = useState(user?.surname || '');
    const [age, setAge] = useState(user?.age || '');
    const [profession, setProfession] = useState(user?.profession || '');
    const [disease, setDisease] = useState(user?.disease || '');


    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { enabled: notificationsEnabled, toggleEnabled } = useNotifications(); useEffect(() => {
        if (user) {
            setName(user.name);
            setSurname(user.surname);
            setAge(user.age);
            setProfession(user.profession);
            setDisease(user.disease);
        }
    }, [user]);


    const toggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value);
        if (!value) {
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert('Bildirimler kapatıldı', 'Tüm planlı ilaç hatırlatmaları iptal edildi.');
        }
    };


    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await updateUserInfo({ name, surname, age, profession, disease });
            Alert.alert('Başarılı', 'Profil güncellendi');
            setProfileModalVisible(false);
        } catch (e) {
            console.error(e);
            Alert.alert('Hata', 'Profil güncellenemedi');
        }
    };


    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
            return;
        }
        try {
            const userAuth = auth.currentUser;
            if (userAuth?.email) {

                const cred = EmailAuthProvider.credential(userAuth.email, currentPassword);
                await reauthenticateWithCredential(userAuth, cred);
                await updatePassword(userAuth, newPassword);
                Alert.alert('Başarılı', 'Şifre başarıyla güncellendi');
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            console.error(err);
            Alert.alert(
                'Hata',
                err.code === 'auth/wrong-password'
                    ? 'Mevcut şifre yanlış'
                    : 'Şifre güncellenemedi'
            );
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Çıkış Yap',
            'Oturumunuzu kapatmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Evet', style: 'destructive', onPress: () => signOut() },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={[styles.header, isDark && styles.headerDark]}>Ayarlar</Text>


                <View style={[styles.group, isDark && styles.groupDark]}>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => setProfileModalVisible(true)}
                    >
                        <View style={[styles.iconBg, { backgroundColor: '#E6F0FF' }]}>
                            <MaterialIcons name="person" size={24} color="#2B97C2" />
                        </View>
                        <View style={styles.itemText}>
                            <Text style={[styles.titleText, isDark && styles.textDark]}>
                                {user?.name} {user?.surname}
                            </Text>
                            <Text style={[styles.subText, isDark && styles.subTextDark]}>
                                {user?.age} yaşında
                            </Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
                    </TouchableOpacity>
                </View>


                <View style={[styles.group, isDark && styles.groupDark]}>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => setProfileModalVisible(true)}
                    >
                        <View style={[styles.iconBg, { backgroundColor: '#E0F7FA' }]}>
                            <MaterialIcons name="edit" size={24} color="#0288D1" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            Profil Bilgilerini Düzenle
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.item}
                        onPress={() =>
                            Alert.alert(
                                'İlaç Ekle',
                                'İlaç ekleme sayfasına yönlendiriliyorsunuz.',
                                [
                                    { text: 'İptal', style: 'cancel' },
                                    { text: 'Tamam', onPress: () => router.push('/time') },
                                ]
                            )
                        }
                    >
                        <View style={[styles.iconBg, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="pill" size={24} color="#43A047" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            İlaç Ekle / Listele
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
                    </TouchableOpacity>


                    <View style={styles.item}>
                        <View style={[styles.iconBg, { backgroundColor: '#FFF3E0' }]}>
                            <MaterialCommunityIcons name="bell-outline" size={24} color="#FB8C00" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            Bildirim Ayarları
                        </Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleEnabled}
                            trackColor={{ false: '#888', true: '#0288D1' }}
                            thumbColor="#fff"
                        />
                    </View>


                    <View style={styles.item}>
                        <View style={[styles.iconBg, { backgroundColor: '#ECEFF1' }]}>
                            <MaterialCommunityIcons name="weather-night" size={24} color="#546E7A" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            Koyu Mod
                        </Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleDark}
                            trackColor={{ false: '#888', true: '#0288D1' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>


                <View style={[styles.group, isDark && styles.groupDark]}>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => setPasswordModalVisible(true)}
                    >
                        <View style={[styles.iconBg, { backgroundColor: '#F3E5F5' }]}>
                            <MaterialCommunityIcons name="lock-reset" size={24} color="#8E24AA" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            Şifre Değiştir
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item} onPress={handleSignOut}>
                        <View style={[styles.iconBg, { backgroundColor: '#FFEBEE' }]}>
                            <MaterialCommunityIcons name="exit-to-app" size={24} color="#E53935" />
                        </View>
                        <Text style={[styles.titleText, isDark && styles.textDark]}>
                            Çıkış Yap
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
                    </TouchableOpacity>
                </View>
            </ScrollView>


            <Modal
                visible={profileModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                            Profil Bilgileri
                        </Text>
                        {[
                            { label: 'Ad', value: name, setter: setName },
                            { label: 'Soyad', value: surname, setter: setSurname },
                            { label: 'Yaş', value: age, setter: setAge, keyboard: 'numeric' },
                            { label: 'Meslek', value: profession, setter: setProfession },
                            { label: 'Hastalık', value: disease, setter: setDisease },
                        ].map(({ label, value, setter, keyboard }) => (
                            <View key={label} style={styles.field}>
                                <Text style={[styles.fieldLabel, isDark && styles.textDark]}>
                                    {label}
                                </Text>
                                <TextInput
                                    style={[styles.fieldInput, isDark && styles.fieldInputDark]}
                                    value={value}
                                    onChangeText={setter}
                                    keyboardType={keyboard}
                                    placeholder={label}
                                    placeholderTextColor={isDark ? '#666' : '#aaa'}
                                />
                            </View>
                        ))}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.buttonText}>Kaydet</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={() => setProfileModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal
                visible={passwordModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                            Şifre Değiştir
                        </Text>
                        <TextInput
                            style={[styles.fieldInput, isDark && styles.fieldInputDark]}
                            placeholder="Mevcut Şifre"
                            placeholderTextColor={isDark ? '#666' : '#aaa'}
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TextInput
                            style={[styles.fieldInput, isDark && styles.fieldInputDark]}
                            placeholder="Yeni Şifre"
                            placeholderTextColor={isDark ? '#666' : '#aaa'}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={[styles.fieldInput, isDark && styles.fieldInputDark]}
                            placeholder="Yeni Şifre (Tekrar)"
                            placeholderTextColor={isDark ? '#666' : '#aaa'}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleUpdatePassword}
                            >
                                <Text style={styles.buttonText}>Kaydet</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={() => setPasswordModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f4f7' },
    containerDark: { backgroundColor: '#121212' },
    scroll: { padding: 20 },
    header: { fontSize: 32, fontWeight: '700', marginBottom: 20, color: '#333' },
    headerDark: { color: '#fff' },
    group: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    groupDark: { backgroundColor: '#1E1E1E' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
    iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemText: { flex: 1 },
    titleText: { fontSize: 16, color: '#333', fontWeight: '600' },
    subText: { fontSize: 14, color: '#666', marginTop: 4 },
    textDark: { color: '#fff' },
    subTextDark: { color: '#ccc' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalContentDark: { backgroundColor: '#1E1E1E' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#333' },
    field: { marginBottom: 12 },
    fieldLabel: { fontSize: 14, marginBottom: 6, color: '#555' },
    fieldInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fafafa', color: '#000' },
    fieldInputDark: { borderColor: '#444', backgroundColor: '#2A2A2A', color: '#fff' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, backgroundColor: '#2B97C2', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
    logoutButton: { backgroundColor: '#E74C3C' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default SettingsScreen;

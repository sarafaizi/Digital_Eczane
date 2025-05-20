/*import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    query,
    Timestamp,
} from "firebase/firestore";

interface Medication {
    id: string;
    medicationName: string;
    usageCount: number;
    usageTime: string;
}

const IlaclarScreen = () => {
    const { user } = useAuth();
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state'leri
    const [medicationName, setMedicationName] = useState("");
    const [usageCount, setUsageCount] = useState("");
    const [usageTime, setUsageTime] = useState("");

    const fetchMedications = async () => {
        if (!user) return;

        try {
            const q = query(collection(db, "users", user.uid, "medications"));
            const snapshot = await getDocs(q);
            const data: Medication[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Medication, "id">),
            }));

            setMedications(data);
        } catch (error) {
            console.error("İlaçlar alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedication = async () => {
        if (!user) {
            Alert.alert("Hata", "Lütfen giriş yapınız.");
            return;
        }

        if (!medicationName || !usageCount || !usageTime) {
            Alert.alert("Eksik bilgi", "Tüm alanları doldurun.");
            return;
        }

        try {
            await addDoc(collection(db, "users", user.uid, "medications"), {
                medicationName,
                usageCount: parseInt(usageCount),
                usageTime,
                createdAt: Timestamp.now(),
            });

            Alert.alert("Başarılı", "İlaç başarıyla eklendi");

            // Formu temizle
            setMedicationName("");
            setUsageCount("");
            setUsageTime("");

            // Listeyi güncelle
            fetchMedications();
        } catch (error) {
            console.error("İlaç eklenirken hata:", error);
            Alert.alert("Hata", "İlaç eklenemedi");
        }
    };

    useEffect(() => {
        fetchMedications();
    }, [user]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Yeni İlaç Ekle</Text>

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

            <Button title="İlacı Kaydet" onPress={handleAddMedication} />

            <Text style={styles.header}>İlaç Listesi</Text>

            {loading ? (
                <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
            ) : medications.length === 0 ? (
                <Text>Hiç ilaç eklenmemiş.</Text>
            ) : (
                <FlatList
                    data={medications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.medicationName}</Text>
                            <Text>Günde: {item.usageCount} kez</Text>
                            <Text>Kullanım saati: {item.usageTime}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default IlaclarScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
    },
    label: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    card: {
        backgroundColor: "#f1f1f1",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
});*/
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

const ProfilSayfasi = () => {
    const { user, updateUserInfo } = useAuth();
    const [name, setName] = useState<string>(user?.name ?? '');
    const [surname, setSurname] = useState<string>(user?.surname ?? '');
    const [age, setAge] = useState<string | undefined>(user?.age);
    const [profession, setProfession] = useState<string | undefined>(user?.profession ?? '');
    const [disease, setDisease] = useState<string | undefined>(user?.disease ?? '');

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
                disease
            });

            // Kullanıcı bilgilerini güncelle
            updateUserInfo({ name, surname, age, profession, disease });
            Alert.alert('Başarılı', 'Profil başarıyla güncellendi!');
        } catch (error) {
            console.error('Profil güncellenemedi', error);
            Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profil</Text>


            <Text style={styles.label}>Ad</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Soyad</Text>
            <TextInput
                style={styles.input}
                value={surname}
                onChangeText={setSurname}
            />

            <Text style={styles.label}>Yaş</Text>
            <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Meslek</Text>
            <TextInput
                style={styles.input}
                value={profession}
                onChangeText={setProfession}
            />

            <Text style={styles.label}>Hastalık</Text>
            <TextInput
                style={styles.input}
                value={disease}
                onChangeText={setDisease}
            />

            <Button title="Profili Güncelle" onPress={handleUpdateProfile} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        marginBottom: 10,
    },
});

export default ProfilSayfasi;

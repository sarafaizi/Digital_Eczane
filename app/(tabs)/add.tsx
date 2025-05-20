import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const AddIlacScreen = () => {
    const { user } = useAuth();
    const [medicationName, setMedicationName] = useState("");
    const [usageCount, setUsageCount] = useState("");
    const [usageTime, setUsageTime] = useState("");

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
                createdAt: new Date(),
            });

            Alert.alert("Başarılı", "İlaç başarıyla eklendi");
            setMedicationName("");
            setUsageCount("");
            setUsageTime("");
        } catch (error) {
            console.error("İlaç eklenirken hata:", error);
            Alert.alert("Hata", "İlaç eklenemedi");
        }
    };

    return (
        <View style={styles.container}>
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
        </View>
    );
};

export default AddIlacScreen;

const styles = StyleSheet.create({
    container: { padding: 20 },
    label: { marginTop: 10, fontSize: 16, fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
});
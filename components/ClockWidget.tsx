import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ClockWidgetProps {
    nextMedication?: { name: string; hour: string } | null;
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ nextMedication }) => {
    const [time, setTime] = useState<string>(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Text style={styles.timeText}>{time}</Text>
                <MaterialCommunityIcons name="pill" size={32} color="#2B97C2" style={styles.icon} />
            </View>
            {nextMedication && (
                <Text style={styles.nextText}>
                    Sıradaki: {nextMedication.name} – {nextMedication.hour}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 16 },
    circle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#2B97C2',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    timeText: { fontSize: 24, fontWeight: '700', color: '#333' },
    icon: { position: 'absolute', bottom: 8 },
    nextText: { marginTop: 8, fontSize: 16, color: '#555' },
});

export default ClockWidget;

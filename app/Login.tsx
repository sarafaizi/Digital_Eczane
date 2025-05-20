import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, TouchableWithoutFeedback, Keyboard, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import Colors from '@/constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'expo-router';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

    const animateError = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };


    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.replace('/(tabs)/home');
        } catch (err) {
            console.log(err);
            setError('E-posta veya şifre yanlış');
            animateError();
        } finally {
            setLoading(false);
        }
    };

    const goToRegister = () => {
        router.push('/Signup');
    };

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                <View style={styles.innerContainer}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("@/assets/images/e_icon.jpeg")}
                            style={styles.logo}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.header2}>Digital Eczane</Text>
                            <Text style={styles.header2}>Asistanı</Text>
                        </View>
                    </View>

                    <Text style={styles.header}>Tekrardan Hoşgeldiniz :)</Text>
                    <Text style={styles.descriptionText}>Lütfen bilgilerinizi giriniz</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="E-Posta"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        onFocus={() => setError('')}
                        placeholderTextColor={Colors.primary}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        onFocus={() => setError('')}
                        placeholderTextColor={Colors.primary}
                    />

                    {error && (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={[styles.pillButton, email && password ? styles.enabled : styles.disabled, { marginBottom: 20 }]}
                        disabled={!email || !password || loading}
                        onPress={handleLogin}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Hesabınız yok mu?</Text>
                        <TouchableOpacity onPress={goToRegister}>
                            <Text style={styles.signupText}>Kayıt olun</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    innerContainer: {
        width: '100%',
        maxWidth: 380,
        paddingHorizontal: 30,
        paddingVertical: 40,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginRight: 10,
        borderWidth: 1,
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 18,
        marginTop: 12,
        color: Colors.primary,
    },
    header2: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.primaryMuted,
    },
    descriptionText: {
        fontSize: 12,
        textAlign: 'center',
        color: Colors.primaryMuted,
        marginBottom: 13,
    },
    input: {
        backgroundColor: Colors.lightGray,
        borderRadius: 29,
        fontSize: 16,
        marginVertical: 12,
        width: '100%',
        padding: 18,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderColor: Colors.primary,
    },
    enabled: {
        backgroundColor: Colors.primaryMuted,
    },
    disabled: {
        backgroundColor: Colors.blue,
    },
    errorText: {
        color: 'red',
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
    pillButton: {
        backgroundColor: Colors.blue,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footerContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: Colors.primary,
    },
    signupText: {
        color: Colors.primaryMuted,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default LoginPage;

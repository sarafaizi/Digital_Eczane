import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { auth, db, createUserWithEmailAndPassword, setDoc, doc } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

    const onSignUp = async () => {
        if (!name || !surname || !email || !password) {
            setError('Lütfen tüm alanları doldurun.');
            animateError();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name,
                surname,
                email,
                createdAt: new Date(),
            });

            setLoading(false);
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                router.replace('/Login');
            }, 1500);

        } catch (err) {
            const firebaseError = err as FirebaseError;
            console.log(firebaseError);

            setLoading(false);

            if (firebaseError.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanılıyor.');
            } else if (firebaseError.code === 'auth/weak-password') {
                setError('Şifre en az 6 karakter olmalıdır.');
            } else if (firebaseError.code === 'auth/invalid-email') {
                setError('Geçersiz e-posta adresi.');
            } else {
                setError('Bir hata oluştu, lütfen tekrar deneyin.');
            }
            animateError();
        }
    };

    const animateError = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={keyboardVerticalOffset}>
                <View style={styles.innerContainer}>
                    <Text style={styles.header}>Hesabınızı Oluşturun</Text>
                    <Text style={styles.descriptionText}>Lütfen bilgilerinizi giriniz</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="İsim"
                        value={name}
                        onChangeText={(text) => setName(text)}
                        placeholderTextColor={Colors.blue}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Soyisim"
                        value={surname}
                        onChangeText={(text) => setSurname(text)}
                        placeholderTextColor={Colors.blue}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        placeholderTextColor={Colors.blue}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        placeholderTextColor={Colors.blue}
                    />

                    {error && (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={[styles.pillButton, name && surname && email && password ? styles.enabled : styles.disabled]}
                        onPress={onSignUp}
                        disabled={loading || !name || !surname || !email || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Kayıt Ol</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Zaten bir hesabınız var mı?</Text>
                        <TouchableOpacity onPress={() => router.replace('/Login')}>
                            <Text style={styles.signupText}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Kayıt Başarılı!</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Tamam</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 18,
        color: Colors.primaryMuted,
    },
    descriptionText: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.primaryMuted,
        marginBottom: 24,
    },
    input: {
        backgroundColor: Colors.lightGray,
        padding: 16,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,
        width: '100%',
        borderColor: Colors.primary,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    },
    errorText: {
        color: 'red',
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
    pillButton: {
        backgroundColor: Colors.primary,
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
        color: Colors.primary
    },
    signupText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primaryMuted,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SignUpPage;

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAssets } from 'expo-asset'
import { ResizeMode, Video } from 'expo-av'
import { Link } from 'expo-router'
import Colors from '@/constants/Colors'
import { defaultStyles } from '@/constants/Styles'
const Page = () => {
    const [assets] = useAssets([require('../assets/video/anasayfavideo.mp4')])
    return (
        <View style={styles.container}>
            {
                assets && (
                    <Video
                        resizeMode={ResizeMode.COVER}
                        isMuted
                        isLooping
                        shouldPlay
                        source={{ uri: assets[0].uri }}
                        style={styles.video}
                    />
                )

            }
            <View style={{ marginTop: 80, padding: 20 }}>
                <Text style={styles.header} >HOŞGELDİNİZ!</Text>
                <View style={styles.buttons}>
                    <Link href={'/Login'} style={[defaultStyles.pillButton, {
                        flex: 1, backgroundColor: '#fff', top: 580,
                    }]} asChild>
                        <TouchableOpacity>
                            <Text style={{
                                fontSize: 22, fontWeight: '400', shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 7,
                                elevation: 5,
                            }}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/Signup'} style={[defaultStyles.pillButton, { flex: 1, backgroundColor: '#fff', top: 580, }]} asChild>
                        <TouchableOpacity>
                            <Text style={{
                                fontSize: 22, fontWeight: '400', shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 7,
                                elevation: 5,
                            }}>Kayıt Ol</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',


    },
    video: {
        width: '200%',
        height: '100%',
        position: 'absolute',
        alignSelf: 'center',
    }
    ,
    header: {
        fontSize: 35,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: "white",
        fontFamily: "sans-serif",
        textShadowColor: "black",
        textShadowOffset: { width: 5, height: 10 },
        textShadowRadius: 3,


    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 45,
        color: "white"


    }
})




export default Page


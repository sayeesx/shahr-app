import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const COLORS = {
    light: '#ebe4dc',
    dark: '#336263',
    gold: '#c4ac6e',
};

const AnimatedDot = ({ animValue, moveConfig, color, delay }: any) => {
    const translateY = animValue.interpolate({
        inputRange: [0, 0.2, 0.45, 0.6, 0.8, 1],
        outputRange: [0, 0, -18, -90, -90, 0],
    });

    const translateX = animValue.interpolate({
        inputRange: [0, 0.2, 0.45, 0.6, 0.8, 1],
        outputRange: moveConfig.x,
    });

    const scale = animValue.interpolate({
        inputRange: [0, 0.2, 0.45, 0.6, 0.8, 1],
        outputRange: moveConfig.scale,
    });

    const zIndex = animValue.interpolate({
        inputRange: [0, 0.333, 0.666, 1],
        outputRange: moveConfig.zIndex,
    });

    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    backgroundColor: color,
                    transform: [
                        { translateY },
                        { translateX },
                        { scale },
                    ],
                    zIndex,
                },
            ]}
        />
    );
};

export default function Loader() {
    const animValue = new Animated.Value(0);
    const rotateValue = new Animated.Value(0);

    useEffect(() => {
        // Main animation loop
        Animated.loop(
            Animated.timing(animValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            })
        ).start();

        // Rotation animation
        Animated.loop(
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const rotation = rotateValue.interpolate({
        inputRange: [0, 0.55, 0.8, 1],
        outputRange: ['0deg', '0deg', '360deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.loaderContainer,
                    {
                        transform: [{ rotate: rotation }],
                    },
                ]}
            >
                {/* Dot 3 - Light color (top) */}
                <AnimatedDot
                    animValue={animValue}
                    moveConfig={{
                        x: [0, 0, 0, 0, 0, 0],
                        scale: [1, 1, 0.45, 0.45, 0.45, 1],
                        zIndex: [3, 2, 2, 1, 1, 3],
                    }}
                    color={COLORS.light}
                    delay={0}
                />

                {/* Dot 2 - Dark color (bottom-left) */}
                <AnimatedDot
                    animValue={animValue}
                    moveConfig={{
                        x: [0, 0, -16, -80, -80, 0],
                        scale: [1, 1, 0.45, 0.45, 0.45, 1],
                        zIndex: [3, 2, 2, 1, 1, 3],
                    }}
                    color={COLORS.dark}
                    delay={0}
                />

                {/* Dot 1 - Gold color (bottom-right) */}
                <AnimatedDot
                    animValue={animValue}
                    moveConfig={{
                        x: [0, 0, 16, 80, 80, 0],
                        scale: [1, 1, 0.45, 0.45, 0.45, 1],
                        zIndex: [3, 2, 2, 1, 1, 3],
                    }}
                    color={COLORS.gold}
                    delay={0}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loaderContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
    },
});

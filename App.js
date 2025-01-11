import React, { useRef, useState } from "react";
import {
  Animated,
  View,
  StyleSheet,
  PanResponder,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const App = () => {
  const [selectedShape, setSelectedShape] = useState("box");
  const [circleVisible, setCircleVisible] = useState(false);

  const boxPan = useRef(new Animated.ValueXY()).current;
  const boxRotation = useRef(new Animated.Value(0)).current;
  const boxScale = useRef(new Animated.Value(1)).current;
  const circlePan = useRef(new Animated.ValueXY()).current;
  const circleScale = useRef(new Animated.Value(1)).current;

  const panResponderBox = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: boxPan.x, dy: boxPan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        boxPan.extractOffset();
      },
    })
  ).current;

  const panResponderCircle = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: circlePan.x, dy: circlePan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        circlePan.extractOffset();
      },
    })
  ).current;

  const animateXBy100 = () => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;

    targetPan.flattenOffset();
    Animated.timing(targetPan.x, {
      toValue: targetPan.x._value + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      targetPan.extractOffset();
    });
  };

  const animateYBy100 = () => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;

    targetPan.flattenOffset();
    Animated.timing(targetPan.y, {
      toValue: targetPan.y._value + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      targetPan.extractOffset();
    });
  };

  const rotateBox = (degrees) => {
    if (selectedShape === "box") {
      Animated.timing(boxRotation, {
        toValue: degrees,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const changeSize = (increment) => {
    const targetScale = selectedShape === "box" ? boxScale : circleScale;
    const newValue = Math.max(0.5, targetScale._value + increment);
    Animated.spring(targetScale, {
      toValue: newValue,
      friction: 2,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const moveToRandomPosition = () => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const randomX = Math.random() * (SCREEN_WIDTH - 150);
    const randomY = Math.random() * (SCREEN_HEIGHT - 150);

    Animated.timing(targetPan, {
      toValue: { x: randomX, y: randomY },
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const moveToOrigin = () => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    Animated.timing(targetPan, {
      toValue: { x: 0, y: 0 },
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.nav}>
          <TouchableOpacity
            style={
              selectedShape === "box"
                ? [styles.button, styles.activeButton]
                : styles.button
            }
            onPress={() => setSelectedShape("box")}
          >
            <Text style={styles.buttonText}>Action to Box</Text>
          </TouchableOpacity>

          {circleVisible ? (
            <TouchableOpacity
              style={
                selectedShape === "circle"
                  ? [styles.button, styles.activeButton]
                  : styles.button
              }
              onPress={() => setSelectedShape("circle")}
            >
              <Text style={styles.buttonText}>Select Circle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCircleVisible(true)}
            >
              <Text style={styles.buttonText}>Add Circle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.buttonScrollView}
          >
            <TouchableOpacity style={styles.button} onPress={animateXBy100}>
              <Text style={styles.buttonText}>Animate X by 100</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={animateYBy100}>
              <Text style={styles.buttonText}>Animate Y by 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => rotateBox(45)}
            >
              <Text style={styles.buttonText}>Rotate by 45°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => rotateBox(90)}
            >
              <Text style={styles.buttonText}>Rotate by 90°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => changeSize(0.1)}
            >
              <Text style={styles.buttonText}>Increase Size</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => changeSize(-0.1)}
            >
              <Text style={styles.buttonText}>Decrease Size</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={moveToRandomPosition}
            >
              <Text style={styles.buttonText}>Move to Random Position</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={moveToOrigin}>
              <Text style={styles.buttonText}>Move to Origin</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.animationContainer}>
          <Text style={styles.titleText}>Drag this shape!</Text>

          <Animated.View
            style={[
              styles.box,
              {
                transform: [
                  { translateX: boxPan.x },
                  { translateY: boxPan.y },
                  {
                    rotate: boxRotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                  { scale: boxScale },
                ],
              },
            ]}
            {...panResponderBox.panHandlers}
          />

          {circleVisible && (
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [
                    { translateX: circlePan.x },
                    { translateY: circlePan.y },
                    { scale: circleScale },
                  ],
                },
              ]}
              {...panResponderCircle.panHandlers}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsContainer: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
  },
  buttonScrollView: {
    flexDirection: "row",
    alignItems: "center",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold",
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "red",
  },
  button: {
    marginTop: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default App;

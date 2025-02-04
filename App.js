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
const getRandomPosition = () => ({
  x: Math.random() * (SCREEN_WIDTH - 100),
  y: Math.random() * (SCREEN_HEIGHT - 200),
});
const App = () => {
  const [selectedShape, setSelectedShape] = useState("box");
  const [circleVisible, setCircleVisible] = useState(false);
  const [boxActions, setBoxActions] = useState([]);
  const [circleActions, setCircleActions] = useState([]);

  // Animation refs for Box
  const boxPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const boxRotation = useRef(new Animated.Value(0)).current;
  const boxScale = useRef(new Animated.Value(1)).current;

  // Animation refs for Circle
  const circlePan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
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

  const addAction = (action) => {
    if (selectedShape === "box") {
      setBoxActions([...boxActions, action]);
    } else {
      setCircleActions([...circleActions, action]);
    }
  };

  const playActions = () => {
    const playSequence = (actions, setActions) => {
      actions
        .reduce((promise, action) => {
          return promise.then(() => new Promise(action));
        }, Promise.resolve())
        .then(() => setActions([]));
    };

    playSequence(boxActions, setBoxActions);
    playSequence(circleActions, setCircleActions);
  };

  const animateXBy100 = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    Animated.timing(targetPan.x, {
      toValue: targetPan.x._value + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };

  const animateYBy100 = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    Animated.timing(targetPan.y, {
      toValue: targetPan.y._value + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };
  const moveToOrigin = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;

    Animated.timing(targetPan, {
      toValue: { x: 0, y: 0 },
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };
  const moveToRandomPosition = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const randomPos = getRandomPosition();

    Animated.timing(targetPan, {
      toValue: randomPos,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };
  const rotateBox = (degrees, callback) => {
    if (selectedShape === "box") {
      Animated.timing(boxRotation, {
        toValue: boxRotation._value + degrees,
        duration: 500,
        useNativeDriver: true,
      }).start(callback);
    } else {
      callback();
    }
  };

  const changeSize = (increment, callback) => {
    const targetScale = selectedShape === "box" ? boxScale : circleScale;
    Animated.spring(targetScale, {
      toValue: Math.max(0.5, targetScale._value + increment),
      friction: 2,
      tension: 80,
      useNativeDriver: true,
    }).start(callback);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Shape Selection */}
        <View style={styles.nav}>
          <TouchableOpacity
            style={
              selectedShape === "box"
                ? [styles.button, styles.activeButton]
                : styles.button
            }
            onPress={() => setSelectedShape("box")}
          >
            <Text style={styles.buttonText}>Action to Cat</Text>
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
              <Text style={styles.buttonText}>Select Lion</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCircleVisible(true)}
            >
              <Text style={styles.buttonText}>Add Lion</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <ScrollView horizontal style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => animateXBy100(cb))}
            >
              <Text style={styles.buttonText}>Move X by 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => animateYBy100(cb))}
            >
              <Text style={styles.buttonText}>Move Y by 100</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => moveToOrigin(cb))}
            >
              <Text style={styles.buttonText}>Move to Origin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => moveToRandomPosition(cb))}
            >
              <Text style={styles.buttonText}>Move Randomly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => rotateBox(90, cb))}
            >
              <Text style={styles.buttonText}>Rotate 90°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => changeSize(0.1, cb))}
            >
              <Text style={styles.buttonText}>Increase Size</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((cb) => changeSize(-0.1, cb))}
            >
              <Text style={styles.buttonText}>Decrease Size</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Play Actions Button */}
        <TouchableOpacity style={styles.button} onPress={playActions}>
          <Text style={styles.buttonText}>Play Actions</Text>
        </TouchableOpacity>

        {/* Animation Container */}
        <View style={styles.animationContainer}>
          <Animated.Image
            source={require("./assets/cat.png")}
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
            <Animated.Image
              source={require("./assets/lion.jpeg")}
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
  container: { flex: 1 },
  buttonScrollView: { flexDirection: "row", alignItems: "center" },
  nav: { flexDirection: "row", justifyContent: "space-around" },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
  },

  box: { height: 150, width: 150, backgroundColor: "white", borderRadius: 5 },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "red" },
  button: { margin: 10, padding: 10, backgroundColor: "blue", borderRadius: 5 },
  activeButton: { backgroundColor: "green" },
  buttonText: { color: "white", fontWeight: "bold" },
});

export default App;

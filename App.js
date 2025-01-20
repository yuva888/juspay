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
  const [boxActions, setBoxActions] = useState([]);
  const [circleActions, setCircleActions] = useState([]);
  const [boxState, setBoxState] = useState({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
  });
  const [circleState, setCircleState] = useState({ x: 0, y: 0, scale: 1 });

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
        setBoxState((prev) => ({
          ...prev,
          x: prev.x + boxPan.x._value,
          y: prev.y + boxPan.y._value,
        }));
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
        setCircleState((prev) => ({
          ...prev,
          x: prev.x + circlePan.x._value,
          y: prev.y + circlePan.y._value,
        }));
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
    const actions = selectedShape === "box" ? boxActions : circleActions;
    const setState = selectedShape === "box" ? setBoxActions : setCircleActions;
    setState([]);
    actions.reduce((promise, action) => {
      return promise.then(() => {
        return new Promise((resolve) => {
          action(resolve);
        });
      });
    }, Promise.resolve());
  };

  const animateXBy100 = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const currentState = selectedShape === "box" ? boxState : circleState;
    const setState = selectedShape === "box" ? setBoxState : setCircleState;

    Animated.timing(targetPan.x, {
      toValue: currentState.x + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setState((prev) => ({ ...prev, x: prev.x + 100 }));
      callback();
    });
  };

  const animateYBy100 = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const currentState = selectedShape === "box" ? boxState : circleState;
    const setState = selectedShape === "box" ? setBoxState : setCircleState;

    Animated.timing(targetPan.y, {
      toValue: currentState.y + 100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setState((prev) => ({ ...prev, y: prev.y + 100 }));
      callback();
    });
  };

  const rotateBox = (degrees, callback) => {
    if (selectedShape === "box") {
      Animated.timing(boxRotation, {
        toValue: boxState.rotation + degrees,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setBoxState((prev) => ({ ...prev, rotation: prev.rotation + degrees }));
        callback();
      });
    } else {
      callback();
    }
  };

  const changeSize = (increment, callback) => {
    const targetScale = selectedShape === "box" ? boxScale : circleScale;
    const currentState = selectedShape === "box" ? boxState : circleState;
    const setState = selectedShape === "box" ? setBoxState : setCircleState;

    const newScale = Math.max(0.5, currentState.scale + increment);
    Animated.spring(targetScale, {
      toValue: newScale,
      friction: 2,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      setState((prev) => ({ ...prev, scale: newScale }));
      callback();
    });
  };

  const moveToRandomPosition = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const setState = selectedShape === "box" ? setBoxState : setCircleState;

    const randomX = Math.random() * (SCREEN_WIDTH - 150);
    const randomY = Math.random() * (SCREEN_HEIGHT - 150);

    Animated.timing(targetPan, {
      toValue: { x: randomX, y: randomY },
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setState({ x: randomX, y: randomY, scale: 1 });
      callback();
    });
  };

  const moveToOrigin = (callback) => {
    const targetPan = selectedShape === "box" ? boxPan : circlePan;
    const setState = selectedShape === "box" ? setBoxState : setCircleState;

    Animated.timing(targetPan, {
      toValue: { x: 0, y: 0 },
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setState({ x: 0, y: 0, scale: 1 });
      callback();
    });
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
            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => animateXBy100(callback))}
            >
              <Text style={styles.buttonText}>Add Animate X by 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => animateYBy100(callback))}
            >
              <Text style={styles.buttonText}>Add Animate Y by 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => rotateBox(45, callback))}
            >
              <Text style={styles.buttonText}>Add Rotate by 45°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => rotateBox(90, callback))}
            >
              <Text style={styles.buttonText}>Add Rotate by 90°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => changeSize(0.1, callback))}
            >
              <Text style={styles.buttonText}>Add Increase Size</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                addAction((callback) => changeSize(-0.1, callback))
              }
            >
              <Text style={styles.buttonText}>Add Decrease Size</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                addAction((callback) => moveToRandomPosition(callback))
              }
            >
              <Text style={styles.buttonText}>Add Random Position</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => addAction((callback) => moveToOrigin(callback))}
            >
              <Text style={styles.buttonText}>Add Move to Origin</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.button} onPress={playActions}>
          <Text style={styles.buttonText}>Play Actions</Text>
        </TouchableOpacity>
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

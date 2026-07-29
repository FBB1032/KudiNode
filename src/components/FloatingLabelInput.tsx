import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius, spacing } from "../theme/theme";
import { Icon } from "./Icon";

export interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  leadingIcon?: string;
  trailingIcon?: string | React.ReactNode;
  onTrailingIconPress?: () => void;
  prefix?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  voiceActive?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  leadingIcon,
  trailingIcon,
  onTrailingIconPress,
  prefix,
  error,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  voiceActive,
  onFocus,
  onBlur,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  maxLength,
  autoCapitalize,
  editable = true,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(
    new Animated.Value(value || isFocused ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue:
        isFocused || (value !== undefined && value !== null && value.length > 0)
          ? 1
          : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleContainerPress = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const leftOffset = leadingIcon ? 40 : prefix ? 56 : 14;

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 14 : 15, -10],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 11],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.warningOrange : colors.textMuted,
      error
        ? colors.warningOrange
        : isFocused
        ? colors.primaryDeep
        : colors.primaryMid,
    ],
  });

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <TouchableWithoutFeedback onPress={handleContainerPress}>
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            !!error && styles.inputContainerError,
            !editable && styles.inputContainerDisabled,
            multiline && { minHeight: 90, alignItems: "flex-start", paddingTop: 14 },
            inputContainerStyle,
          ]}
        >
          {/* Leading Icon */}
          {leadingIcon ? (
            <View style={[styles.iconBox, multiline && { marginTop: 2 }]}>
              <Icon
                name={leadingIcon}
                size={18}
                color={
                  isFocused
                    ? colors.primaryDeep
                    : error
                    ? colors.warningOrange
                    : colors.textMuted
                }
              />
            </View>
          ) : null}

          {/* Prefix if any */}
          {prefix ? (
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>{prefix}</Text>
            </View>
          ) : null}

          {/* Floating Animated Label */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.labelWrapper,
              {
                left: leftOffset,
                top: labelTop,
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.labelText,
                {
                  fontSize: labelFontSize,
                  color: labelColor,
                },
              ]}
            >
              {label}
            </Animated.Text>
          </Animated.View>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              multiline && styles.textInputMultiline,
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            editable={editable}
            placeholder=""
            placeholderTextColor="transparent"
            {...restProps}
          />

          {/* Voice indicator badge */}
          {voiceActive ? (
            <View style={styles.voiceBadge}>
              <Icon name="mic" size={13} color={colors.primaryMid} />
            </View>
          ) : null}

          {/* Trailing Icon or custom element */}
          {trailingIcon ? (
            typeof trailingIcon === "string" ? (
              <TouchableOpacity
                onPress={onTrailingIconPress}
                disabled={!onTrailingIconPress}
                style={styles.trailingBtn}
                activeOpacity={0.7}
              >
                <Icon
                  name={trailingIcon}
                  size={18}
                  color={isFocused ? colors.primaryDeep : colors.textMuted}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.trailingBtn}>{trailingIcon}</View>
            )
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      {/* Error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: spacing.lg,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 12,
    position: "relative",
  },
  inputContainerFocused: {
    borderColor: colors.primaryDeep,
    backgroundColor: "#FBF9FE",
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: colors.warningOrange,
    backgroundColor: "#FFFBF7",
  },
  inputContainerDisabled: {
    backgroundColor: colors.grayBG,
    borderColor: colors.border,
    opacity: 0.8,
  },
  iconBox: {
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  prefixBox: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginRight: 8,
  },
  prefixText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDeep,
  },
  labelWrapper: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  labelText: {
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: "100%",
    fontWeight: "500",
  },
  textInputMultiline: {
    textAlignVertical: "top",
    paddingTop: 4,
  },
  trailingBtn: {
    padding: 4,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceBadge: {
    backgroundColor: colors.accentLight,
    padding: 4,
    borderRadius: radius.pill,
    marginRight: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: colors.warningOrange,
    fontWeight: "500",
  },
});

import { FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

type Props = {
  disabled?: boolean;
  isFavorite: boolean;
  loading?: boolean;
  onPress: () => void;
};

const favoriteColor = "#D99A00";
const favoriteSurface = "#FFF7D6";
const favoriteBorder = "#F2D17A";

export function RecordFavoriteAction({ disabled = false, isFavorite, loading = false, onPress }: Props) {
  const color = isFavorite ? favoriteColor : colors.primary;

  return (
    <Pressable
      accessibilityLabel={isFavorite ? "Убрать запись из избранного" : "Добавить запись в избранное"}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isFavorite ? styles.buttonActive : null,
        pressed ? styles.buttonPressed : null,
        disabled || loading ? styles.buttonDisabled : null
      ]}
    >
      {loading ? <ActivityIndicator color={color} size="small" /> : <FontAwesome color={color} name={isFavorite ? "star" : "star-o"} size={20} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  buttonActive: {
    borderColor: favoriteBorder,
    backgroundColor: favoriteSurface
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }]
  },
  buttonDisabled: {
    opacity: 0.6
  }
});

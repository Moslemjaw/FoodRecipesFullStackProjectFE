import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors, Layout } from '@/constants/LiqmahTheme';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 24,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handlePress = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => handlePress(value)}
          disabled={readonly}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Star
            size={size}
            color={
              value <= displayRating
                ? Colors.primary.saffron
                : Colors.base.border.strong
            }
            fill={value <= displayRating ? Colors.primary.saffron : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
});


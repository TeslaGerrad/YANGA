import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRideStore } from '@/store/useRideStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RatingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { rideHistory, completeRide } = useRideStore();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const lastRide = rideHistory[rideHistory.length - 1];

  const RATING_CATEGORIES = [
    { id: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
    { id: 'punctuality', label: 'On Time', icon: 'time' },
    { id: 'driving', label: 'Safe Driving', icon: 'shield-checkmark' },
    { id: 'professionalism', label: 'Professional', icon: 'briefcase' },
  ];

  const ISSUES = [
    'Rude behavior',
    'Poor driving',
    'Vehicle was dirty',
    'Took wrong route',
    'Late arrival',
    'Other',
  ];

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev =>
      prev.includes(issue)
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      completeRide();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Rating submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    completeRide();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.placeholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Rate Your Trip
        </Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.card }]}>
            <Ionicons name="person" size={48} color={colors.text} />
          </View>
          <Text style={[styles.driverName, { color: colors.text }]}>
            John Smith
          </Text>
          <Text style={[styles.tripInfo, { color: colors.textSecondary }]}>
            {lastRide?.vehicleType.name || 'Standard'} • ABC 1234
          </Text>
        </View>

        {/* Rating Stars */}
        <Card style={styles.ratingCard}>
          <Text style={[styles.ratingTitle, { color: colors.text }]}>
            How was your ride?
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#FFD700' : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {rating === 5 ? 'Excellent!' :
               rating === 4 ? 'Good!' :
               rating === 3 ? 'Average' :
               rating === 2 ? 'Below Average' :
               'Poor'}
            </Text>
          )}
        </Card>

        {/* Rating Categories (for high ratings) */}
        {rating >= 4 && (
          <Card style={styles.categoriesCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What did you like?
            </Text>
            <View style={styles.categoriesGrid}>
              {RATING_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { borderColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={colors.text}
                  />
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Issues (for low ratings) */}
        {rating > 0 && rating < 4 && (
          <Card style={styles.issuesCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What went wrong?
            </Text>
            <View style={styles.issuesContainer}>
              {ISSUES.map((issue) => (
                <TouchableOpacity
                  key={issue}
                  style={[
                    styles.issueChip,
                    {
                      backgroundColor: selectedIssues.includes(issue)
                        ? colors.primary
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleIssue(issue)}
                >
                  <Text
                    style={[
                      styles.issueText,
                      {
                        color: selectedIssues.includes(issue)
                          ? colors.secondary
                          : colors.text,
                      },
                    ]}
                  >
                    {issue}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Feedback */}
        {rating > 0 && (
          <Card style={styles.feedbackCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Additional Comments (Optional)
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Share your experience..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>
        )}

        {/* Fare Summary */}
        <Card style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
              Trip Fare
            </Text>
            <Text style={[styles.fareAmount, { color: colors.text }]}>
              ${lastRide?.fare.toFixed(2) || '0.00'}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      {rating > 0 && (
        <View style={[styles.bottomAction, { backgroundColor: colors.background }]}>
          <Button
            title="Submit Rating"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  skipText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  driverAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripInfo: {
    fontSize: 14,
  },
  ratingCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    marginTop: 16,
  },
  categoriesCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  issuesCard: {
    padding: 20,
    marginBottom: 16,
  },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  issueText: {
    fontSize: 14,
  },
  feedbackCard: {
    padding: 20,
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  fareCard: {
    padding: 20,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 16,
  },
  fareAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
  },
  submitButton: {
    width: '100%',
  },
});

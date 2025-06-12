const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Route to get user profile
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userProfile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
      include: {
        users: {
          include: {
            user_food_preferences: {
              include: {
                food_preferences: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Format food preferences for the response
    const formattedProfile = {
      ...userProfile,
      food_preferences: userProfile.users.user_food_preferences.map(ufp => ufp.food_preferences.name),
      // Remove the intermediate user_food_preferences object
      users: { ...userProfile.users, user_food_preferences: undefined },
    };

    res.status(200).json(formattedProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to update user profile
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { date_of_birth, gender, height_cm, weight_kg, food_preferences, lifestyle } = req.body;

  try {
    // Update user_profiles table
    const updatedProfile = await prisma.user_profiles.update({
      where: { user_id: userId },
      data: {
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        gender: gender || undefined,
        height_cm: height_cm !== undefined ? parseFloat(height_cm) : undefined,
        weight_kg: weight_kg !== undefined ? parseFloat(weight_kg) : undefined,
        lifestyle: lifestyle || undefined,
      },
    });

    // Handle food preferences (many-to-many relationship)
    if (food_preferences && Array.isArray(food_preferences)) {
      // First, clear existing preferences for the user
      await prisma.user_food_preferences.deleteMany({
        where: { user_id: userId },
      });

      // Then, add new preferences
      const foodPreferenceConnects = [];
      for (const prefName of food_preferences) {
        let foodPref = await prisma.food_preferences.findUnique({
          where: { name: prefName },
        });

        if (!foodPref) {
          // Create the food preference if it doesn't exist
          foodPref = await prisma.food_preferences.create({
            data: { name: prefName },
          });
        }
        foodPreferenceConnects.push({
          user_id: userId,
          preference_id: foodPref.preference_id,
        });
      }
      await prisma.user_food_preferences.createMany({
        data: foodPreferenceConnects,
        skipDuplicates: true, // Skip if a user-preference pair already exists
      });
    }

    res.status(200).json({ message: 'User profile updated successfully.', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
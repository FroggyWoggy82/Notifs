/**
 * User Pattern Analysis Service
 * Analyzes user communication patterns and preferences to improve AI responses
 */

const JournalModel = require('../models/journalModel');

class UserPatternAnalysisService {
    /**
     * Analyze user patterns from recent journal entries and conversations
     * @param {Array} recentConversation - Recent conversation history
     * @param {number} lookbackDays - Number of days to look back for pattern analysis
     * @returns {Promise<string>} Pattern analysis summary
     */
    static async analyzeUserPatterns(recentConversation = [], lookbackDays = 30) {
        try {
            // Get recent journal entries for pattern analysis
            const recentEntries = await this.getRecentJournalEntries(lookbackDays);
            
            // Analyze communication patterns
            const communicationPatterns = this.analyzeCommunicationStyle(recentConversation, recentEntries);
            
            // Analyze emotional patterns
            const emotionalPatterns = this.analyzeEmotionalPatterns(recentEntries);
            
            // Analyze topic preferences
            const topicPatterns = this.analyzeTopicPreferences(recentEntries);
            
            // Analyze response preferences
            const responsePatterns = this.analyzeResponsePreferences(recentConversation);
            
            // Compile pattern analysis
            return this.compilePatternAnalysis({
                communication: communicationPatterns,
                emotional: emotionalPatterns,
                topics: topicPatterns,
                responses: responsePatterns
            });
            
        } catch (error) {
            console.error('Error analyzing user patterns:', error);
            return '';
        }
    }
    
    /**
     * Get recent journal entries for analysis
     * @param {number} days - Number of days to look back
     * @returns {Promise<Array>} Recent journal entries
     */
    static async getRecentJournalEntries(days) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            // Get entries from the database
            const entries = await JournalModel.getEntriesSince(cutoffDate);
            return entries || [];
        } catch (error) {
            console.error('Error getting recent journal entries:', error);
            return [];
        }
    }
    
    /**
     * Analyze communication style patterns
     * @param {Array} conversation - Recent conversation
     * @param {Array} entries - Recent journal entries
     * @returns {Object} Communication pattern analysis
     */
    static analyzeCommunicationStyle(conversation, entries) {
        const patterns = {
            averageMessageLength: 0,
            prefersBrevity: false,
            usesEmotionalLanguage: false,
            asksManyQuestions: false,
            sharesPersonalDetails: false,
            timeOfDayPreferences: {},
            responseToQuestions: 'mixed'
        };
        
        // Analyze conversation messages
        const userMessages = conversation.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
            const totalLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0);
            patterns.averageMessageLength = Math.round(totalLength / userMessages.length);
            patterns.prefersBrevity = patterns.averageMessageLength < 100;
        }
        
        // Analyze journal entries for communication style
        if (entries.length > 0) {
            const totalEntryLength = entries.reduce((sum, entry) => sum + (entry.content || '').length, 0);
            const avgEntryLength = totalEntryLength / entries.length;
            
            // Check for emotional language patterns
            const emotionalWords = ['feel', 'felt', 'emotion', 'angry', 'sad', 'happy', 'excited', 'anxious', 'frustrated', 'love', 'hate'];
            const emotionalCount = entries.reduce((count, entry) => {
                const content = (entry.content || '').toLowerCase();
                return count + emotionalWords.filter(word => content.includes(word)).length;
            }, 0);
            patterns.usesEmotionalLanguage = emotionalCount > entries.length * 2; // More than 2 emotional words per entry on average
            
            // Check for personal detail sharing
            const personalIndicators = ['i ', 'my ', 'me ', 'myself', 'i\'m', 'i\'ve', 'i\'ll'];
            const personalCount = entries.reduce((count, entry) => {
                const content = (entry.content || '').toLowerCase();
                return count + personalIndicators.filter(indicator => content.includes(indicator)).length;
            }, 0);
            patterns.sharesPersonalDetails = personalCount > entries.length * 5; // More than 5 personal references per entry
        }
        
        return patterns;
    }
    
    /**
     * Analyze emotional patterns
     * @param {Array} entries - Recent journal entries
     * @returns {Object} Emotional pattern analysis
     */
    static analyzeEmotionalPatterns(entries) {
        const patterns = {
            dominantMoods: [],
            emotionalVolatility: 'stable',
            stressIndicators: [],
            positivityTrend: 'neutral'
        };
        
        if (entries.length === 0) return patterns;
        
        // Analyze mood distribution
        const moodCounts = {};
        entries.forEach(entry => {
            if (entry.mood) {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }
        });
        
        // Get dominant moods
        patterns.dominantMoods = Object.entries(moodCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([mood]) => mood);
        
        // Analyze stress indicators
        const stressWords = ['stress', 'overwhelm', 'pressure', 'deadline', 'worry', 'panic', 'exhausted'];
        const stressCount = entries.reduce((count, entry) => {
            const content = (entry.content || '').toLowerCase();
            return count + stressWords.filter(word => content.includes(word)).length;
        }, 0);
        
        if (stressCount > entries.length * 0.5) {
            patterns.stressIndicators = ['high_stress_language', 'frequent_overwhelm'];
        }
        
        return patterns;
    }
    
    /**
     * Analyze topic preferences
     * @param {Array} entries - Recent journal entries
     * @returns {Object} Topic preference analysis
     */
    static analyzeTopicPreferences(entries) {
        const patterns = {
            frequentTopics: [],
            avoidedTopics: [],
            preferredDepth: 'moderate'
        };
        
        if (entries.length === 0) return patterns;
        
        // Common topic categories
        const topicKeywords = {
            relationships: ['relationship', 'friend', 'family', 'partner', 'love', 'dating'],
            work: ['work', 'job', 'career', 'boss', 'colleague', 'project'],
            health: ['health', 'exercise', 'diet', 'sleep', 'tired', 'energy'],
            goals: ['goal', 'plan', 'future', 'dream', 'ambition', 'achieve'],
            emotions: ['feel', 'emotion', 'mood', 'mental', 'therapy', 'anxiety'],
            hobbies: ['hobby', 'fun', 'game', 'music', 'book', 'movie']
        };
        
        const topicCounts = {};
        Object.keys(topicKeywords).forEach(topic => {
            topicCounts[topic] = 0;
        });
        
        entries.forEach(entry => {
            const content = (entry.content || '').toLowerCase();
            Object.entries(topicKeywords).forEach(([topic, keywords]) => {
                const matches = keywords.filter(keyword => content.includes(keyword)).length;
                topicCounts[topic] += matches;
            });
        });
        
        // Get most frequent topics
        patterns.frequentTopics = Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .filter(([,count]) => count > 0)
            .map(([topic]) => topic);
        
        return patterns;
    }
    
    /**
     * Analyze response preferences from conversation history
     * @param {Array} conversation - Recent conversation
     * @returns {Object} Response preference analysis
     */
    static analyzeResponsePreferences(conversation) {
        const patterns = {
            prefersQuestions: false,
            prefersAdvice: false,
            prefersValidation: false,
            respondsToLength: 'mixed'
        };
        
        // This would ideally analyze user engagement with different types of AI responses
        // For now, return basic patterns
        return patterns;
    }
    
    /**
     * Compile pattern analysis into a readable summary
     * @param {Object} patterns - All analyzed patterns
     * @returns {string} Compiled pattern analysis
     */
    static compilePatternAnalysis(patterns) {
        const analysis = [];
        
        // Communication style
        if (patterns.communication.prefersBrevity) {
            analysis.push("Kevin prefers brief, concise responses and tends to write shorter messages.");
        }
        
        if (patterns.communication.usesEmotionalLanguage) {
            analysis.push("Kevin frequently uses emotional language and is comfortable expressing feelings.");
        }
        
        if (patterns.communication.sharesPersonalDetails) {
            analysis.push("Kevin is open about sharing personal details and experiences.");
        }
        
        // Emotional patterns
        if (patterns.emotional.dominantMoods.length > 0) {
            analysis.push(`Kevin's recent dominant moods: ${patterns.emotional.dominantMoods.join(', ')}.`);
        }
        
        if (patterns.emotional.stressIndicators.length > 0) {
            analysis.push("Kevin has been showing signs of stress and overwhelm recently.");
        }
        
        // Topic preferences
        if (patterns.topics.frequentTopics.length > 0) {
            analysis.push(`Kevin frequently discusses: ${patterns.topics.frequentTopics.join(', ')}.`);
        }
        
        // Default if no patterns found
        if (analysis.length === 0) {
            analysis.push("Building understanding of Kevin's communication patterns and preferences.");
        }
        
        return analysis.join(' ');
    }
}

module.exports = UserPatternAnalysisService;

const PersonModel = require('../models/personModel');
const aiService = require('./aiService');

class PersonAnalysisService {
    /**
     * Extract people mentioned in a journal entry and analyze the relationships
     * @param {string} content - Journal entry content
     * @param {number} journalEntryId - Journal entry ID
     * @returns {Promise<Array>} Array of extracted people with analysis
     */
    static async extractAndAnalyzePeople(content, journalEntryId) {
        try {
            // Use AI to extract people and analyze relationships
            const extractionResult = await this.extractPeopleFromText(content);
            
            const processedPeople = [];

            for (const extraction of extractionResult.people) {
                // Find or create person in database
                const person = await PersonModel.findOrCreatePerson(
                    extraction.name, 
                    extraction.relationshipType
                );

                // Add mention to database
                const mention = await PersonModel.addMention(
                    person.id,
                    journalEntryId,
                    extraction.context,
                    extraction.sentiment,
                    extraction.emotionTags,
                    extraction.conversationTopic
                );

                // Update overall sentiment
                await PersonModel.updateOverallSentiment(person.id);

                processedPeople.push({
                    person,
                    mention,
                    extraction
                });
            }

            return processedPeople;
        } catch (error) {
            console.error('Error extracting and analyzing people:', error);
            throw error;
        }
    }

    /**
     * Use AI to extract people from journal text
     * @param {string} text - Journal entry text
     * @returns {Promise<Object>} Extraction result with people array
     */
    static async extractPeopleFromText(text) {
        const systemPrompt = `You are an expert at analyzing personal journal entries to identify people mentioned and the writer's feelings toward them.

Extract all people mentioned in the journal entry. For each person, provide:
1. Their name (or relationship if no name given, like "my mom", "my boss")
2. The relationship type (friend, family, colleague, romantic, acquaintance, etc.)
3. The context where they were mentioned (the sentence or paragraph)
4. The sentiment toward them in this mention (positive, negative, neutral)
5. Emotion tags that describe the writer's feelings (frustrated, grateful, excited, disappointed, etc.)
6. What they talked about or the topic of interaction (if mentioned)

Return your response as a JSON object with this structure:
{
  "people": [
    {
      "name": "Sarah",
      "relationshipType": "friend",
      "context": "Sarah called me today and we talked for hours about her new job",
      "sentiment": "positive",
      "emotionTags": ["grateful", "connected", "supportive"],
      "conversationTopic": "career discussion"
    }
  ]
}

Be thorough but only include people who are actually mentioned. Don't invent people who aren't there.`;

        const userMessage = `Analyze this journal entry for people mentioned: "${text}"`;

        try {
            const response = await aiService.queryOpenAI(systemPrompt, userMessage);
            
            // Try to parse JSON response
            let result;
            try {
                result = JSON.parse(response);
            } catch (parseError) {
                // If JSON parsing fails, try to extract JSON from the response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    result = JSON.parse(jsonMatch[0]);
                } else {
                    console.warn('Could not parse AI response as JSON:', response);
                    return { people: [] };
                }
            }

            return result;
        } catch (error) {
            console.error('Error extracting people from text:', error);
            return { people: [] };
        }
    }

    /**
     * Generate comprehensive relationship analysis for a specific person
     * @param {number} personId - Person ID
     * @returns {Promise<Object>} Comprehensive relationship analysis
     */
    static async generatePersonAnalysis(personId) {
        try {
            // Get all person details
            const personDetails = await PersonModel.getPersonDetails(personId);
            
            if (!personDetails.person) {
                throw new Error('Person not found');
            }

            // Prepare context for AI analysis
            const mentionContexts = personDetails.mentions.map(mention => ({
                date: mention.entry_date,
                context: mention.mention_context,
                sentiment: mention.sentiment,
                emotions: mention.emotion_tags,
                topic: mention.conversation_topic
            }));

            const systemPrompt = `You are a perceptive AI therapist analyzing someone's relationship with a specific person based on their journal entries. 

Provide a comprehensive, introspective analysis of their relationship with ${personDetails.person.name}. Be direct and honest, focusing on:

1. **Overall Relationship Dynamic**: What kind of relationship this is and how it functions
2. **Emotional Patterns**: How the person typically feels before, during, and after interactions
3. **Growth and Changes**: How the relationship has evolved over time
4. **Strengths**: What this person brings to their life
5. **Challenges**: Areas of tension, frustration, or concern
6. **Insights**: Patterns they might not have noticed about themselves in this relationship
7. **Recommendations**: Actionable suggestions for improving or managing the relationship

Be introspective and help them understand their own feelings and behaviors in this relationship. Use specific examples from their journal entries when relevant.

Format your response in clear sections with headers.`;

            const userMessage = `Analyze my relationship with ${personDetails.person.name} based on these journal mentions:

${mentionContexts.map((mention, index) => 
                `Entry ${index + 1} (${mention.date}):
Context: "${mention.context}"
My feelings: ${mention.sentiment} - ${mention.emotions?.join(', ') || 'no specific emotions noted'}
Topic: ${mention.topic || 'general interaction'}
`
            ).join('\n')}

Total mentions: ${personDetails.mentions.length}
Relationship type: ${personDetails.person.relationship_type || 'unspecified'}
Overall sentiment pattern: ${personDetails.person.overall_sentiment || 'neutral'}`;

            const analysis = await aiService.queryOpenAI(systemPrompt, userMessage);

            // Generate insights for storage
            const insights = await this.generateRelationshipInsights(personDetails);
            
            // Save insights to database
            if (insights.length > 0) {
                await PersonModel.saveInsights(personId, insights);
            }

            return {
                person: personDetails.person,
                analysis: analysis,
                mentionCount: personDetails.mentions.length,
                recentMentions: personDetails.mentions.slice(0, 5), // Last 5 mentions
                insights: insights
            };
        } catch (error) {
            console.error('Error generating person analysis:', error);
            throw error;
        }
    }

    /**
     * Generate structured insights about a relationship
     * @param {Object} personDetails - Person details with mentions
     * @returns {Promise<Array>} Array of insight objects
     */
    static async generateRelationshipInsights(personDetails) {
        try {
            const insights = [];
            const mentions = personDetails.mentions;

            if (mentions.length === 0) return insights;

            // Pattern analysis
            const sentiments = mentions.map(m => m.sentiment);
            const positiveCount = sentiments.filter(s => s === 'positive').length;
            const negativeCount = sentiments.filter(s => s === 'negative').length;

            if (positiveCount > negativeCount * 2) {
                insights.push({
                    text: `You consistently express positive feelings about ${personDetails.person.name}, suggesting a supportive and valued relationship.`,
                    category: 'strength',
                    confidence: 0.8
                });
            } else if (negativeCount > positiveCount * 2) {
                insights.push({
                    text: `Your mentions of ${personDetails.person.name} often carry negative sentiment, which may indicate unresolved issues or incompatibility.`,
                    category: 'concern',
                    confidence: 0.8
                });
            } else if (positiveCount > 0 && negativeCount > 0) {
                insights.push({
                    text: `Your relationship with ${personDetails.person.name} shows mixed emotions, suggesting complexity that might benefit from deeper reflection.`,
                    category: 'pattern',
                    confidence: 0.7
                });
            }

            // Frequency analysis
            if (mentions.length >= 5) {
                const recentMentions = mentions.slice(0, 3);
                const olderMentions = mentions.slice(3);
                
                const recentPositive = recentMentions.filter(m => m.sentiment === 'positive').length;
                const olderPositive = olderMentions.filter(m => m.sentiment === 'positive').length;
                
                if (recentPositive > olderPositive) {
                    insights.push({
                        text: `Your relationship with ${personDetails.person.name} appears to be improving over time.`,
                        category: 'growth',
                        confidence: 0.6
                    });
                } else if (olderPositive > recentPositive) {
                    insights.push({
                        text: `There may be growing tension or distance in your relationship with ${personDetails.person.name}.`,
                        category: 'concern',
                        confidence: 0.6
                    });
                }
            }

            return insights;
        } catch (error) {
            console.error('Error generating relationship insights:', error);
            return [];
        }
    }

    /**
     * Get all people with basic stats for overview
     * @returns {Promise<Array>} Array of people with stats
     */
    static async getPeopleOverview() {
        try {
            return await PersonModel.getAllPeople();
        } catch (error) {
            console.error('Error getting people overview:', error);
            throw error;
        }
    }
}

module.exports = PersonAnalysisService;

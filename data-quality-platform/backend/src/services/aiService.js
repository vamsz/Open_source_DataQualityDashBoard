const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service with dual-provider support
 * Priority: OpenRouter (GLM-4.5-Air Free) → Ollama (local fallback)
 */

// OpenRouter Configuration (Primary)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free';

// Ollama Configuration (Fallback)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b';

class AIService {
  constructor() {
    this.openrouterUrl = OPENROUTER_API_URL;
    this.openrouterKey = OPENROUTER_API_KEY;
    this.openrouterModel = OPENROUTER_MODEL;
    
    this.ollamaUrl = OLLAMA_API_URL;
    this.ollamaModel = OLLAMA_MODEL;
    
    // Track which provider is currently working
    this.primaryAvailable = !!OPENROUTER_API_KEY;
    
    if (this.primaryAvailable) {
      logger.info(`✓ AI Service: OpenRouter (${this.openrouterModel}) with Ollama fallback`);
    } else {
      logger.info(`⚠ AI Service: Ollama only (${this.ollamaModel}) - No OpenRouter API key`);
    }
  }

  /**
   * Generate completion with automatic fallback
   * Tries OpenRouter first, falls back to Ollama if it fails
   */
  async generateCompletion(prompt, options = {}) {
    // Try OpenRouter first if API key is configured
    if (this.primaryAvailable) {
      const openrouterResult = await this.tryOpenRouter(prompt, options);
      if (openrouterResult.success) {
        return openrouterResult;
      }
      logger.warn('OpenRouter failed, falling back to Ollama...');
    }
    
    // Fallback to Ollama
    const ollamaResult = await this.tryOllama(prompt, options);
    if (ollamaResult.success) {
      return ollamaResult;
    }
    
    // Both failed - return error but allow processing to continue
    logger.error('Both OpenRouter and Ollama failed');
    return {
      success: false,
      error: 'AI services unavailable',
      fallback: true
    };
  }

  /**
   * Try OpenRouter API
   */
  async tryOpenRouter(prompt, options = {}) {
    try {
      const response = await axios.post(
        this.openrouterUrl,
        {
          model: options.model || this.openrouterModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'Data Quality Platform'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      // Extract text from response
      let text = '';
      if (response.data?.choices?.[0]?.message?.content) {
        text = response.data.choices[0].message.content;
      }

      if (!text) {
        throw new Error('Empty response from OpenRouter');
      }

      return {
        success: true,
        text: text,
        model: this.openrouterModel,
        provider: 'OpenRouter'
      };
    } catch (error) {
      logger.error('OpenRouter error:', error.response?.data?.error || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Try Ollama API (fallback)
   */
  async tryOllama(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: options.model || this.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            num_predict: options.max_tokens || 500
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      return {
        success: true,
        text: response.data.response,
        model: this.ollamaModel,
        provider: 'Ollama'
      };
    } catch (error) {
      logger.error('Ollama error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Task 1: Generate synthetic data for testing
   */
  async generateSyntheticData(schema, count = 10) {
    const prompt = `Generate ${count} realistic sample records for a database table with the following schema:
${JSON.stringify(schema, null, 2)}

Return ONLY a valid JSON array of objects. Each object should have realistic values that match the column types and constraints. No additional text or explanation.`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 1000 });
      
      if (result.success) {
        // Extract JSON from response
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return { success: true, data };
        }
      }
      
      return { success: false, error: 'Failed to parse synthetic data' };
    } catch (error) {
      logger.error('Synthetic data generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Task 2: Entity resolution/record linkage
   */
  async entityResolution(records, matchFields) {
    const prompt = `Analyze the following records and identify which ones represent the same entity (duplicates or near-duplicates).
Consider these fields for matching: ${matchFields.join(', ')}

Records:
${JSON.stringify(records, null, 2)}

Return a JSON object with this format:
{
  "duplicateGroups": [
    {
      "masterRecordIndex": 0,
      "duplicateIndexes": [2, 5],
      "confidence": 0.95,
      "reason": "Same name and email with minor variations"
    }
  ]
}`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 1000 });
      
      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const resolution = JSON.parse(jsonMatch[0]);
          return { success: true, resolution };
        }
      }
      
      return { success: false, error: 'Failed to parse entity resolution' };
    } catch (error) {
      logger.error('Entity resolution error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Task 3: Missing value imputation
   */
  async imputeMissingValues(data, columnName, columnType, context = {}) {
    const prompt = `Given the following data with missing values in column "${columnName}" (type: ${columnType}), suggest appropriate imputation values.

Context: ${JSON.stringify(context)}
Data sample:
${JSON.stringify(data.slice(0, 10), null, 2)}

Return a JSON object with this format:
{
  "method": "mean|median|mode|pattern|ml",
  "imputedValues": [/* array of values to fill missing entries */],
  "confidence": 0.85,
  "reasoning": "Explanation of the imputation strategy"
}`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 800 });
      
      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const imputation = JSON.parse(jsonMatch[0]);
          return { success: true, imputation };
        }
      }
      
      return { success: false, error: 'Failed to parse imputation suggestion' };
    } catch (error) {
      logger.error('Imputation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Task 4: Text/format standardization
   */
  async standardizeFormat(values, fieldType) {
    const prompt = `Standardize the following ${fieldType} values to a consistent format.

Values:
${JSON.stringify(values, null, 2)}

For ${fieldType}, return a JSON object with this format:
{
  "standardized": [/* array of standardized values in same order */],
  "format": "The standardization format used",
  "changes": [/* array of {index, original, standardized, reason} for changed values */]
}`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 1000 });
      
      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const standardization = JSON.parse(jsonMatch[0]);
          return { success: true, standardization };
        }
      }
      
      return { success: false, error: 'Failed to parse standardization' };
    } catch (error) {
      logger.error('Standardization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Task 5: Outlier/exceptions detection
   */
  async detectOutliers(data, columnName, statistics) {
    const prompt = `Analyze the following data for outliers in column "${columnName}".

Statistics:
${JSON.stringify(statistics, null, 2)}

Data sample:
${JSON.stringify(data.slice(0, 20), null, 2)}

Identify outliers and return a JSON object with this format:
{
  "outliers": [
    {
      "index": 5,
      "value": "anomalous value",
      "score": 0.95,
      "reason": "Why this is considered an outlier"
    }
  ],
  "method": "statistical|pattern|domain-knowledge",
  "threshold": "Threshold used for detection"
}`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 1000 });
      
      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const outlierAnalysis = JSON.parse(jsonMatch[0]);
          return { success: true, outlierAnalysis };
        }
      }
      
      return { success: false, error: 'Failed to parse outlier analysis' };
    } catch (error) {
      logger.error('Outlier detection error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate remediation suggestions for data quality issues
   */
  async generateRemediationSuggestions(issue, context) {
    const prompt = `Given the following data quality issue, suggest specific remediation actions:

Issue Type: ${issue.issue_type}
Severity: ${issue.severity}
Description: ${issue.description}
Affected Records: ${issue.record_count}

Context:
${JSON.stringify(context, null, 2)}

Return a JSON object with this format:
{
  "actions": [
    {
      "type": "automated|manual|review",
      "description": "What to do",
      "effort": "low|medium|high",
      "impact": "Assessment of fix impact",
      "steps": ["Step 1", "Step 2"]
    }
  ],
  "priority": "critical|high|medium|low",
  "estimatedResolutionTime": "2 hours"
}`;

    try {
      const result = await this.generateCompletion(prompt, { max_tokens: 800 });
      
      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          return { success: true, suggestions };
        }
      }
      
      return { success: false, error: 'Failed to parse suggestions' };
    } catch (error) {
      logger.error('Suggestion generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate AI service health (checks both providers)
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      providers: {}
    };

    // Check OpenRouter
    if (this.primaryAvailable) {
      try {
        const response = await axios.post(
          this.openrouterUrl,
          {
            model: this.openrouterModel,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openrouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
              'X-Title': 'Data Quality Platform'
            },
            timeout: 10000
          }
        );
        
        health.providers.openrouter = {
          status: 'healthy',
          model: this.openrouterModel,
          available: true,
          primary: true
        };
        health.primaryProvider = 'OpenRouter';
      } catch (error) {
        health.providers.openrouter = {
          status: 'unhealthy',
          error: error.response?.data?.error?.message || error.message,
          available: false
        };
        logger.warn('OpenRouter health check failed:', error.message);
      }
    } else {
      health.providers.openrouter = {
        status: 'not_configured',
        message: 'No API key provided'
      };
    }

    // Check Ollama
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000
      });
      
      const hasModel = response.data.models?.some(m => m.name.includes(this.ollamaModel.split(':')[0]));
      
      health.providers.ollama = {
        status: hasModel ? 'healthy' : 'model_missing',
        model: this.ollamaModel,
        available: hasModel,
        fallback: true,
        installedModels: response.data.models?.map(m => m.name) || []
      };
      
      if (!health.primaryProvider) {
        health.primaryProvider = 'Ollama';
      }
    } catch (error) {
      health.providers.ollama = {
        status: 'unhealthy',
        error: error.message,
        available: false,
        suggestion: 'Make sure Ollama is running (ollama serve) and model is installed (ollama pull gemma3:1b)'
      };
      logger.warn('Ollama health check failed:', error.message);
    }

    // Determine overall status
    const openrouterOk = health.providers.openrouter?.available === true;
    const ollamaOk = health.providers.ollama?.available === true;
    
    if (!openrouterOk && !ollamaOk) {
      health.status = 'unhealthy';
      health.message = 'No AI providers available';
    } else if (openrouterOk) {
      health.status = 'healthy';
      health.message = 'OpenRouter available (primary)';
    } else if (ollamaOk) {
      health.status = 'degraded';
      health.message = 'Ollama available (fallback only)';
    }

    return health;
  }
}

module.exports = new AIService();



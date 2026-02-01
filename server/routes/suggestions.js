import express from 'express';
import { getSharedDir } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/research-suggestions - Get all research suggestions
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const sharedDir = getSharedDir();
    const suggestionsPath = path.join(sharedDir, 'research-suggestions.json');
    
    let data = { suggestions: [] };
    if (await fs.pathExists(suggestionsPath)) {
      data = await fs.readJson(suggestionsPath);
    }
    
    let filtered = data.suggestions || [];
    
    // Apply status filter
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    
    // Sort by votes (descending) then by date
    filtered.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return new Date(b.suggestedAt) - new Date(a.suggestedAt);
    });
    
    res.json({ suggestions: filtered, totalCount: filtered.length });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// POST /api/research-suggestions - Create new suggestion
router.post('/', async (req, res) => {
  try {
    const sharedDir = getSharedDir();
    const suggestionsPath = path.join(sharedDir, 'research-suggestions.json');
    
    // Read existing suggestions or create new structure
    let data = { suggestions: [] };
    if (await fs.pathExists(suggestionsPath)) {
      data = await fs.readJson(suggestionsPath);
    }
    
    const newSuggestion = {
      id: uuidv4(),
      ...req.body,
      suggestedAt: new Date().toISOString(),
      votes: 0,
      voters: [],
      status: 'proposed',
      comments: []
    };
    
    data.suggestions.push(newSuggestion);
    
    await fs.ensureDir(path.dirname(suggestionsPath));
    await fs.writeJson(suggestionsPath, data, { spaces: 2 });
    
    res.json({ success: true, suggestion: newSuggestion });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

// PUT /api/research-suggestions/:id/vote - Vote on a suggestion
router.put('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const sharedDir = getSharedDir();
    const suggestionsPath = path.join(sharedDir, 'research-suggestions.json');
    
    if (!await fs.pathExists(suggestionsPath)) {
      return res.status(404).json({ error: 'Suggestions not found' });
    }
    
    const data = await fs.readJson(suggestionsPath);
    const suggestionIndex = data.suggestions.findIndex(s => s.id === id);
    
    if (suggestionIndex === -1) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const suggestion = data.suggestions[suggestionIndex];
    
    if (!suggestion.voters) {
      suggestion.voters = [];
    }
    
    // Toggle vote
    const voterIndex = suggestion.voters.indexOf(userId);
    if (voterIndex >= 0) {
      // Remove vote
      suggestion.voters.splice(voterIndex, 1);
      suggestion.votes = Math.max(0, (suggestion.votes || 0) - 1);
    } else {
      // Add vote
      suggestion.voters.push(userId);
      suggestion.votes = (suggestion.votes || 0) + 1;
    }
    
    await fs.writeJson(suggestionsPath, data, { spaces: 2 });
    
    res.json({ 
      success: true, 
      votes: suggestion.votes,
      hasVoted: voterIndex < 0
    });
  } catch (error) {
    console.error('Error voting on suggestion:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// PUT /api/research-suggestions/:id/status - Update suggestion status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    const validStatuses = ['proposed', 'planned', 'in_progress', 'completed', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const sharedDir = getSharedDir();
    const suggestionsPath = path.join(sharedDir, 'research-suggestions.json');
    
    if (!await fs.pathExists(suggestionsPath)) {
      return res.status(404).json({ error: 'Suggestions not found' });
    }
    
    const data = await fs.readJson(suggestionsPath);
    const suggestionIndex = data.suggestions.findIndex(s => s.id === id);
    
    if (suggestionIndex === -1) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    data.suggestions[suggestionIndex].status = status;
    if (assignedTo !== undefined) {
      data.suggestions[suggestionIndex].assignedTo = assignedTo;
    }
    data.suggestions[suggestionIndex].updatedAt = new Date().toISOString();
    
    await fs.writeJson(suggestionsPath, data, { spaces: 2 });
    
    res.json({ success: true, suggestion: data.suggestions[suggestionIndex] });
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/research-suggestions/:id/comment - Add comment to suggestion
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;
    
    if (!author || !content) {
      return res.status(400).json({ error: 'author and content are required' });
    }
    
    const sharedDir = getSharedDir();
    const suggestionsPath = path.join(sharedDir, 'research-suggestions.json');
    
    if (!await fs.pathExists(suggestionsPath)) {
      return res.status(404).json({ error: 'Suggestions not found' });
    }
    
    const data = await fs.readJson(suggestionsPath);
    const suggestionIndex = data.suggestions.findIndex(s => s.id === id);
    
    if (suggestionIndex === -1) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    const comment = {
      id: uuidv4(),
      author,
      content,
      createdAt: new Date().toISOString()
    };
    
    if (!data.suggestions[suggestionIndex].comments) {
      data.suggestions[suggestionIndex].comments = [];
    }
    
    data.suggestions[suggestionIndex].comments.push(comment);
    
    await fs.writeJson(suggestionsPath, data, { spaces: 2 });
    
    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;


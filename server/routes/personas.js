import express from 'express';
import { getSharedDir, readSharedPersonas, writeSharedPersonas } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/personas - Get all personas
router.get('/', async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const personasData = await readSharedPersonas();
    
    // Enrich personas with organization and archived status from their source projects
    if (personasData.personas && Array.isArray(personasData.personas)) {
      const enrichedPersonas = await Promise.all(
        personasData.personas.map(async (persona) => {
          // Try to find organization and archived status from studyId if available
          if (persona.studyId) {
            try {
              const projectDir = getProjectDir(persona.studyId);
              const configPath = path.join(projectDir, 'study.config.json');
              
              if (await fs.pathExists(configPath)) {
                const config = await fs.readJson(configPath);
                return {
                  ...persona,
                  organization: config.organization || null,
                  archived: config.archived === true || config.status === 'Archived'
                };
              }
            } catch (err) {
              console.error(`Error reading config for ${persona.studyId}:`, err);
            }
          }
          return persona;
        })
      );
      
      // Filter out personas from archived projects unless explicitly requested
      const filteredPersonas = includeArchived === 'true'
        ? enrichedPersonas
        : enrichedPersonas.filter(p => !p.archived);
      
      personasData.personas = filteredPersonas;
    }
    
    res.json(personasData);
  } catch (error) {
    console.error('Error getting personas:', error);
    res.status(500).json({ error: 'Failed to get personas' });
  }
});

// GET /api/personas/:id - Get specific persona by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const personasData = await readSharedPersonas();
    
    const persona = personasData.personas?.find(p => p.id === id);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    res.json({ persona });
  } catch (error) {
    console.error('Error getting persona:', error);
    res.status(500).json({ error: 'Failed to get persona' });
  }
});

// PUT /api/personas - Update personas
router.put('/', async (req, res) => {
  try {
    await writeSharedPersonas(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating personas:', error);
    res.status(500).json({ error: 'Failed to update personas' });
  }
});

// POST /api/personas - Create new persona
router.post('/', async (req, res) => {
  try {
    const personasData = await readSharedPersonas();
    
    if (!personasData.personas) {
      personasData.personas = [];
    }
    
    const newPersona = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    personasData.personas.push(newPersona);
    personasData.lastUpdated = new Date().toISOString();
    
    await writeSharedPersonas(personasData);
    
    res.json({ success: true, persona: newPersona });
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({ error: 'Failed to create persona' });
  }
});

// PUT /api/personas/:id - Update specific persona
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const personasData = await readSharedPersonas();
    
    const personaIndex = personasData.personas.findIndex(p => p.id === id);
    
    if (personaIndex === -1) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    personasData.personas[personaIndex] = {
      ...personasData.personas[personaIndex],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    personasData.lastUpdated = new Date().toISOString();
    
    await writeSharedPersonas(personasData);
    
    res.json({ success: true, persona: personasData.personas[personaIndex] });
  } catch (error) {
    console.error('Error updating persona:', error);
    res.status(500).json({ error: 'Failed to update persona' });
  }
});

export default router;


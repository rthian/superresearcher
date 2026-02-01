import express from 'express';
import { getProjectDir, listProjects } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/personas - Get all personas from all projects
router.get('/', async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const projects = await listProjects();
    const allPersonas = [];
    
    for (const projectSlug of projects) {
      try {
        // Read project config to get organization and archived status
        const projectDir = getProjectDir(projectSlug);
        const configPath = path.join(projectDir, 'study.config.json');
        let organization = null;
        let isArchived = false;
        
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          organization = config.organization || null;
          isArchived = config.archived === true || config.status === 'Archived';
        }
        
        // Skip archived projects unless explicitly requested
        if (isArchived && includeArchived !== 'true') {
          continue;
        }
        
        // Read personas from project folder
        const personasPath = path.join(projectDir, 'personas', 'updates.json');
        
        if (await fs.pathExists(personasPath)) {
          const personasData = await fs.readJson(personasPath);
          
          if (personasData.personas && Array.isArray(personasData.personas)) {
            // Add project context and organization to each persona
            const enrichedPersonas = personasData.personas.map(persona => ({
              ...persona,
              projectSlug,
              studyId: projectSlug, // Ensure studyId is set to project slug
              organization,
              archived: isArchived
            }));
            
            allPersonas.push(...enrichedPersonas);
          }
        }
      } catch (err) {
        console.error(`Error reading personas for ${projectSlug}:`, err);
      }
    }
    
    res.json({
      lastUpdated: new Date().toISOString(),
      totalPersonas: allPersonas.length,
      personas: allPersonas
    });
  } catch (error) {
    console.error('Error getting personas:', error);
    res.status(500).json({ error: 'Failed to get personas' });
  }
});

// GET /api/personas/:id - Get specific persona by ID from all projects
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await listProjects();
    
    // Search across all projects for the persona
    for (const projectSlug of projects) {
      try {
        const projectDir = getProjectDir(projectSlug);
        const personasPath = path.join(projectDir, 'personas', 'updates.json');
        
        if (await fs.pathExists(personasPath)) {
          const personasData = await fs.readJson(personasPath);
          const persona = personasData.personas?.find(p => p.id === id);
          
          if (persona) {
            // Read project config for enrichment
            const configPath = path.join(projectDir, 'study.config.json');
            let organization = null;
            let isArchived = false;
            
            if (await fs.pathExists(configPath)) {
              const config = await fs.readJson(configPath);
              organization = config.organization || null;
              isArchived = config.archived === true || config.status === 'Archived';
            }
            
            return res.json({
              persona: {
                ...persona,
                projectSlug,
                studyId: projectSlug,
                organization,
                archived: isArchived
              }
            });
          }
        }
      } catch (err) {
        console.error(`Error reading personas for ${projectSlug}:`, err);
      }
    }
    
    // Persona not found in any project
    return res.status(404).json({ error: 'Persona not found' });
  } catch (error) {
    console.error('Error getting persona:', error);
    res.status(500).json({ error: 'Failed to get persona' });
  }
});

// PUT /api/personas - Update personas for a specific project
router.put('/', async (req, res) => {
  try {
    const { projectSlug, ...personasData } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const personasPath = path.join(projectDir, 'personas', 'updates.json');
    
    await fs.ensureDir(path.dirname(personasPath));
    await fs.writeJson(personasPath, personasData, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating personas:', error);
    res.status(500).json({ error: 'Failed to update personas' });
  }
});

// POST /api/personas - Create new persona in a specific project
router.post('/', async (req, res) => {
  try {
    const { projectSlug, ...personaData } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const personasPath = path.join(projectDir, 'personas', 'updates.json');
    
    // Read existing personas or create new structure
    let personasData = { personas: [] };
    if (await fs.pathExists(personasPath)) {
      personasData = await fs.readJson(personasPath);
    }
    
    if (!personasData.personas) {
      personasData.personas = [];
    }
    
    const newPersona = {
      ...personaData,
      lastUpdated: new Date().toISOString()
    };
    
    personasData.personas.push(newPersona);
    personasData.lastUpdated = new Date().toISOString();
    personasData.studyId = projectSlug;
    personasData.totalPersonas = personasData.personas.length;
    
    await fs.ensureDir(path.dirname(personasPath));
    await fs.writeJson(personasPath, personasData, { spaces: 2 });
    
    res.json({ success: true, persona: newPersona });
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({ error: 'Failed to create persona' });
  }
});

// PUT /api/personas/:id - Update specific persona in its source project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await listProjects();
    
    // Find the persona in its source project
    for (const projectSlug of projects) {
      try {
        const projectDir = getProjectDir(projectSlug);
        const personasPath = path.join(projectDir, 'personas', 'updates.json');
        
        if (await fs.pathExists(personasPath)) {
          const personasData = await fs.readJson(personasPath);
          const personaIndex = personasData.personas?.findIndex(p => p.id === id);
          
          if (personaIndex !== -1) {
            // Update the persona
            personasData.personas[personaIndex] = {
              ...personasData.personas[personaIndex],
              ...req.body,
              lastUpdated: new Date().toISOString()
            };
            
            personasData.lastUpdated = new Date().toISOString();
            
            // Write back to project folder
            await fs.writeJson(personasPath, personasData, { spaces: 2 });
            
            return res.json({ 
              success: true, 
              persona: personasData.personas[personaIndex] 
            });
          }
        }
      } catch (err) {
        console.error(`Error updating persona in ${projectSlug}:`, err);
      }
    }
    
    return res.status(404).json({ error: 'Persona not found' });
  } catch (error) {
    console.error('Error updating persona:', error);
    res.status(500).json({ error: 'Failed to update persona' });
  }
});

export default router;


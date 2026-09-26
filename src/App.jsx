import { useState, useEffect } from 'react'

function App() {
  const [recipeList, setRecipeList] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [activePath, setActivePath] = useState(null)
  const [error, setError] = useState(null)

  // 1. Fetch the list of all recipes on load
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const owner = import.meta.env.VITE_GITHUB_REPO_OWNER
        const repo = import.meta.env.VITE_GITHUB_REPO_NAME
        const token = import.meta.env.VITE_GITHUB_TOKEN

        // The ?recursive=1 parameter gets all files inside all folders
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (!response.ok) throw new Error('Failed to fetch repository tree')

        const data = await response.json()
        // Filter only JSON files (ignoring folders, READMEs, and files starting with _)
        const jsonFiles = data.tree.filter(
          item => item.path.endsWith('.json') && !item.path.split('/').pop().startsWith('_')
        )
        setRecipeList(jsonFiles)
      } catch (err) {
        setError(err.message)
      }
    }
    fetchTree()
  }, [])

  // 2. Fetch the specific recipe when clicked
  const loadRecipe = async (path) => {
    try {
      setActivePath(path)
      setSelectedRecipe(null) // Clear current recipe while the new one loads
      const owner = import.meta.env.VITE_GITHUB_REPO_OWNER
      const repo = import.meta.env.VITE_GITHUB_REPO_NAME
      const token = import.meta.env.VITE_GITHUB_TOKEN

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3.raw'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to load recipe data')

      const data = await response.json()
      setSelectedRecipe(data)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>

  // Group recipes by category (first folder in the path)
  const groupedRecipes = recipeList.reduce((acc, file) => {
    const parts = file.path.split('/');
    const category = parts.length > 1 ? parts[0] : 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar Menu */}
      <div style={{ width: '250px', borderLeft: '1px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>My Recipes</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.entries(groupedRecipes).map(([category, files]) => (
            <li key={category} style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.1em', margin: '0 0 10px 0', borderBottom: '2px solid var(--accent)', paddingBottom: '4px', color: 'var(--accent)' }}>
                {category}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {files.map((file) => (
                  <li key={file.path} style={{ margin: '8px 0' }}>
                    <button
                      onClick={() => loadRecipe(file.path)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor: activePath === file.path ? 'var(--accent-bg)' : 'transparent',
                        border: activePath === file.path ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                        borderRadius: '6px',
                        textAlign: 'start',
                        fontWeight: activePath === file.path ? 'bold' : 'normal',
                        transition: 'all 0.2s',
                        color: 'var(--text)'
                      }}
                    >
                      {/* Clean up the path to just show the filename in the menu */}
                      {file.path.split('/').pop().replace('.json', '').replace(/-/g, ' ')}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Recipe Display Area */}
      <div style={{ flex: 1, padding: '40px' }}>
        {!activePath && <h3>Select a recipe from the menu to view it.</h3>}
        {activePath && !selectedRecipe && <h3>Loading recipe...</h3>}

        {selectedRecipe && (
          <div>
            <h1>{selectedRecipe.title}</h1>
            {selectedRecipe.images && selectedRecipe.images.length > 0 && selectedRecipe.images[0] && (
              <img
                src={selectedRecipe.images[0]}
                alt={selectedRecipe.title}
                style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
            )}

            <h2 style={{ marginTop: '30px' }}>Ingredients</h2>
            {selectedRecipe.ingredients.map((section, sIndex) => (
              <div key={sIndex} style={{ marginBottom: '20px' }}>
                {section.section && <h3 style={{ marginTop: '10px', fontSize: '1.2em' }}>{section.section}</h3>}
                <ul style={{ fontSize: '1.1em', lineHeight: '1.6', marginTop: section.section ? '10px' : '0' }}>
                  {section.items.map((ing, iIndex) => (
                    <li key={iIndex}>
                      {ing.amount > 0 && <strong>{ing.amount} {ing.unit} </strong>}
                      {ing.amount2 > 0 && <strong>({ing.amount2} {ing.unit2}) </strong>}
                      {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h2 style={{ marginTop: '30px' }}>Instructions</h2>
            {selectedRecipe.instructions.map((section, sIndex) => (
              <div key={sIndex} style={{ marginBottom: '20px' }}>
                {section.section && <h3 style={{ marginTop: '10px', fontSize: '1.2em' }}>{section.section}</h3>}
                <ol style={{ fontSize: '1.1em', lineHeight: '1.6', marginTop: section.section ? '10px' : '0' }}>
                  {section.steps.map((step, iIndex) => {
                    const text = typeof step === 'string' ? step : step.text;
                    const image = typeof step === 'object' && step.image ? step.image : null;
                    return (
                      <li key={iIndex} style={{ marginBottom: '10px' }}>
                        <div>{text}</div>
                        {image && (
                          <img 
                            src={image} 
                            alt={`Step ${iIndex + 1}`} 
                            style={{ maxWidth: '100%', height: 'auto', marginTop: '10px', borderRadius: '8px' }} 
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}

            {selectedRecipe.trial_notes && (
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', marginTop: '40px', borderRadius: '8px', borderLeft: '5px solid #ffc107' }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Trial Notes:</strong>
                {selectedRecipe.trial_notes.map((note, index) => (
                  <p key={index} style={{ margin: '5px 0 0 0' }}>
                    <em>{note.date}:</em> {note.note}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
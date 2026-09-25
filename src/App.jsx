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
        // Filter only JSON files (ignoring folders or READMEs)
        const jsonFiles = data.tree.filter(item => item.path.endsWith('.json'))
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar Menu */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9' }}>
        <h2>My Recipes</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recipeList.map((file) => (
            <li key={file.path} style={{ margin: '10px 0' }}>
              <button
                onClick={() => loadRecipe(file.path)}
                style={{
                  width: '100%',
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: activePath === file.path ? '#e0e0e0' : 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  textAlign: 'left',
                  fontWeight: activePath === file.path ? 'bold' : 'normal'
                }}
              >
                {/* Clean up the path to just show the filename in the menu */}
                {file.path.split('/').pop().replace('.json', '').replace(/-/g, ' ')}
              </button>
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
            <img
              src={selectedRecipe.images[0]}
              alt={selectedRecipe.title}
              style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />

            <h2 style={{ marginTop: '30px' }}>Ingredients</h2>
            <ul style={{ fontSize: '1.1em', lineHeight: '1.6' }}>
              {selectedRecipe.ingredients.map((ing, index) => (
                <li key={index}>
                  <strong>{ing.amount}{ing.unit}</strong> {ing.name}
                </li>
              ))}
            </ul>

            <h2 style={{ marginTop: '30px' }}>Instructions</h2>
            <ol style={{ fontSize: '1.1em', lineHeight: '1.6' }}>
              {selectedRecipe.instructions.map((step, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>{step}</li>
              ))}
            </ol>

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
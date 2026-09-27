import { useState, useEffect } from 'react'
import CulinaryNotebook from './CulinaryNotebook'

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
    setActivePath(path)
    setSelectedRecipe(null)
    if (!path) {
      setError(null)
      return
    }

    try {
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
    <CulinaryNotebook 
      recipeList={recipeList} 
      selectedRecipe={selectedRecipe} 
      activePath={activePath} 
      onSelectRecipe={loadRecipe} 
    />
  )
}

export default App
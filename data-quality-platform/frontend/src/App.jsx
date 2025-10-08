import { Routes, Route } from 'react-router-dom'

// Layout
import Layout from './components/Layout'

// Pages
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Tables from './pages/Tables'
import TableDetails from './pages/TableDetails'
import Profile from './pages/Profile'
import Issues from './pages/Issues'
import IssueDetails from './pages/IssueDetails'
import Quality from './pages/Quality'
import Monitoring from './pages/Monitoring'
import Remediation from './pages/Remediation'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="tables" element={<Tables />} />
        <Route path="tables/:tableId" element={<TableDetails />} />
        <Route path="profile/:tableId" element={<Profile />} />
        <Route path="issues" element={<Issues />} />
        <Route path="issues/:issueId" element={<IssueDetails />} />
        <Route path="quality" element={<Quality />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="remediation" element={<Remediation />} />
      </Route>
    </Routes>
  )
}

export default App



import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Visibility, Refresh } from '@mui/icons-material'
import { issueService } from '../services/apiService'

function Issues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', severity: '', issueType: '' })
  const navigate = useNavigate()

  useEffect(() => {
    loadIssues()
  }, [filters])

  const loadIssues = async () => {
    try {
      console.log('🔍 Fetching issues with filters:', filters)
      const response = await issueService.getIssues(filters)
      console.log('✅ Issues API response:', response.data)
      console.log(`📊 Total issues received: ${response.data.issues?.length || 0}`)
      setIssues(response.data.issues || [])
    } catch (error) {
      console.error('❌ Failed to load issues:', error)
      console.error('Error details:', error.response?.data || error.message)
      setIssues([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    }
    return colors[severity] || 'default'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">
            Data Quality Issues
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <IconButton 
          onClick={() => { setLoading(true); loadIssues(); }} 
          color="primary"
          title="Refresh issues"
        >
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity}
            label="Severity"
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.issueType}
            label="Type"
            onChange={(e) => setFilters({ ...filters, issueType: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="duplicate">Duplicate</MenuItem>
            <MenuItem value="missing">Missing</MenuItem>
            <MenuItem value="invalid">Invalid</MenuItem>
            <MenuItem value="outlier">Outlier</MenuItem>
            <MenuItem value="inconsistent">Inconsistent</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Records</TableCell>
              <TableCell>Exact Locations</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remediation</TableCell>
              <TableCell>Detected</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="textSecondary">No issues found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {issue.title}
                    </Typography>
                    {issue.column_name && (
                      <Typography variant="caption" color="textSecondary">
                        Column: {issue.column_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.issue_type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.severity}
                      color={getSeverityColor(issue.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <strong>{issue.record_count}</strong>
                    {issue.example_bad_values && issue.example_bad_values.length > 0 && (
                      <Typography variant="caption" display="block" color="error">
                        e.g., {issue.example_bad_values[0]}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {issue.exact_locations && issue.exact_locations.length > 0 ? (
                      <>
                        <Typography variant="caption" color="primary" fontWeight="bold">
                          {issue.exact_locations.length} exact locations
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          e.g., Row {issue.exact_locations[0].row}, Col: {issue.exact_locations[0].column}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Multiple rows
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.remediation_status || 'Incomplete'}
                      size="small"
                      color={issue.remediation_status === 'Complete' ? 'success' : 'default'}
                      sx={{
                        borderRadius: 0,
                        fontWeight: issue.remediation_status === 'Complete' ? 600 : 400
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(issue.detected_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      color="primary"
                      title="View detailed locations"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Issues



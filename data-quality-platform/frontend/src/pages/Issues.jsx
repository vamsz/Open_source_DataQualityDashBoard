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
import { Visibility } from '@mui/icons-material'
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
      const response = await issueService.getIssues(filters)
      setIssues(response.data.issues)
    } catch (error) {
      console.error('Failed to load issues:', error)
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
      <Typography variant="h4" gutterBottom>
        Data Quality Issues
      </Typography>

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
              <TableCell>Status</TableCell>
              <TableCell>Detected</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
                    <Chip label={issue.status} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(issue.detected_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      color="primary"
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



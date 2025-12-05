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
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material'
import { 
  Edit, 
  Delete, 
  CheckCircle, 
  Visibility,
  ArrowBack
} from '@mui/icons-material'
import { monitoringService, issueService, dataService } from '../services/apiService'
import { useSnackbar } from 'notistack'

function Monitoring() {
  const [flaggedIssues, setFlaggedIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [tableData, setTableData] = useState([])
  const [edits, setEdits] = useState([]) // [{ row, column, newValue, reason }]
  const [loadingData, setLoadingData] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    loadFlaggedIssues()
  }, [])

  const loadFlaggedIssues = async () => {
    try {
      const response = await monitoringService.getFlaggedIssues()
      setFlaggedIssues(response.data.flaggedIssues || [])
    } catch (error) {
      console.error('Failed to load flagged issues:', error)
      enqueueSnackbar('Failed to load flagged issues', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewIssue = async (issue) => {
    setSelectedIssue(issue)
    setEdits([])
    setReviewDialogOpen(true)
    setLoadingData(true)
    
    try {
      // Load table data for this issue
      const dataRes = await dataService.getTableData(issue.table_id || issue.Table?.id)
      setTableData(dataRes.data.data || [])
    } catch (error) {
      console.error('Failed to load table data:', error)
      enqueueSnackbar('Failed to load table data', { variant: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  const handleEditCell = (rowNum, column, currentValue) => {
    const existingEdit = edits.findIndex(e => e.row === rowNum && e.column === column)
    const newValue = prompt(`Edit value for Row ${rowNum}, Column ${column}:`, currentValue)
    
    if (newValue !== null && newValue !== currentValue) {
      const edit = {
        row: rowNum,
        column: column,
        newValue: newValue,
        reason: 'Manual review correction'
      }
      
      if (existingEdit >= 0) {
        const newEdits = [...edits]
        newEdits[existingEdit] = edit
        setEdits(newEdits)
      } else {
        setEdits([...edits, edit])
      }
    }
  }

  const handleDeleteRow = (rowNum) => {
    if (window.confirm(`Delete Row ${rowNum}?`)) {
      const edit = {
        row: rowNum,
        column: '*',
        action: 'delete'
      }
      setEdits([...edits, edit])
    }
  }

  const handleApplyChanges = async () => {
    if (edits.length === 0) {
      enqueueSnackbar('No changes to apply', { variant: 'info' })
      return
    }

    try {
      const deleteRows = edits.filter(e => e.action === 'delete').map(e => ({ row: e.row }))
      const updates = edits.filter(e => e.action !== 'delete').map(e => ({
        row: e.row,
        column: e.column,
        newValue: e.newValue,
        reason: e.reason || 'Manual review correction'
      }))

      let totalApplied = 0
      let success = true

      // Apply updates first if any
      if (updates.length > 0) {
        const updateResponse = await monitoringService.applyManualReview(
          selectedIssue.id,
          'update',
          updates
        )
        if (updateResponse.data?.success) {
          totalApplied += updateResponse.data.appliedFixes || 0
        } else {
          success = false
          enqueueSnackbar('Failed to apply updates', { variant: 'error' })
        }
      }

      // Then apply deletes if any
      if (deleteRows.length > 0 && success) {
        const deleteResponse = await monitoringService.applyManualReview(
          selectedIssue.id,
          'delete_rows',
          deleteRows
        )
        if (deleteResponse.data?.success) {
          totalApplied += deleteResponse.data.appliedFixes || 0
        } else {
          success = false
          enqueueSnackbar('Failed to delete rows', { variant: 'error' })
        }
      }

      if (success) {
        enqueueSnackbar(`Applied ${totalApplied} change${totalApplied !== 1 ? 's' : ''}`, { variant: 'success' })
        // Reload table data to reflect changes
        if (selectedIssue) {
          try {
            const dataRes = await dataService.getTableData(selectedIssue.table_id || selectedIssue.Table?.id)
            setTableData(dataRes.data.data || [])
          } catch (err) {
            console.error('Failed to refresh table data:', err)
          }
        }
        setReviewDialogOpen(false)
        setSelectedIssue(null)
        setEdits([])
        loadFlaggedIssues() // Refresh list
      }
    } catch (error) {
      console.error('Failed to apply changes:', error)
      enqueueSnackbar('Failed to apply changes', { variant: 'error' })
    }
  }

  const handleResolveIssue = async (issue) => {
    if (window.confirm(`Mark issue "${issue.title}" as resolved?`)) {
      try {
        await monitoringService.applyManualReview(issue.id, 'resolve', [])
        enqueueSnackbar('Issue marked as resolved', { variant: 'success' })
        loadFlaggedIssues()
      } catch (error) {
        enqueueSnackbar('Failed to resolve issue', { variant: 'error' })
      }
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Manual Review
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Review and fix issues that were flagged for manual inspection
        </Typography>
      </Box>

      {flaggedIssues.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 0 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Issues Flagged for Review
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Issues marked for manual review will appear here
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Issue</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Affected Rows</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Flagged At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flaggedIssues.map((issue) => (
                <TableRow key={issue.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {issue.title}
                    </Typography>
                    {issue.column_name && (
                      <Typography variant="caption" color="textSecondary">
                        Column: {issue.column_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {issue.Table?.name || issue.Table?.display_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.issue_type} size="small" sx={{ borderRadius: 0 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.severity}
                      color={getSeverityColor(issue.severity)}
                      size="small"
                      sx={{ borderRadius: 0 }}
                    />
                  </TableCell>
                  <TableCell>
                    {issue.record_count || issue.affected_rows?.length || 0}
                  </TableCell>
                  <TableCell>
                    {issue.flaggedAt ? new Date(issue.flaggedAt).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleReviewIssue(issue)}
                        title="Review & Edit"
                        sx={{ borderRadius: 0 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        title="View Details"
                        sx={{ borderRadius: 0 }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleResolveIssue(issue)}
                        title="Mark as Resolved"
                        sx={{ borderRadius: 0 }}
                      >
                        <CheckCircle color="success" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Manual Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false)
          setSelectedIssue(null)
          setEdits([])
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, borderRadius: 0 }}>
          Manual Review: {selectedIssue?.title}
        </DialogTitle>
        <DialogContent>
          {selectedIssue && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Table</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedIssue.Table?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Column</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedIssue.column_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Affected Rows</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedIssue.record_count || selectedIssue.affected_rows?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Severity</Typography>
                  <Chip
                    label={selectedIssue.severity}
                    color={getSeverityColor(selectedIssue.severity)}
                    size="small"
                    sx={{ borderRadius: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {edits.length > 0 && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 0 }}>
              <strong>{edits.length} change{edits.length !== 1 ? 's' : ''} pending:</strong>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                {edits.map((edit, idx) => (
                  <li key={idx}>
                    {edit.action === 'delete' ? (
                      `Delete Row ${edit.row}`
                    ) : (
                      `Row ${edit.row}, ${edit.column}: "${edit.newValue}"`
                    )}
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400, borderRadius: 0 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    {selectedIssue?.affected_rows && tableData.length > 0 && 
                      Object.keys(tableData[0]).map((col) => (
                        <TableCell key={col} sx={{ fontWeight: 600 }}>
                          {col}
                        </TableCell>
                      ))
                    }
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedIssue?.affected_rows?.slice(0, 20).map((rowNum) => {
                    const rowIndex = rowNum - 1
                    const row = tableData[rowIndex]
                    if (!row) return null
                    
                    return (
                      <TableRow key={rowNum}>
                        <TableCell sx={{ fontWeight: 600 }}>{rowNum}</TableCell>
                        {Object.keys(row).map((col) => {
                          const edit = edits.find(e => e.row === rowNum && e.column === col)
                          const value = edit ? edit.newValue : row[col]
                          const isEdited = !!edit
                          
                          return (
                            <TableCell
                              key={col}
                              sx={{
                                backgroundColor: isEdited ? '#e8f5e9' : 'transparent',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f5f5f5' }
                              }}
                              onClick={() => handleEditCell(rowNum, col, row[col])}
                            >
                              {value}
                              {isEdited && (
                                <Chip
                                  label="Edited"
                                  size="small"
                                  color="success"
                                  sx={{ ml: 1, borderRadius: 0, height: 18 }}
                                />
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRow(rowNum)}
                            sx={{ borderRadius: 0 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderRadius: 0 }}>
          <Button
            onClick={() => {
              setReviewDialogOpen(false)
              setSelectedIssue(null)
              setEdits([])
            }}
            sx={{ borderRadius: 0 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyChanges}
            variant="contained"
            disabled={edits.length === 0}
            sx={{
              borderRadius: 0,
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#43a047' }
            }}
          >
            Apply Changes ({edits.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Monitoring

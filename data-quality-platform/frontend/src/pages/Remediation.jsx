import { useEffect, useState } from 'react'
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
  Button
} from '@mui/material'
import { remediationService } from '../services/apiService'
import { useSnackbar } from 'notistack'

function Remediation() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadActions()
  }, [])

  const loadActions = async () => {
    try {
      const response = await remediationService.getActions()
      setActions(response.data.actions)
    } catch (error) {
      console.error('Failed to load actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRollback = async (actionId) => {
    if (window.confirm('Are you sure you want to rollback this action?')) {
      try {
        await remediationService.rollbackAction(actionId)
        enqueueSnackbar('Action rolled back successfully', { variant: 'success' })
        loadActions()
      } catch (error) {
        enqueueSnackbar('Failed to rollback action', { variant: 'error' })
      }
    }
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
        Remediation History
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        View and manage data quality remediation actions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action Type</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Records Affected</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">
                    No remediation actions yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Chip label={action.action_type} size="small" />
                  </TableCell>
                  <TableCell>
                    {action.Issue?.title || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.status}
                      color={
                        action.status === 'completed'
                          ? 'success'
                          : action.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{action.record_count || 0}</TableCell>
                  <TableCell>
                    {new Date(action.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {action.status === 'completed' && (
                      <Button
                        size="small"
                        onClick={() => handleRollback(action.id)}
                      >
                        Rollback
                      </Button>
                    )}
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

export default Remediation



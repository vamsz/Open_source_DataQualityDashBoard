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
  IconButton
} from '@mui/material'
import { CheckCircle, Cancel } from '@mui/icons-material'
import { monitoringService } from '../services/apiService'
import { useSnackbar } from 'notistack'

function Monitoring() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await monitoringService.getAlerts()
      setAlerts(response.data.alerts)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertId) => {
    try {
      await monitoringService.markAlertAsRead(alertId)
      enqueueSnackbar('Alert marked as read', { variant: 'success' })
      loadAlerts()
    } catch (error) {
      enqueueSnackbar('Failed to update alert', { variant: 'error' })
    }
  }

  const handleDismiss = async (alertId) => {
    try {
      await monitoringService.dismissAlert(alertId)
      enqueueSnackbar('Alert dismissed', { variant: 'success' })
      loadAlerts()
    } catch (error) {
      enqueueSnackbar('Failed to dismiss alert', { variant: 'error' })
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
        Monitoring & Alerts
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Real-time quality monitoring and alerting
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Triggered</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No alerts</Typography>
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.title}</TableCell>
                  <TableCell>
                    <Chip label={alert.alert_type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={alert.severity}
                      color={
                        alert.severity === 'critical'
                          ? 'error'
                          : alert.severity === 'high'
                          ? 'warning'
                          : 'info'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={alert.status} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(alert.triggered_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {alert.status === 'unread' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <CheckCircle color="success" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <Cancel color="error" />
                        </IconButton>
                      </>
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

export default Monitoring



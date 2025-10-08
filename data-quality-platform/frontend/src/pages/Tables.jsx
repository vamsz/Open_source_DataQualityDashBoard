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
  Button,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material'
import { Visibility, Delete } from '@mui/icons-material'
import { dataService } from '../services/apiService'
import { useSnackbar } from 'notistack'

function Tables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      const response = await dataService.getTables()
      setTables(response.data.tables)
    } catch (error) {
      enqueueSnackbar('Failed to load tables', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await dataService.deleteTable(tableId)
        enqueueSnackbar('Table deleted successfully', { variant: 'success' })
        loadTables()
      } catch (error) {
        enqueueSnackbar('Failed to delete table', { variant: 'error' })
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Tables
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your uploaded data tables
          </Typography>
        </div>
        <Button variant="contained" onClick={() => navigate('/upload')}>
          Upload New Table
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Table Name</TableCell>
              <TableCell>Rows</TableCell>
              <TableCell>Columns</TableCell>
              <TableCell>Quality Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No tables found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell>{table.display_name}</TableCell>
                  <TableCell>{table.row_count?.toLocaleString() || 0}</TableCell>
                  <TableCell>{table.column_count || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${table.quality_score || 0}%`}
                      color={table.quality_score >= 80 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={table.status}
                      color={table.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tables/${table.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(table.id)}
                    >
                      <Delete />
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

export default Tables



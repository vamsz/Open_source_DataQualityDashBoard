import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { dataService } from '../services/apiService'

function TableDetails() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [table, setTable] = useState(null)
  const [tableData, setTableData] = useState([])
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTableDetails()
  }, [tableId])

  const loadTableDetails = async () => {
    try {
      const [tableRes, dataRes] = await Promise.all([
        dataService.getTable(tableId),
        dataService.getTableData(tableId, { limit: 100 })
      ])
      setTable(tableRes.data.table)
      setTableData(dataRes.data.data)
    } catch (error) {
      console.error('Failed to load table:', error)
    } finally {
      setLoading(false)
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
            {table?.display_name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {table?.row_count} rows • {table?.column_count} columns
          </Typography>
        </div>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => navigate(`/profile/${tableId}`)}
          >
            View Profile
          </Button>
          <Button variant="contained">
            Export Data
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Data Preview" />
          <Tab label="Schema" />
          <Tab label="Metadata" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {table?.Columns?.map((col) => (
                      <TableCell key={col.id}>{col.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, idx) => (
                    <TableRow key={idx}>
                      {table?.Columns?.map((col) => (
                        <TableCell key={col.id}>
                          {String(row[col.name] || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Nullable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table?.Columns?.map((col) => (
                  <TableRow key={col.id}>
                    <TableCell>{col.name}</TableCell>
                    <TableCell>{col.data_type}</TableCell>
                    <TableCell>{col.is_nullable ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 2 && (
            <Box>
              <Typography variant="body2" paragraph>
                <strong>Created:</strong> {new Date(table?.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Last Updated:</strong> {new Date(table?.updated_at).toLocaleString()}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Quality Score:</strong> {table?.quality_score}%
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default TableDetails



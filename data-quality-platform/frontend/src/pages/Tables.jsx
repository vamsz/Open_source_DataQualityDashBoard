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
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Stack,
  Grid,
  LinearProgress,
  alpha,
  Tooltip
} from '@mui/material'
import { 
  Visibility, 
  Delete, 
  TableChart,
  Assessment,
  CloudUpload,
  DataUsage,
  Timeline,
  InsertDriveFile,
  MoreVert
} from '@mui/icons-material'
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
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Data Tables
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Manage and explore your uploaded datasets
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/upload')}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(108,99,255,0.4)'
              }
            }}
            startIcon={<CloudUpload />}
          >
            Upload New Table
          </Button>
        </Box>
        
        {/* Quick Stats */}
        {tables.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {tables.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tables
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {tables.reduce((sum, t) => sum + (t.row_count || 0), 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rows
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {Math.round(tables.reduce((sum, t) => sum + (t.quality_score || 0), 0) / tables.length) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Quality
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Paper sx={{ 
          p: 8, 
          textAlign: 'center',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3,
            bgcolor: alpha('#6C63FF', 0.1),
            color: 'primary.main'
          }}>
            <DataUsage sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            No tables uploaded yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Get started by uploading your first dataset to begin analyzing data quality
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/upload')}
            sx={{ 
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            startIcon={<CloudUpload />}
          >
            Upload Your First Table
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tables.map((table) => (
            <Grid item xs={12} md={6} lg={4} key={table.id}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                },
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: table.quality_score >= 80 ? 'success.main' : 'warning.main',
                      width: 48,
                      height: 48
                    }}>
                      <InsertDriveFile />
                    </Avatar>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/tables/${table.id}`)}
                          sx={{ '&:hover': { bgcolor: alpha('#6C63FF', 0.1) } }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Table">
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleDelete(table.id)}
                          sx={{ '&:hover': { bgcolor: alpha('#F44336', 0.1) } }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Table Info */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {table.display_name}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📊 {table.row_count?.toLocaleString() || 0} rows
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📋 {table.column_count || 0} columns
                    </Typography>
                  </Stack>

                  {/* Quality Score */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Quality Score
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: table.quality_score >= 80 ? 'success.main' : 'warning.main'
                      }}>
                        {table.quality_score || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={table.quality_score || 0}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha('#000', 0.08),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: table.quality_score >= 80 ? 'success.main' : 'warning.main'
                        }
                      }}
                    />
                  </Box>

                  {/* Status & Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={table.python_analyzed ? 'AI Analyzed' : 'Basic Analysis'}
                      color={table.python_analyzed ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/tables/${table.id}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Tables



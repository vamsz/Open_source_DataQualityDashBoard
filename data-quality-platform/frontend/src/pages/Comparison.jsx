import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  ArrowBack,
  CompareArrows
} from '@mui/icons-material'
import axios from 'axios'

const API_BASE = '/api'

function Comparison() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState(null)
  const [allComparisons, setAllComparisons] = useState([])

  useEffect(() => {
    if (tableId) {
      loadTableComparison(tableId)
    } else {
      loadAllComparisons()
    }
  }, [tableId])

  const loadTableComparison = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/comparison/${id}`)
      setComparisonData(response.data)
      if (response.data.snapshots.length > 0) {
        setSelectedSnapshot(response.data.snapshots[0])
      }
    } catch (error) {
      console.error('Failed to load comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllComparisons = async () => {
    try {
      const response = await axios.get(`${API_BASE}/comparison`)
      setAllComparisons(response.data.comparisons || [])
    } catch (error) {
      console.error('Failed to load comparisons:', error)
    } finally {
      setLoading(false)
    }
  }

  const getKPIValue = (kpis, key) => {
    return kpis?.[key] || 0
  }

  const getImprovement = (before, after) => {
    return after - before
  }

  const formatImprovement = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getImprovementColor = (value) => {
    if (value > 0) return '#4caf50'
    if (value < 0) return '#f44336'
    return '#757575'
  }

  const KPICard = ({ label, before, after, improvement, icon }) => {
    const diff = getImprovement(before, after)
    const hasImprovement = Math.abs(diff) > 0.1

    return (
      <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  {after.toFixed(1)}%
                </Typography>
                {hasImprovement && (
                  <Chip
                    icon={diff > 0 ? <TrendingUp /> : <TrendingDown />}
                    label={formatImprovement(diff)}
                    size="small"
                    sx={{
                      backgroundColor: getImprovementColor(diff),
                      color: 'white',
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 24
                    }}
                  />
                )}
              </Box>
            </Box>
            {icon}
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Before: {before.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={before}
              sx={{
                height: 6,
                borderRadius: 0,
                backgroundColor: '#e0e0e0',
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#9e9e9e',
                  borderRadius: 0
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              After: {after.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={after}
              sx={{
                height: 6,
                borderRadius: 0,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: diff > 0 ? '#4caf50' : diff < 0 ? '#f44336' : '#757575',
                  borderRadius: 0
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show list view if no tableId
  if (!tableId && allComparisons.length > 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            KPI Comparison
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" paragraph>
          View before and after remediation KPIs for all tables
        </Typography>

        <Grid container spacing={3}>
          {allComparisons.map((comp) => (
            <Grid item xs={12} md={6} lg={4} key={comp.table.id}>
              <Card
                sx={{
                  borderRadius: 0,
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderColor: '#424242'
                  }
                }}
                onClick={() => navigate(`/comparison/${comp.table.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {comp.table.display_name || comp.table.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Overall Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {comp.current.overall_score.toFixed(1)}%
                      </Typography>
                      {comp.totalImprovement && Math.abs(comp.totalImprovement.overall_score) > 0.01 && (
                        <Chip
                          icon={comp.totalImprovement.overall_score > 0 ? <TrendingUp /> : <TrendingDown />}
                          label={formatImprovement(comp.totalImprovement.overall_score)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(comp.totalImprovement.overall_score),
                            color: 'white',
                            borderRadius: 0,
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {comp.hasSnapshots && (
                    <Typography variant="caption" color="textSecondary">
                      {comp.snapshotCount} remediation{comp.snapshotCount !== 1 ? 's' : ''} tracked
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (!comparisonData) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          No Comparison Data
        </Typography>
        <Typography variant="body1" color="textSecondary">
          No remediation has been performed on this table yet.
        </Typography>
      </Box>
    )
  }

  const { table, current, original, snapshots } = comparisonData
  const before = selectedSnapshot ? selectedSnapshot.before : original
  const after = selectedSnapshot ? selectedSnapshot.after : current

  const kpiLabels = [
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'completeness', label: 'Completeness' },
    { key: 'consistency', label: 'Consistency' },
    { key: 'uniqueness', label: 'Uniqueness' },
    { key: 'validity', label: 'Validity' },
    { key: 'timeliness', label: 'Timeliness' }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/comparison')}
            sx={{ mb: 1, borderRadius: 0 }}
          >
            Back to All Comparisons
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            KPI Comparison: {table.display_name || table.name}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body1" color="textSecondary" paragraph>
        Compare KPIs before and after remediation actions
      </Typography>

      {/* Snapshot Selector */}
      {snapshots.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 0, backgroundColor: '#fafafa' }}>
          <FormControl fullWidth sx={{ borderRadius: 0 }}>
            <InputLabel>Select Remediation Snapshot</InputLabel>
            <Select
              value={selectedSnapshot?.id || 'current'}
              onChange={(e) => {
                if (e.target.value === 'current') {
                  setSelectedSnapshot(null)
                } else {
                  setSelectedSnapshot(snapshots.find(s => s.id === e.target.value))
                }
              }}
              sx={{ borderRadius: 0 }}
            >
              <MenuItem value="current">Current State (vs Original)</MenuItem>
              {snapshots.map((snapshot) => (
                <MenuItem key={snapshot.id} value={snapshot.id}>
                  {new Date(snapshot.timestamp).toLocaleString()} - {formatImprovement(snapshot.improvement.overall_score)} overall
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Overall Score Comparison */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 0, backgroundColor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Overall Quality Score
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Before
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#757575' }}>
                {before.overall_score.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                After
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: getImprovementColor(getImprovement(before.overall_score, after.overall_score)) }}>
                {after.overall_score.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Improvement
              </Typography>
              <Chip
                icon={getImprovement(before.overall_score, after.overall_score) > 0 ? <TrendingUp /> : <TrendingDown />}
                label={formatImprovement(getImprovement(before.overall_score, after.overall_score))}
                sx={{
                  backgroundColor: getImprovementColor(getImprovement(before.overall_score, after.overall_score)),
                  color: 'white',
                  borderRadius: 0,
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '8px 16px'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Individual KPI Cards */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Individual KPIs
      </Typography>
      <Grid container spacing={3}>
        {kpiLabels.map(({ key, label }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <KPICard
              label={label}
              before={getKPIValue(before, key)}
              after={getKPIValue(after, key)}
              improvement={getImprovement(getKPIValue(before, key), getKPIValue(after, key))}
            />
          </Grid>
        ))}
      </Grid>

      {/* Detailed Comparison Table */}
      {snapshots.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Remediation History
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Completeness</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Consistency</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Uniqueness</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Validity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Timeliness</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Overall</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {snapshots.map((snapshot) => (
                  <TableRow key={snapshot.id} hover>
                    <TableCell>
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.accuracy.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.accuracy)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.accuracy),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.completeness.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.completeness)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.completeness),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.consistency.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.consistency)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.consistency),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.uniqueness.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.uniqueness)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.uniqueness),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.validity.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.validity)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.validity),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>{snapshot.after.timeliness.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.timeliness)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.timeliness),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{snapshot.after.overall_score.toFixed(1)}%</Typography>
                        <Chip
                          label={formatImprovement(snapshot.improvement.overall_score)}
                          size="small"
                          sx={{
                            backgroundColor: getImprovementColor(snapshot.improvement.overall_score),
                            color: 'white',
                            borderRadius: 0,
                            fontSize: '0.65rem',
                            height: 20,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

export default Comparison


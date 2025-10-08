import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  BugReport,
  TableChart,
  CheckCircle
} from '@mui/icons-material'
import { qualityService, dataService, issueService } from '../services/apiService'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [tables, setTables] = useState([])
  const [issues, setIssues] = useState({ total: 0, critical: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [summaryRes, tablesRes, issuesRes] = await Promise.all([
        qualityService.getSummary(),
        dataService.getTables({ limit: 5 }),
        issueService.getStatistics()
      ])
      setSummary(summaryRes.data)
      setTables(tablesRes.data.tables)
      setIssues(issuesRes.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
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

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Overview of your data quality metrics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tables"
            value={summary?.totalTables || 0}
            icon={<TableChart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Quality Score"
            value={`${summary?.avgQualityScore || 0}%`}
            icon={<Assessment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Issues"
            value={summary?.totalIssues || 0}
            icon={<BugReport />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Issues"
            value={summary?.resolvedIssues || 0}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tables
            </Typography>
            {tables.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" paragraph>
                  No tables uploaded yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/upload')}
                >
                  Upload Your First Table
                </Button>
              </Box>
            ) : (
              <Box>
                {tables.map((table) => (
                  <Box
                    key={table.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{table.display_name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {table.row_count} rows • {table.column_count} columns
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={`${table.quality_score}%`}
                        color={table.quality_score >= 80 ? 'success' : 'warning'}
                        size="small"
                      />
                      <Button
                        size="small"
                        onClick={() => navigate(`/tables/${table.id}`)}
                        sx={{ ml: 2 }}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                ))}
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/tables')}
                >
                  View All Tables
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Issues Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Critical</Typography>
                <Chip
                  label={issues.bySeverity?.critical || 0}
                  color="error"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">High</Typography>
                <Chip
                  label={issues.bySeverity?.high || 0}
                  color="warning"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Medium</Typography>
                <Chip
                  label={issues.bySeverity?.medium || 0}
                  color="info"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Low</Typography>
                <Chip
                  label={issues.bySeverity?.low || 0}
                  color="default"
                  size="small"
                />
              </Box>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/issues')}
              >
                View All Issues
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard



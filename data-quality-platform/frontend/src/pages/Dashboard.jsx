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
  Chip,
  Avatar,
  LinearProgress,
  Stack,
  alpha
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  BugReport,
  TableChart,
  CheckCircle,
  Timeline,
  DataUsage,
  Security,
  Speed
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

  const StatCard = ({ title, value, icon, color, gradient, trend, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: gradient || `linear-gradient(135deg, ${color}.main, ${color}.dark)`,
        color: 'white',
        borderRadius: 3,
        boxShadow: `0 8px 32px ${alpha(color === 'primary' ? '#6C63FF' : '#764ba2', 0.25)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(color === 'primary' ? '#6C63FF' : '#764ba2', 0.35)}`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                width: 56,
                height: 56
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${Math.abs(trend)}%`}
                size="small"
                sx={{
                  bgcolor: trend > 0 ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                  color: trend > 0 ? '#4CAF50' : '#F44336',
                  border: `1px solid ${trend > 0 ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`
                }}
              />
            )}
          </Box>
          
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Data Quality Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Monitor and improve your data quality across all datasets
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Tables"
            value={summary?.totalTables || 0}
            subtitle="Datasets uploaded"
            icon={<TableChart sx={{ fontSize: 28 }} />}
            color="primary"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Quality Score"
            value={`${summary?.avgQualityScore || 0}%`}
            subtitle="Average across all tables"
            icon={<Assessment sx={{ fontSize: 28 }} />}
            color="success"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Issues"
            value={summary?.totalIssues || 0}
            subtitle="Require attention"
            icon={<BugReport sx={{ fontSize: 28 }} />}
            color="warning"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Resolved"
            value={summary?.resolvedIssues || 0}
            subtitle="Issues fixed"
            icon={<CheckCircle sx={{ fontSize: 28 }} />}
            color="info"
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          />
        </Grid>
      </Grid>

      {/* Content Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Timeline />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Recent Tables
              </Typography>
            </Box>
            
            {tables.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <DataUsage sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tables uploaded yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get started by uploading your first dataset
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/upload')}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Upload Your First Table
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {tables.map((table, index) => (
                  <Card key={table.id} sx={{ 
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {table.display_name}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              📊 {table.row_count?.toLocaleString()} rows
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📋 {table.column_count} columns
                            </Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={table.quality_score || 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(0,0,0,0.08)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: table.quality_score >= 80 ? 'success.main' : 'warning.main'
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, 
                              color: table.quality_score >= 80 ? 'success.main' : 'warning.main' 
                            }}>
                              {table.quality_score}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Quality
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/tables/${table.id}`)}
                            sx={{ borderRadius: 2 }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{ mt: 3, borderRadius: 2, py: 1.5 }}
                  onClick={() => navigate('/tables')}
                >
                  View All Tables ({tables.length})
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <Security />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Issues Overview
              </Typography>
            </Box>
            
            <Stack spacing={3}>
              {[
                { label: 'Critical', count: issues.bySeverity?.critical || 0, color: 'error', gradient: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)' },
                { label: 'High', count: issues.bySeverity?.high || 0, color: 'warning', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                { label: 'Medium', count: issues.bySeverity?.medium || 0, color: 'info', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                { label: 'Low', count: issues.bySeverity?.low || 0, color: 'success', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
              ].map((issue) => (
                <Card key={issue.label} sx={{ 
                  background: issue.gradient,
                  color: 'white',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                          {issue.label} Priority
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {issue.count === 0 ? 'No issues' : `${issue.count} issues found`}
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {issue.count}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, borderRadius: 2, py: 1.5 }}
                onClick={() => navigate('/issues')}
              >
                Manage All Issues
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard



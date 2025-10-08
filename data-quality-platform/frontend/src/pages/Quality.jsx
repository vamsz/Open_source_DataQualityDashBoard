import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { qualityService } from '../services/apiService'

function Quality() {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQualityData()
  }, [])

  const loadQualityData = async () => {
    try {
      const response = await qualityService.getAllKPIs()
      setKpis(response.data.kpis)
    } catch (error) {
      console.error('Failed to load quality data:', error)
    } finally {
      setLoading(false)
    }
  }

  const KPICard = ({ label, value, color }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
          {value?.toFixed(1)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={value || 0}
          color={value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error'}
        />
      </CardContent>
    </Card>
  )

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
        Data Quality KPIs
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor key quality metrics across all tables
      </Typography>

      {kpis.map((kpi) => (
        <Box key={kpi.id} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {kpi.Table?.display_name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Accuracy" value={parseFloat(kpi.accuracy)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Completeness" value={parseFloat(kpi.completeness)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Consistency" value={parseFloat(kpi.consistency)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Validity" value={parseFloat(kpi.validity)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Uniqueness" value={parseFloat(kpi.uniqueness)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Timeliness" value={parseFloat(kpi.timeliness)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard label="Integrity" value={parseFloat(kpi.integrity)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Overall Score
                  </Typography>
                  <Typography variant="h5" component="div">
                    {parseFloat(kpi.overall_score).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  )
}

export default Quality



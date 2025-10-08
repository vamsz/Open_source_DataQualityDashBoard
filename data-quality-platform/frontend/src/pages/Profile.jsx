import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { profileService } from '../services/apiService'

function Profile() {
  const { tableId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [tableId])

  const loadProfile = async () => {
    try {
      const response = await profileService.getProfile(tableId)
      setProfile(response.data.profile)
    } catch (error) {
      console.error('Failed to load profile:', error)
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

  const columnProfiles = Object.entries(profile?.column_profiles || {})

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Data Profile
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Rows
              </Typography>
              <Typography variant="h5">
                {profile?.profile_data?.rowCount?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Columns
              </Typography>
              <Typography variant="h5">
                {profile?.profile_data?.columnCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completeness
              </Typography>
              <Typography variant="h5">
                {profile?.quality_metrics?.completeness?.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Score
              </Typography>
              <Typography variant="h5">
                {profile?.quality_metrics?.overallScore}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {profile?.ai_summary && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="h6" gutterBottom>
            🤖 AI Quality Assessment
          </Typography>
          <Typography variant="body1">
            {profile.ai_summary}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Column Profiles - Comprehensive Statistics
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Column</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Count</strong></TableCell>
                <TableCell><strong>Distinct</strong></TableCell>
                <TableCell><strong>Nulls</strong></TableCell>
                <TableCell><strong>Completeness</strong></TableCell>
                <TableCell><strong>Sparsity</strong></TableCell>
                <TableCell><strong>Min</strong></TableCell>
                <TableCell><strong>Max</strong></TableCell>
                <TableCell><strong>Avg</strong></TableCell>
                <TableCell><strong>Format</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columnProfiles.map(([name, col]) => (
                <TableRow key={name}>
                  <TableCell><strong>{name}</strong></TableCell>
                  <TableCell>
                    <Chip label={col.dataType || 'string'} size="small" />
                  </TableCell>
                  <TableCell>{col.count?.toLocaleString()}</TableCell>
                  <TableCell>{col.distinctCount?.toLocaleString()}</TableCell>
                  <TableCell>{col.nullCount || 0}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={parseFloat(col.completeness) >= 80 ? 'success.main' : 'warning.main'}
                    >
                      {col.completeness}%
                    </Typography>
                  </TableCell>
                  <TableCell>{col.sparsity}%</TableCell>
                  <TableCell>{col.min !== undefined ? col.min : 'N/A'}</TableCell>
                  <TableCell>{col.max !== undefined ? col.max : 'N/A'}</TableCell>
                  <TableCell>{col.avg || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={col.format || 'text'} size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Profile



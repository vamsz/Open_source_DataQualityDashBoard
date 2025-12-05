import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  BarChart,
  Delete,
  Visibility,
  CheckCircle,
  Block,
  VerticalAlignCenter,
  Lock,
  Edit,
  Info,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material'
import { issueService, remediationService, dataService } from '../services/apiService'
import { useSnackbar } from 'notistack'

const iconMap = {
  bar_chart: BarChart,
  delete: Delete,
  visibility: Visibility,
  check_circle: CheckCircle,
  block: Block,
  'vertical_align_center': VerticalAlignCenter,
  '#': () => <Typography sx={{ fontSize: 24, fontWeight: 'bold' }}>#</Typography>,
  mask: Lock
}

function IssueDetails() {
  const { issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [remediationOptions, setRemediationOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [cleanedStatus, setCleanedStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [overrideSeverity, setOverrideSeverity] = useState('')
  const [overrideScore, setOverrideScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadIssueDetails()
  }, [issueId])

  const loadIssueDetails = async () => {
    try {
      const issueRes = await issueService.getIssue(issueId)
      setIssue(issueRes.data.issue)
      
      const [suggestionsRes, cleanedRes] = await Promise.all([
        remediationService.getSuggestions(issueId),
        dataService.getCleanedStatus(issueRes.data.issue.table_id).catch(() => ({ data: null }))
      ])
      
      setRemediationOptions(suggestionsRes.data.suggestions?.options || [])
      setCleanedStatus(cleanedRes?.data || null)
    } catch (error) {
      console.error('Failed to load issue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteRemediation = async () => {
    if (!selectedOption || !issue?.table_id) return
    
    try {
      setExecuting(true)
      const res = await dataService.applyManualRemediation(issue.table_id, issue.id, selectedOption.id)
      
      if (res.data?.success) {
        enqueueSnackbar(`Successfully applied: ${selectedOption.title}`, { variant: 'success' })
        // Refresh data
        const status = await dataService.getCleanedStatus(issue.table_id)
        setCleanedStatus(status.data)
        setSelectedOption(null)
      } else {
        enqueueSnackbar(res.data?.message || 'Remediation failed', { variant: 'error' })
      }
    } catch (e) {
      enqueueSnackbar('Failed to execute remediation', { variant: 'error' })
    } finally {
      setExecuting(false)
    }
  }

  const handleExportCleaned = async () => {
    try {
      const resp = await dataService.getCleanedStatus(issue.table_id)
      if (!resp.data?.hasCleanedData) {
        enqueueSnackbar('No cleaned data yet. Apply remediation first.', { variant: 'info' })
        return
      }
      const dl = await dataService.exportCleanedTable(issue.table_id, 'csv')
      const blob = new Blob([dl.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${issue?.Table?.name || 'table'}_CLEANED.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      enqueueSnackbar('Downloaded cleaned CSV', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar('Failed to export cleaned data', { variant: 'error' })
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'error',
      medium: 'warning',
      low: 'success'
    }
    return colors[severity] || 'default'
  }

  const getScoreColor = (score) => {
    if (score >= 0.70) return '#f44336' // High - red
    if (score >= 0.35) return '#ff9800' // Medium - orange
    return '#4caf50' // Low - green
  }

  const handleOverride = async () => {
    if (!overrideSeverity && !overrideScore) {
      enqueueSnackbar('Please select severity or enter a score', { variant: 'warning' })
      return
    }

    try {
      const score = overrideScore ? parseFloat(overrideScore) : undefined
      await issueService.overrideScore(issueId, overrideSeverity || undefined, score, overrideReason)
      enqueueSnackbar('Override applied successfully', { variant: 'success' })
      setOverrideDialogOpen(false)
      setOverrideSeverity('')
      setOverrideScore('')
      setOverrideReason('')
      loadIssueDetails()
    } catch (error) {
      enqueueSnackbar('Failed to apply override', { variant: 'error' })
    }
  }

  const handleRemoveOverride = async () => {
    if (!window.confirm('Remove manual override and recalculate score?')) return

    try {
      await issueService.removeOverride(issueId)
      enqueueSnackbar('Override removed, score recalculated', { variant: 'success' })
      loadIssueDetails()
    } catch (error) {
      enqueueSnackbar('Failed to remove override', { variant: 'error' })
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
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {issue?.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={issue?.issue_type} size="small" sx={{ borderRadius: 0 }} />
              <Chip 
                label={issue?.severity?.toUpperCase()} 
                color={getSeverityColor(issue?.severity)} 
                size="small" 
                sx={{ borderRadius: 0, fontWeight: 600 }}
              />
              <Chip label={issue?.status} size="small" sx={{ borderRadius: 0 }} />
              {issue?.manual_override && (
                <Chip 
                  label="Manual Override" 
                  color="info" 
                  size="small" 
                  sx={{ borderRadius: 0 }}
                />
              )}
            </Box>
          </Box>

          {/* Scoring Section */}
          {issue?.score !== undefined && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 0, backgroundColor: '#fafafa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Issue Score
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => {
                      setOverrideSeverity(issue.severity)
                      setOverrideScore(issue.score.toFixed(3))
                      setOverrideDialogOpen(true)
                    }}
                    sx={{ borderRadius: 0 }}
                  >
                    Override
                  </Button>
                  {issue?.manual_override && (
                    <Button
                      size="small"
                      color="error"
                      onClick={handleRemoveOverride}
                      sx={{ borderRadius: 0 }}
                    >
                      Remove Override
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Score Display */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      color: getScoreColor(issue.score),
                      mb: 1
                    }}>
                      {(issue.score * 100).toFixed(1)}%
                    </Typography>
                    <Chip
                      label={issue.severity.toUpperCase()}
                      color={getSeverityColor(issue.severity)}
                      sx={{ borderRadius: 0, fontWeight: 600 }}
                    />
                    {issue?.manual_override && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Overridden: {issue.manual_override.reason}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Contributing Factors */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Contributing Factors
                  </Typography>
                  {issue?.score_details?.contributingFactors?.length > 0 ? (
                    <List dense sx={{ p: 0 }}>
                      {issue.score_details.contributingFactors.map((factor, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {factor.isDecay ? (
                              <TrendingDown color="warning" fontSize="small" />
                            ) : (
                              <TrendingUp color="error" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={factor.factor}
                            secondary={`${factor.boost > 0 ? '+' : ''}${(factor.boost * 100).toFixed(1)}%`}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No special factors
                    </Typography>
                  )}
                </Grid>

                {/* Calculation Details */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Calculation
                  </Typography>
                  {issue?.score_details?.calculation && (
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                        Impact: {issue.score_details.impact}/5
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                        Frequency: {issue.score_details.frequency}/5
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                        Scope: {issue.score_details.scope}/5
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5, fontFamily: 'monospace' }}>
                        {issue.score_details.calculation.baseFormula}
                      </Typography>
                      {issue.score_details.boosts > 0 && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                          Boosts: +{issue.score_details.boosts.toFixed(2)}
                        </Typography>
                      )}
                      {issue.score_details.decayFactor < 1.0 && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                          Decay: ×{issue.score_details.decayFactor.toFixed(2)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 600 }}>
                        Final: {issue.score_details.calculation.finalFormula}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Score Bar */}
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={issue.score * 100}
                  sx={{
                    height: 8,
                    borderRadius: 0,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(issue.score),
                      borderRadius: 0
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">Low (&lt;35%)</Typography>
                  <Typography variant="caption" color="textSecondary">Medium (35-69%)</Typography>
                  <Typography variant="caption" color="textSecondary">High (≥70%)</Typography>
                </Box>
              </Box>
            </Paper>
          )}
          {cleanedStatus?.hasCleanedData && (
            <Button 
              variant="outlined" 
              onClick={handleExportCleaned}
              sx={{ borderRadius: 0 }}
            >
              Export Cleaned Data
            </Button>
          )}
        </Box>

        {/* Issue Details */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                TABLE
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {issue?.Table?.name || issue?.Table?.display_name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                COLUMN
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {issue?.column_name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {issue?.issue_type === 'missing' || issue?.issue_type === 'null' 
                  ? 'NULL ROWS FOUND' 
                  : issue?.issue_type === 'duplicate'
                  ? 'DUPLICATE ROWS FOUND'
                  : 'AFFECTED ROWS'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {issue?.record_count || issue?.affected_rows?.length || 0} rows
              </Typography>
            </Grid>
          </Grid>

          {issue?.description && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                {issue.description}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Manual Remediation Options */}
      {remediationOptions.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Manual Remediation Options
          </Typography>
          
          <Grid container spacing={2}>
            {remediationOptions.map((option) => {
              const IconComponent = iconMap[option.icon] || Visibility
              const isSelected = selectedOption?.id === option.id
              
              return (
                <Grid item xs={12} md={6} key={option.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #424242' : '1px solid #e0e0e0',
                      borderRadius: 0,
                      backgroundColor: isSelected ? '#f5f5f5' : '#ffffff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#424242',
                        backgroundColor: '#fafafa'
                      }
                    }}
                    onClick={() => setSelectedOption(option)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: isSelected ? '#424242' : '#e0e0e0',
                          borderRadius: 0,
                          color: isSelected ? '#ffffff' : '#424242'
                        }}>
                          <IconComponent />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {option.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {option.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            {option.example}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={!selectedOption || executing}
              onClick={handleExecuteRemediation}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 0,
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#43a047'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {executing ? 'Executing...' : 'Execute Remediation'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Applied Changes History */}
      {cleanedStatus?.hasCleanedData && cleanedStatus.remediationLog && cleanedStatus.remediationLog.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Applied Changes
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Fixes Applied:</strong> {cleanedStatus.fixesApplied} • {' '}
              <strong>Last Cleaned:</strong> {cleanedStatus.lastCleaned ? new Date(cleanedStatus.lastCleaned).toLocaleString() : '—'}
            </Typography>
          </Box>

          {cleanedStatus.remediationLog[0]?.details && cleanedStatus.remediationLog[0].details.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Column</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Before</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>After</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cleanedStatus.remediationLog[0].details.slice(0, 20).map((chg, i) => (
                    <TableRow key={i}>
                      <TableCell>{chg.row}</TableCell>
                      <TableCell>{chg.column}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="error">
                          {String(chg.before || 'NULL')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="success.main">
                          {String(chg.after || 'NULL')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{chg.reason}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Manual Override Dialog */}
      <Dialog
        open={overrideDialogOpen}
        onClose={() => {
          setOverrideDialogOpen(false)
          setOverrideSeverity('')
          setOverrideScore('')
          setOverrideReason('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, borderRadius: 0 }}>
          Manual Override Score
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              select
              label="Severity"
              value={overrideSeverity}
              onChange={(e) => setOverrideSeverity(e.target.value)}
              sx={{ mb: 2, borderRadius: 0 }}
              SelectProps={{
                native: true
              }}
            >
              <option value="">Auto (based on score)</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </TextField>

            <TextField
              fullWidth
              label="Score (0.0 - 1.0)"
              type="number"
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
              inputProps={{ min: 0, max: 1, step: 0.001 }}
              helperText="Enter a score between 0 and 1. If left empty, severity will be used."
              sx={{ mb: 2, borderRadius: 0 }}
            />

            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why you're overriding the calculated score..."
              sx={{ borderRadius: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderRadius: 0 }}>
          <Button
            onClick={() => {
              setOverrideDialogOpen(false)
              setOverrideSeverity('')
              setOverrideScore('')
              setOverrideReason('')
            }}
            sx={{ borderRadius: 0 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOverride}
            variant="contained"
            sx={{
              borderRadius: 0,
              backgroundColor: '#424242',
              '&:hover': { backgroundColor: '#212121' }
            }}
          >
            Apply Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default IssueDetails

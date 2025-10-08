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
  TableRow
} from '@mui/material'
import { issueService, remediationService } from '../services/apiService'
import { useSnackbar } from 'notistack'

function IssueDetails() {
  const { issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    loadIssueDetails()
  }, [issueId])

  const loadIssueDetails = async () => {
    try {
      const [issueRes, suggestionsRes] = await Promise.all([
        issueService.getIssue(issueId),
        remediationService.getSuggestions(issueId)
      ])
      setIssue(issueRes.data.issue)
      setSuggestions(suggestionsRes.data)
    } catch (error) {
      console.error('Failed to load issue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    try {
      await issueService.updateStatus(issueId, 'resolved')
      enqueueSnackbar('Issue marked as resolved', { variant: 'success' })
      loadIssueDetails()
    } catch (error) {
      enqueueSnackbar('Failed to resolve issue', { variant: 'error' })
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
            {issue?.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={issue?.issue_type} size="small" />
            <Chip label={issue?.severity} color="error" size="small" />
            <Chip label={issue?.status} size="small" />
          </Box>
        </div>
        <Box>
          {issue?.status === 'open' && (
            <Button variant="contained" onClick={handleResolve}>
              Mark as Resolved
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {issue?.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Impact
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Affected Records: {issue?.record_count}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Impact Score: {issue?.impact_score}%
            </Typography>
            {issue?.column_name && (
              <Typography variant="body2" color="textSecondary">
                Column: <strong>{issue.column_name}</strong>
              </Typography>
            )}
            
            {issue?.affected_rows && issue.affected_rows.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Affected Rows:
                </Typography>
                <Chip 
                  label={Array.isArray(issue.affected_rows) 
                    ? issue.affected_rows.slice(0, 10).join(', ') + (issue.affected_rows.length > 10 ? '...' : '')
                    : issue.affected_rows
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
            
            {issue?.example_bad_values && issue.example_bad_values.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="error" gutterBottom>
                  Example Bad Values:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {issue.example_bad_values.map((val, i) => (
                    <Chip 
                      key={i}
                      label={String(val)}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {issue?.expected_format && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="success.main">
                  Expected Format: <strong>{issue.expected_format}</strong>
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🤖 AI-Powered Remediation Suggestions
            </Typography>
            
            {!suggestions?.suggestions && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Loading AI suggestions...
                </Typography>
              </Box>
            )}
            
            {suggestions?.suggestions?.aiRecommendation && (
              <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    💡 Expert Recommendation:
                  </Typography>
                  <Typography variant="body1">
                    {suggestions.suggestions.aiRecommendation}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {suggestions?.suggestions?.actions?.map((action, idx) => (
              <Card key={idx} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {action.description}
                    </Typography>
                    <Chip 
                      label={action.type} 
                      color={action.type === 'automated' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip label={`Effort: ${action.effort}`} size="small" sx={{ mr: 1 }} />
                    <Chip label={`Risk: ${action.riskLevel || 'low'}`} size="small" color={action.riskLevel === 'high' ? 'error' : 'default'} />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>Impact:</strong> {action.impact}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Steps to Implement:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    {action.steps?.map((step, i) => (
                      <li key={i}>
                        <Typography variant="body2">{step}</Typography>
                      </li>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant={action.automatable ? 'contained' : 'outlined'} 
                      size="small"
                      disabled={!action.automatable}
                    >
                      {action.automatable ? 'Apply Automatically' : 'Manual Action Required'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {suggestions?.suggestions?.preventionTips && (
              <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    🛡️ Prevention Tips:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    {suggestions.suggestions.preventionTips.map((tip, i) => (
                      <li key={i}>
                        <Typography variant="body2">{tip}</Typography>
                      </li>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {suggestions?.suggestions?.rowLevelFixes && suggestions.suggestions.rowLevelFixes.length > 0 && (
              <Card sx={{ mt: 3, bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    🔧 Row-Level Fixes (AI Suggested):
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Row</strong></TableCell>
                        <TableCell><strong>Column</strong></TableCell>
                        <TableCell><strong>Current</strong></TableCell>
                        <TableCell><strong>Fix To</strong></TableCell>
                        <TableCell><strong>Reason</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suggestions.suggestions.rowLevelFixes.slice(0, 10).map((fix, i) => (
                        <TableRow key={i}>
                          <TableCell>{fix.row}</TableCell>
                          <TableCell><Chip label={fix.column} size="small" /></TableCell>
                          <TableCell>
                            <Chip label={String(fix.currentValue)} color="error" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={String(fix.suggestedValue)} color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{fix.reason}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {suggestions.suggestions.rowLevelFixes.length > 10 && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Showing 10 of {suggestions.suggestions.rowLevelFixes.length} fixes
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
            
            {suggestions?.suggestions?.estimatedResolutionTime && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                ⏱️ Estimated Resolution Time: {suggestions.suggestions.estimatedResolutionTime}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Detected
              </Typography>
              <Typography variant="body1">
                {new Date(issue?.detected_at).toLocaleString()}
              </Typography>
            </Box>
            {issue?.resolved_at && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Resolved
                </Typography>
                <Typography variant="body1">
                  {new Date(issue.resolved_at).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default IssueDetails



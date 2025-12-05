import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Card,
  CardContent,
  Avatar,
  Stack,
  Fade
} from '@mui/material'
import { 
  CloudUpload, 
  Delete, 
  CheckCircle, 
  InsertDriveFile,
  Description,
  TableChart,
  UploadFile,
  Folder
} from '@mui/icons-material'
import { dataService } from '../services/apiService'

function Upload() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      processFiles(droppedFiles)
    }
  }

  const processFiles = (selectedFiles) => {
    const validTypes = ['.csv', '.xls', '.xlsx']
    const validFiles = []

    for (const file of selectedFiles) {
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!validTypes.includes(fileExt)) {
        enqueueSnackbar(`${file.name}: Invalid file type`, { variant: 'error' })
        continue
      }
      
      if (file.size > 50 * 1024 * 1024) {
        enqueueSnackbar(`${file.name}: File too large (max 50MB)`, { variant: 'error' })
        continue
      }
      
      validFiles.push(file)
    }

    // Add new files to existing ones (avoid duplicates)
    setFiles(prevFiles => {
      const existingNames = new Set(prevFiles.map(f => f.name))
      const newFiles = validFiles.filter(f => !existingNames.has(f.name))
      return [...prevFiles, ...newFiles]
    })
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return
    processFiles(selectedFiles)
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (files.length === 0) {
      enqueueSnackbar('Please select at least one file', { variant: 'error' })
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Always use multiple file upload
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await dataService.uploadMultipleFiles(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        }
      )

      enqueueSnackbar(
        `Uploaded ${response.data.uploaded} of ${response.data.total} files!`,
        { variant: 'success' }
      )
      navigate('/tables')
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'Upload failed',
        { variant: 'error' }
      )
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: '#212121'
            }}>
              Upload Multiple Files
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 2 }}>
              Upload multiple CSV and Excel files at once - each file becomes a separate table
            </Typography>
            
            {/* Features */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {[
                { icon: <TableChart />, text: 'Automatic profiling' },
                { icon: <Description />, text: 'Quality detection' },
                { icon: <CheckCircle />, text: 'AI remediation' }
              ].map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#424242',
                    '& svg': { fontSize: 18 }
                  }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Upload Form */}
      <Paper sx={{ 
        p: 4, 
        maxWidth: 900,
        mx: 'auto',
        borderRadius: 0,
        background: '#ffffff',
        border: '1px solid #e0e0e0'
      }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Drag and Drop Area */}
          <Box
            sx={{
              border: `2px dashed ${dragActive ? '#424242' : '#bdbdbd'}`,
              borderRadius: 0,
              p: 6,
              textAlign: 'center',
              mb: 4,
              cursor: 'pointer',
              position: 'relative',
              background: dragActive 
                ? '#f5f5f5'
                : files.length > 0 
                  ? '#f1f8e9'
                  : 'transparent',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: '#fafafa',
                borderColor: '#424242'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".csv,.xls,.xlsx"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <Fade in={!dragActive && files.length === 0}>
              <Box>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  background: '#424242',
                  borderRadius: 0
                }}>
                  <CloudUpload sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Drop files here to upload
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  or click to browse from your computer
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                  <Chip label="CSV" variant="outlined" size="small" />
                  <Chip label="XLS" variant="outlined" size="small" />
                  <Chip label="XLSX" variant="outlined" size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Upload up to 10 files, 50MB each
                </Typography>
              </Box>
            </Fade>

            <Fade in={dragActive}>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80,
                  background: '#4caf50',
                  borderRadius: 0
                }}>
                  <UploadFile sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
            </Fade>

            <Fade in={files.length > 0 && !dragActive}>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'success.main'
                  }}>
                    <CheckCircle sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {files.length} file{files.length > 1 ? 's' : ''} ready to upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click here to add more files
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* File List */}
          {files.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Folder color="primary" />
                Selected Files ({files.length})
              </Typography>
              <Stack spacing={2}>
                {files.map((file, index) => (
                  <Card key={index} sx={{ 
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': uploading ? {} : { 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: file.name.endsWith('.csv') ? 'success.main' : 'info.main',
                            width: 48,
                            height: 48
                          }}>
                            <InsertDriveFile />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📦 {(file.size / 1024 / 1024).toFixed(2)} MB • 
                              📄 {file.name.endsWith('.csv') ? 'CSV File' : 'Excel File'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {uploading ? (
                            <Chip 
                              icon={<CheckCircle />} 
                              label="Uploading..." 
                              color="primary" 
                              variant="outlined"
                            />
                          ) : (
                            <IconButton 
                              color="error" 
                              onClick={() => removeFile(index)}
                              sx={{ 
                                transition: 'background-color 0.2s ease',
                                borderRadius: 0,
                                '&:hover': { 
                                  bgcolor: '#ffebee'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}


          {/* Upload Progress */}
          {uploading && (
            <Card sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#424242', width: 40, height: 40, borderRadius: 0 }}>
                  <UploadFile />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Uploading {files.length} file{files.length > 1 ? 's' : ''}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processing and analyzing your data
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#424242' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{ 
                  height: 8, 
                  borderRadius: 0,
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': { borderRadius: 0 }
                }}
              />
            </Card>
          )}

          {/* Submit Button */}
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={files.length === 0 || uploading}
              size="large"
              sx={{ 
                py: 2,
                borderRadius: 0,
                fontSize: '1.1rem',
                fontWeight: 500,
                background: '#424242',
                '&:hover': {
                  background: '#616161'
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {uploading 
                ? `Processing ${files.length} file${files.length > 1 ? 's' : ''}...` 
                : files.length === 0
                  ? 'Select files to upload'
                  : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
            </Button>
          </Stack>

          {/* Info Alert */}
          {files.length > 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: 0,
                bgcolor: '#e3f2fd',
                border: '1px solid #90caf9'
              }}
            >
              <Typography variant="body2">
                <strong>Batch Upload:</strong> Each file will be uploaded as a separate table using its filename as the table name.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default Upload



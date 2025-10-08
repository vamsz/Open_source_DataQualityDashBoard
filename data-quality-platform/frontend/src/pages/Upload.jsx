import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material'
import { CloudUpload, Delete, CheckCircle } from '@mui/icons-material'
import { dataService } from '../services/apiService'

function Upload() {
  const [files, setFiles] = useState([])
  const [multipleMode, setMultipleMode] = useState(false)
  const [tableName, setTableName] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    if (selectedFiles.length === 0) return

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

    if (multipleMode) {
      setFiles(validFiles)
    } else if (validFiles.length > 0) {
      setFiles([validFiles[0]])
      if (!tableName) {
        setTableName(validFiles[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
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
      if (multipleMode && files.length > 1) {
        // Multiple file upload
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
      } else {
        // Single file upload
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('tableName', tableName)
        formData.append('description', description)

        const response = await dataService.uploadFile(
          formData,
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percentCompleted)
          }
        )

        enqueueSnackbar('File uploaded successfully!', { variant: 'success' })
        navigate(`/tables`)
      }
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Upload Data
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Upload CSV or Excel files for quality analysis
          </Typography>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={multipleMode}
              onChange={(e) => {
                setMultipleMode(e.target.checked)
                setFiles([])
                setTableName('')
              }}
              disabled={uploading}
            />
          }
          label="Multiple Files Mode"
        />
      </Box>

      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              mb: 3,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              hidden
              accept=".csv,.xls,.xlsx"
              multiple={multipleMode}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {files.length > 0 
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected` 
                : 'Click to upload or drag and drop'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {multipleMode 
                ? 'Select multiple CSV or Excel files (max 10 files, 50MB each)'
                : 'CSV or Excel files (max 50MB)'}
            </Typography>
          </Box>

          {files.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              <List dense>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      !uploading && (
                        <IconButton edge="end" onClick={() => removeFile(index)}>
                          <Delete />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                    {uploading && <CheckCircle color="success" sx={{ mr: 2 }} />}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {!multipleMode && files.length === 1 && (
            <>
              <TextField
                fullWidth
                label="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
                disabled={uploading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                disabled={uploading}
                sx={{ mb: 3 }}
              />
            </>
          )}

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Uploading... {progress}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={files.length === 0 || uploading}
            size="large"
          >
            {uploading 
              ? `Uploading ${files.length} file${files.length > 1 ? 's' : ''}...` 
              : `Upload ${files.length > 0 ? files.length : ''} ${files.length > 1 ? 'Files' : 'File'}`}
          </Button>

          {multipleMode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Each file will be uploaded as a separate table with its filename as the table name.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default Upload


